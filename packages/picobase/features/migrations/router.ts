import { Hono } from "hono";
import type { AppEnv } from "../../index.ts";
import { listTables } from "../../db/schema-queries.ts";
import {
  ensureMigrationsTable,
  getApplied,
  getFileMigrations,
  runMigration,
  saveMigration,
} from "./queries.ts";
import { migrationsView } from "./views.ts";
import { layout, nav } from "../../components/layout.ts";
import { respond, sseAction } from "../../components/sse.ts";

export function createMigrationsRouter(): Hono<AppEnv> {
  const app = new Hono<AppEnv>();

  app.get("/", async (c) => {
    const db = c.get("db");
    const config = c.get("config");
    const base = config.basePath.replace(/\/$/, "");
    ensureMigrationsTable(db);
    const tables = listTables(db);
    const files = getFileMigrations(config.migrationsDir);
    const applied = getApplied(db);
    const content = migrationsView({ files, applied, basePath: base });
    const navHtml = nav({
      basePath: base,
      activeSection: "migrations",
      tables,
    });
    return respond(c, {
      fullPage: () => layout({ title: "Migrations", nav: navHtml, content }),
      fragment: () => `<main id="main">${content}</main>`,
    });
  });

  // Save new migration file
  app.post("/", async (c) => {
    const db = c.get("db");
    const config = c.get("config");
    const body = (await c.req.json()) as Record<string, string>;
    const filename = String(body.filename);
    const sql = String(body.sql);
    console.log("migration", filename, sql);
    saveMigration(config.migrationsDir, filename, sql);
    ensureMigrationsTable(db);
    const base = config.basePath.replace(/\/$/, "");
    const files = getFileMigrations(config.migrationsDir);
    const applied = getApplied(db);
    return sseAction(c, async ({ patchElements }) => {
      await patchElements(
        `<main id="main">${migrationsView({ files, applied, basePath: base })}</main>`,
      );
    });
  });

  // Save and immediately run
  app.post("/save-and-run", async (c) => {
    const db = c.get("db");
    const config = c.get("config");
    const body = await c.req.parseBody();
    const filename = String(body.filename);
    const sql = String(body.sql);
    ensureMigrationsTable(db);
    saveMigration(config.migrationsDir, filename, sql);
    runMigration(db, config.migrationsDir, filename);
    const base = config.basePath.replace(/\/$/, "");
    const files = getFileMigrations(config.migrationsDir);
    const applied = getApplied(db);
    return sseAction(c, async ({ patchElements }) => {
      await patchElements(
        `<main id="main">${migrationsView({ files, applied, basePath: base })}</main>`,
      );
    });
  });

  // Run all pending migrations in order
  app.post("/run-all", async (c) => {
    const db = c.get("db");
    const config = c.get("config");
    ensureMigrationsTable(db);
    const files = getFileMigrations(config.migrationsDir);
    const applied = new Set(getApplied(db));
    for (const f of files) {
      if (!applied.has(f.name)) runMigration(db, config.migrationsDir, f.name);
    }
    const base = config.basePath.replace(/\/$/, "");
    const updatedFiles = getFileMigrations(config.migrationsDir);
    const updatedApplied = getApplied(db);
    return sseAction(c, async ({ patchElements }) => {
      await patchElements(
        `<main id="main">${migrationsView({ files: updatedFiles, applied: updatedApplied, basePath: base })}</main>`,
      );
    });
  });

  // Run a single pending migration by filename
  // MUST be registered after /run-all and /save-and-run to avoid param capture
  app.post("/:name/run", async (c) => {
    const db = c.get("db");
    const config = c.get("config");
    const name = decodeURIComponent(c.req.param("name"));
    ensureMigrationsTable(db);
    runMigration(db, config.migrationsDir, name);
    const base = config.basePath.replace(/\/$/, "");
    const files = getFileMigrations(config.migrationsDir);
    const applied = getApplied(db);
    return sseAction(c, async ({ patchElements }) => {
      await patchElements(
        `<main id="main">${migrationsView({ files, applied, basePath: base })}</main>`,
      );
    });
  });

  return app;
}
