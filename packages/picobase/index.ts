import { dirname } from "node:path";
import type { DatabaseSync } from "node:sqlite";
import { Hono } from "hono";
import { createDb } from "./db/client.ts";
import { createMigrationsRouter } from "./features/migrations/router.ts";
import { createSchemaRouter } from "./features/schema/router.ts";
import { readSettings, writeSettings } from "./features/storage/queries.ts";
import { createStorageRouter } from "./features/storage/router.ts";
import { createTablesRouter } from "./features/tables/router.ts";
import type { PicobaseConfig } from "./types.ts";

export type AppEnv = {
  Variables: {
    db: DatabaseSync;
    config: Required<PicobaseConfig>;
  };
};

export function definePicobase(config: PicobaseConfig): Hono<AppEnv> {
  const resolved: Required<PicobaseConfig> = {
    database: config.database,
    basePath: config.basePath ?? "/",
    migrationsDir: config.migrationsDir ?? "./.picobase/migrations",
    storageDir: config.storageDir ?? "./.picobase/storage",
  };

  const originalDatabase = config.database;
  const picobaseDir = dirname(resolved.storageDir);

  // Override active database if a settings file exists from a previous mount
  const settings = readSettings(picobaseDir);
  if (settings.activeDatabase) {
    resolved.database = settings.activeDatabase;
  }

  let db = createDb(resolved.database);

  const mountDb = (newPath: string) => {
    try {
      db.close();
    } catch {
      /* already closed */
    }
    resolved.database = newPath;
    db = createDb(newPath);
    writeSettings(picobaseDir, { activeDatabase: newPath });
  };

  const app = new Hono<AppEnv>();

  // Inject db and config into every request
  app.use("*", async (c, next) => {
    c.set("db", db);
    c.set("config", resolved);
    await next();
  });

  app.get("/", (c) =>
    c.redirect(`${resolved.basePath.replace(/\/$/, "")}/schema`),
  );

  app.route("/tables", createTablesRouter());
  app.route("/schema", createSchemaRouter());
  app.route("/migrations", createMigrationsRouter());
  app.route("/storage", createStorageRouter({ originalDatabase, mountDb }));

  // Graceful shutdown handler
  function shutdown() {
    console.log("Closing database...");
    try {
      db.close();
      console.log("Database closed.");
    } catch (err) {
      console.error("Error closing database:", err);
    }
    process.exit(0);
  }

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  return app;
}

export type { PicobaseConfig };
