import { Hono } from "hono";
import { layout, nav, toastHtml } from "../../components/layout.ts";
import { respond, sseAction } from "../../components/sse.ts";
import { listTables } from "../../db/schema-queries.ts";
import type { AppEnv } from "../../index.ts";
import {
  deleteMigration,
  ensureMigrationsTable,
  getApplied,
  getFileMigrations,
  getMigrationSql,
  runMigration,
  saveMigration,
} from "./queries.ts";
import { highlightSql } from "@babybase/ui";
import { migrationsView } from "./views.ts";
import { html } from "hono/html";
import { type HtmlEscapedString } from "hono/utils/html";

export function createMigrationsRouter(): Hono<AppEnv> {
  const app = new Hono<AppEnv>();

  app.get("/", async (c) => {
    const db = c.get("db")!;
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
      readonly: config.readonly,
    });
    return respond(c, {
      fullPage: () => layout({ title: "Migrations", nav: navHtml, content }),
      fragment: () => html`<main id="main">${content}</main>`,
    });
  });

  // Save new migration file
  app.post("/", async (c) => {
    const db = c.get("db")!;
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
        html`<main id="main">
          ${migrationsView({ files, applied, basePath: base })}
        </main>`,
      );
    });
  });

  // Save and immediately run
  app.post("/save-and-run", async (c) => {
    const db = c.get("db")!;
    const config = c.get("config");
    const body = (await c.req.json()) as Record<string, string>;
    const filename = String(body.filename);
    const sql = String(body.sql);
    ensureMigrationsTable(db);
    saveMigration(config.migrationsDir, filename, sql);
    let errorMsg: HtmlEscapedString | Promise<HtmlEscapedString> | null = null;
    try {
      runMigration(db, config.migrationsDir, filename);
    } catch (err) {
      errorMsg = html`${err instanceof Error ? err.message : err}`;
    }
    const base = config.basePath.replace(/\/$/, "");
    const files = getFileMigrations(config.migrationsDir);
    const applied = getApplied(db);
    return sseAction(c, async ({ patchElements }) => {
      await patchElements(
        html`<main id="main">
          ${migrationsView({ files, applied, basePath: base })}
        </main>`,
      );
      if (errorMsg) {
        await patchElements(toastHtml("Migration failed", errorMsg, "error"), {
          selector: "#toast-container",
          mode: "prepend",
        });
      }
    });
  });

  // Run all pending migrations in order
  app.post("/run-all", async (c) => {
    const db = c.get("db")!;
    const config = c.get("config");
    ensureMigrationsTable(db);
    const files = getFileMigrations(config.migrationsDir);
    const applied = new Set(getApplied(db));
    let errorMsg: HtmlEscapedString | Promise<HtmlEscapedString> | null = null;
    for (const f of files) {
      if (!applied.has(f.name)) {
        try {
          runMigration(db, config.migrationsDir, f.name);
        } catch (err) {
          errorMsg = html`<code>${f.name}</code>:
            ${err instanceof Error ? err.message : String(err)}`;
          break;
        }
      }
    }
    const base = config.basePath.replace(/\/$/, "");
    const updatedFiles = getFileMigrations(config.migrationsDir);
    const updatedApplied = getApplied(db);
    return sseAction(c, async ({ patchElements }) => {
      await patchElements(
        html`<main id="main">
          ${migrationsView({
            files: updatedFiles,
            applied: updatedApplied,
            basePath: base,
          })}
        </main>`,
      );
      if (errorMsg) {
        await patchElements(toastHtml("Migration failed", errorMsg, "error"), {
          selector: "#toast-container",
          mode: "prepend",
        });
      }
    });
  });

  // Run a single pending migration by filename
  // MUST be registered after /run-all and /save-and-run to avoid param capture
  app.post("/:name/run", async (c) => {
    const db = c.get("db")!;
    const config = c.get("config");
    const name = decodeURIComponent(c.req.param("name"));
    ensureMigrationsTable(db);
    let errorMsg: HtmlEscapedString | Promise<HtmlEscapedString> | null = null;
    try {
      runMigration(db, config.migrationsDir, name);
    } catch (err) {
      errorMsg = html`${err instanceof Error ? err.message : String(err)}`;
    }
    const base = config.basePath.replace(/\/$/, "");
    const files = getFileMigrations(config.migrationsDir);
    const applied = getApplied(db);
    return sseAction(c, async ({ patchElements }) => {
      await patchElements(
        html`<main id="main">
          ${migrationsView({ files, applied, basePath: base })}
        </main>`,
      );
      if (errorMsg) {
        await patchElements(toastHtml("Migration failed", errorMsg, "error"), {
          selector: "#toast-container",
          mode: "prepend",
        });
      }
    });
  });

  // Delete a migration file and remove its applied record
  app.delete("/:name", async (c) => {
    const db = c.get("db")!;
    const config = c.get("config");
    const name = decodeURIComponent(c.req.param("name"));
    ensureMigrationsTable(db);
    deleteMigration(db, config.migrationsDir, name);
    const base = config.basePath.replace(/\/$/, "");
    const files = getFileMigrations(config.migrationsDir);
    const applied = getApplied(db);
    return sseAction(c, async ({ patchElements }) => {
      await patchElements(
        html`<main id="main">
          ${migrationsView({ files, applied, basePath: base })}
        </main>`,
      );
    });
  });

  // View SQL content of a migration file
  app.get("/:name", async (c) => {
    const config = c.get("config");
    const name = decodeURIComponent(c.req.param("name"));
    const sql = getMigrationSql(config.migrationsDir, name);
    const highlighted = highlightSql(sql);
    return sseAction(c, async ({ patchElements }) => {
      await patchElements(
        html`<div id="migration-sql-content">
          <pre class="migration-sql-pre">${highlighted}</pre>
        </div>`,
      );
    });
  });

  return app;
}
