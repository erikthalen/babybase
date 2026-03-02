import type { DatabaseSync } from "node:sqlite";
import { Hono } from "hono";
import { createDb } from "./db/client.ts";
import { createBackupsRouter } from "./features/backups/router.ts";
import { createMigrationsRouter } from "./features/migrations/router.ts";
import { createSchemaRouter } from "./features/schema/router.ts";
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
    migrationsDir: config.migrationsDir ?? "./migrations",
    backupsDir: config.backupsDir ?? "./backups",
  };

  let db = createDb(resolved.database);
  const reconnectDb = () => {
    db = createDb(resolved.database);
  };

  const app = new Hono<AppEnv>();

  // Inject db and config into every request
  app.use("*", async (c, next) => {
    c.set("db", db);
    c.set("config", resolved);
    await next();
  });

  app.get("/", (c) =>
    c.redirect(`${resolved.basePath.replace(/\/$/, "")}/tables`),
  );

  app.route("/tables", createTablesRouter());
  app.route("/schema", createSchemaRouter());
  app.route("/migrations", createMigrationsRouter());
  app.route("/backups", createBackupsRouter(reconnectDb));

  // Graceful shutdown handler
  function shutdown() {
    console.log("Closing database...");
    try {
      db.close(); // synchronous
      console.log("Database closed.");
    } catch (err) {
      console.error("Error closing database:", err);
    }
    process.exit(0);
  }

  // Handle termination signals
  process.on("SIGINT", shutdown); // Ctrl+C
  process.on("SIGTERM", shutdown); // Docker, PM2, etc.

  return app;
}

export type { PicobaseConfig };
