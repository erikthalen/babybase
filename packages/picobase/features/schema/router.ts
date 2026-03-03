import { Hono } from "hono";
import type { AppEnv } from "../../index.ts";
import { listTables } from "../../db/schema-queries.ts";
import {
  getFullSchema,
  ensurePendingChangesTable,
  savePendingChanges,
  getAllPendingChanges,
  getPendingForTable,
  clearPendingChanges,
  generateDiffSQL,
  getForeignKeys,
} from "./queries.ts";
import type { DesiredColumn } from "./queries.ts";
import { getColumns } from "../tables/queries.ts";
import { schemaListView, erDiagramView } from "./views.ts";
import { layout, nav } from "../../components/layout.ts";
import { respond, sseAction } from "../../components/sse.ts";
import {
  editTableDialogContent,
  newEmptyColRow,
} from "./components/edit-table-dialog.ts";
import {
  saveMigration,
  ensureMigrationsTable,
  getFileMigrations,
} from "../migrations/queries.ts";

function getPendingColumnsMap(
  db: Parameters<typeof getAllPendingChanges>[0],
): Map<string, DesiredColumn[]> {
  return new Map(getAllPendingChanges(db).map((p) => [p.tableName, p.desiredColumns]));
}

function nextMigrationFilename(dir: string): string {
  const files = getFileMigrations(dir);
  const nums = files
    .map((f) => parseInt(f.name.split("_")[0] ?? "0"))
    .filter((n) => !isNaN(n));
  const next = nums.length > 0 ? Math.max(...nums) + 1 : 1;
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `${String(next).padStart(3, "0")}_edit_tables_${today}.sql`;
}

export function createSchemaRouter(): Hono<AppEnv> {
  const app = new Hono<AppEnv>();

  app.get("/", async (c) => {
    const db = c.get("db");
    const config = c.get("config");
    const base = config.basePath.replace(/\/$/, "");
    ensurePendingChangesTable(db);
    const tables = listTables(db);
    const schema = getFullSchema(db);
    const content = schemaListView(schema, base);
    const navHtml = nav({ basePath: base, activeSection: "schema", tables });
    return respond(c, {
      fullPage: () => layout({ title: "Schema", nav: navHtml, content }),
      fragment: () => `<main id="main">${content}</main>`,
    });
  });

  app.get("/diagram", async (c) => {
    const db = c.get("db");
    const config = c.get("config");
    const base = config.basePath.replace(/\/$/, "");
    ensurePendingChangesTable(db);
    const tables = listTables(db);
    const schema = getFullSchema(db);
    const pending = getPendingColumnsMap(db);
    const content = erDiagramView(schema, base, pending);
    const navHtml = nav({ basePath: base, activeSection: "schema", tables });
    return respond(c, {
      fullPage: () => layout({ title: "ER Diagram", nav: navHtml, content }),
      fragment: () => `<main id="main">${content}</main>`,
    });
  });

  app.post("/tables", async (c) => {
    const db = c.get("db");
    const config = c.get("config");
    const base = config.basePath.replace(/\/$/, "");
    ensurePendingChangesTable(db);
    let body: Record<string, string> = {};
    try {
      body = (await c.req.json()) as Record<string, string>;
    } catch {
      // malformed or missing body — treat as empty
    }
    const name = (body._tableName ?? "").trim();
    if (name) {
      db.exec(
        `CREATE TABLE IF NOT EXISTS ${JSON.stringify(name)} (id INTEGER PRIMARY KEY)`,
      );
    }
    const tables = listTables(db);
    const schema = getFullSchema(db);
    const pending = getPendingColumnsMap(db);
    const content = erDiagramView(schema, base, pending);
    const navHtml = nav({ basePath: base, activeSection: "schema", tables });
    return sseAction(c, async ({ patchElements }) => {
      await patchElements(`<main id="main">${content}</main>`);
    });
  });

  // Load edit dialog content for a specific table
  app.get("/tables/:name/edit-dialog", async (c) => {
    const db = c.get("db");
    const config = c.get("config");
    const base = config.basePath.replace(/\/$/, "");
    const tableName = c.req.param("name");
    ensurePendingChangesTable(db);
    const dbColumns = getColumns(db, tableName);
    const pending = getPendingForTable(db, tableName);
    const fullSchema = getFullSchema(db);
    const otherSchema = fullSchema.filter((t) => t.name !== tableName);
    const currentFKs = getForeignKeys(db, tableName);
    const fkMap = new Map(currentFKs.map((fk) => [fk.from, `${fk.table}.${fk.to}`]));
    const cols =
      pending ??
      dbColumns.map((col) => ({
        name: col.name,
        originalName: col.name,
        type: col.type || "TEXT",
        dflt_value: col.dflt_value == null ? "" : String(col.dflt_value),
        notnull: col.notnull,
      }));

    // Initialize signals for each column
    const signals: Record<string, unknown> = {
      editTableName: tableName,
      editColCount: cols.length,
    };
    for (let i = 0; i < cols.length; i++) {
      signals[`editcol_${i}_name`] = cols[i].name;
      signals[`editcol_${i}_type`] = cols[i].type || "TEXT";
      signals[`editcol_${i}_default`] = cols[i].dflt_value ?? "";
      signals[`editcol_${i}_notnull`] = cols[i].notnull;
      signals[`editcol_${i}_original`] = cols[i].originalName;
      signals[`editcol_${i}_deleted`] = false;
      signals[`editcol_${i}_fkref`] = pending
        ? (pending[i]?.fkRef ?? '')
        : (fkMap.get(cols[i].name) ?? '');
    }

    const bodyHtml = String(
      editTableDialogContent(tableName, dbColumns, base, pending, otherSchema, currentFKs),
    );
    return sseAction(c, async ({ patchSignals, patchElements }) => {
      await patchSignals(signals);
      await patchElements(
        `<div id="edit-dialog-body" style="overflow-y:auto;padding:1.5rem;display:flex;flex-direction:column;gap:0">${bodyHtml}</div>`,
      );
    });
  });

  // Append a new empty column row to the dialog
  app.get("/tables/:name/new-column-row", async (c) => {
    const db = c.get("db");
    const idx = Number(c.req.query("idx") ?? 0);
    const tableName = c.req.param('name');
    const fullSchema = getFullSchema(db);
    const otherSchema = fullSchema.filter((t) => t.name !== tableName);
    const newRow = String(newEmptyColRow(idx, otherSchema));
    const signals: Record<string, unknown> = {
      [`editcol_${idx}_name`]: "",
      [`editcol_${idx}_type`]: "TEXT",
      [`editcol_${idx}_default`]: "",
      [`editcol_${idx}_notnull`]: false,
      [`editcol_${idx}_original`]: "",
      [`editcol_${idx}_deleted`]: false,
      [`editcol_${idx}_fkref`]: "",
      editColCount: idx + 1,
    };
    return sseAction(c, async ({ patchSignals, patchElements }) => {
      await patchSignals(signals);
      await patchElements(newRow, {
        selector: "#edit-dialog-col-list",
        mode: "append",
      });
    });
  });

  // Save pending changes for a table (does NOT apply to DB yet)
  app.post("/tables/:name/pending", async (c) => {
    const db = c.get("db");
    const config = c.get("config");
    const base = config.basePath.replace(/\/$/, "");
    const tableName = c.req.param("name");
    ensurePendingChangesTable(db);

    let body: Record<string, unknown> = {};
    try {
      body = (await c.req.json()) as Record<string, unknown>;
    } catch {
      // empty body
    }

    const count = Number(body.editColCount ?? 0);
    const cols: DesiredColumn[] = [];
    for (let i = 0; i < count; i++) {
      if (body[`editcol_${i}_deleted`]) continue;
      const name = String(body[`editcol_${i}_name`] ?? "").trim();
      if (!name) continue;
      cols.push({
        name,
        originalName: String(body[`editcol_${i}_original`] ?? ""),
        type: String(body[`editcol_${i}_type`] ?? "TEXT"),
        dflt_value: String(body[`editcol_${i}_default`] ?? ""),
        notnull: Boolean(body[`editcol_${i}_notnull`]),
        fkRef: String(body[`editcol_${i}_fkref`] ?? ""),
      });
    }

    if (cols.length > 0) {
      savePendingChanges(db, tableName, cols);
    }

    const schema = getFullSchema(db);
    const pending = getPendingColumnsMap(db);
    const content = erDiagramView(schema, base, pending);
    return sseAction(c, async ({ patchElements }) => {
      await patchElements(`<main id="main">${content}</main>`);
    });
  });

  // Publish: apply all pending changes, generate migration file
  app.post("/publish", async (c) => {
    const db = c.get("db");
    const config = c.get("config");
    const base = config.basePath.replace(/\/$/, "");
    ensurePendingChangesTable(db);

    const allPending = getAllPendingChanges(db);
    if (allPending.length === 0) {
      const schema = getFullSchema(db);
      const content = erDiagramView(schema, base, new Map());
      return sseAction(c, async ({ patchElements }) => {
        await patchElements(`<main id="main">${content}</main>`);
      });
    }

    // Generate SQL diff for each staged table
    const sqlParts: string[] = [];
    for (const { tableName, desiredColumns } of allPending) {
      const current = getColumns(db, tableName);
      const currentFKs = getForeignKeys(db, tableName);
      const sql = generateDiffSQL(tableName, current, desiredColumns, currentFKs);
      if (sql) sqlParts.push(sql);
    }

    const fullSql = sqlParts.join("\n\n");

    if (fullSql) {
      ensureMigrationsTable(db);
      const filename = nextMigrationFilename(config.migrationsDir);
      saveMigration(config.migrationsDir, filename, fullSql);
      db.exec(fullSql);
      db.prepare("INSERT INTO _picobase_migrations (name) VALUES (?)").run(
        filename,
      );
    }

    clearPendingChanges(db);

    const schema = getFullSchema(db);
    const content = erDiagramView(schema, base, new Map());
    return sseAction(c, async ({ patchElements }) => {
      await patchElements(`<main id="main">${content}</main>`);
    });
  });

  return app;
}
