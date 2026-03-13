import { dirname } from "node:path";
import type { DatabaseSync } from "node:sqlite";
import { Hono } from "hono";
import { createDb } from "./db/client.ts";
import { createMigrationsRouter } from "./features/migrations/router.ts";
import { createSchemaRouter } from "./features/schema/router.ts";
import { readSettings, writeSettings } from "./features/storage/queries.ts";
import { createStorageRouter } from "./features/storage/router.ts";
import { startAutoBackupScheduler } from "./features/storage/scheduler.ts";
import { createTablesRouter } from "./features/tables/router.ts";
import type { BabybaseConfig, S3Config } from "./types.ts";

export type AppEnv = {
  Variables: {
    db: DatabaseSync | null;
    config: {
      database: string | undefined;
      basePath: string;
      migrationsDir: string;
      storageDir: string;
      readonly: boolean;
    };
  };
};

export function defineBabybase(config: BabybaseConfig = {}): { app: Hono<AppEnv>; getDb: () => DatabaseSync | null } {
  const storageDir = typeof config.storage === "string"
    ? config.storage
    : "./.babybase/storage";
  const s3: S3Config | undefined = config.storage && typeof config.storage === "object"
    ? config.storage
    : undefined;

  const resolved: AppEnv["Variables"]["config"] = {
    database: config.database,
    basePath: config.basePath ?? "/",
    migrationsDir: config.migrationsDir ?? "./.babybase/migrations",
    storageDir,
    readonly: config.readonly ?? false,
  };

  const originalDatabase = config.database;
  const babybaseDir = dirname(resolved.storageDir);

  // Override active database if a settings file exists from a previous mount
  const settings = readSettings(babybaseDir);
  if (settings.activeDatabase) {
    resolved.database = settings.activeDatabase;
  }

  let db: DatabaseSync | null = null;
  let dbOpenError: string | undefined;
  let dbOpenFailedPath: string | undefined;
  if (resolved.database) {
    try {
      db = createDb(resolved.database);
    } catch (err) {
      dbOpenError = (err as Error).message;
      dbOpenFailedPath = resolved.database;
      console.warn(
        `\n⚠  Could not open database: ${resolved.database}\n   ${dbOpenError}\n   Starting without a database.\n`,
      );
    }
  }

  const mountDb = (newPath: string) => {
    try {
      db?.close();
    } catch {
      /* already closed */
    }
    resolved.database = newPath;
    db = createDb(newPath);
    const current = readSettings(babybaseDir);
    writeSettings(babybaseDir, { ...current, activeDatabase: newPath });
  };

  const unmountDb = () => {
    try {
      db?.close();
    } catch {
      /* already closed */
    }
    db = null;
    resolved.database = originalDatabase;
    const current = readSettings(babybaseDir);
    const { activeDatabase: _, ...rest } = current;
    writeSettings(babybaseDir, rest);
  };

  const app = new Hono<AppEnv>();

  // Inject db and config into every request
  app.use("*", async (c, next) => {
    c.set("db", db);
    c.set("config", resolved);
    await next();
  });

  // Redirect to /storage when no database is loaded
  app.use("*", async (c, next) => {
    if (db === null && !c.req.path.startsWith("/storage")) {
      return c.redirect(`${resolved.basePath.replace(/\/$/, "")}/storage`);
    }
    await next();
  });

  app.get("/", (c) => {
    const base = resolved.basePath.replace(/\/$/, "");
    return c.redirect(db === null ? `${base}/storage` : `${base}/schema`);
  });

  if (config.autoBackup) {
    startAutoBackupScheduler(
      config.autoBackup,
      () => resolved.database,
      resolved.storageDir,
      s3,
    );
  }

  app.route("/tables", createTablesRouter());
  app.route("/schema", createSchemaRouter());
  app.route("/migrations", createMigrationsRouter());
  app.route("/storage", createStorageRouter({ originalDatabase, mountDb, unmountDb, dbOpenError, dbOpenFailedPath, s3 }));

  // Graceful shutdown handler
  function shutdown() {
    if (db) {
      console.log("Closing database...");
      try {
        db.close();
        console.log("Database closed.");
      } catch (err) {
        console.error("Error closing database:", err);
      }
    }
    process.exit(0);
  }

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  return { app, getDb: () => db };
}

export type { BabybaseConfig, S3Config };
