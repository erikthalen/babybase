import { basename, dirname } from "node:path";
import { Hono } from "hono";
import { layout, nav } from "../../components/layout.ts";
import { respond, sseAction } from "../../components/sse.ts";
import { listTables } from "../../db/schema-queries.ts";
import type { AppEnv } from "../../index.ts";
import {
  ensureMigrationsTable,
  getFileMigrations,
  saveMigration,
} from "../migrations/queries.ts";
import {
  getCameraState,
  getTablePositions,
  readSettings,
  setCameraState,
  setTablePosition,
  writeSettings,
} from "../storage/queries.ts";
import { getColumns } from "../tables/queries.ts";
import {
  editTableDialogContent,
  newEmptyColRow,
  newTableDialogContent,
  toAffinity,
} from "./components/edit-table-dialog.ts";
import {
  editsDialogContent,
  schemaActions,
} from "./components/edits-dialog.ts";
import type { DesiredColumn } from "./queries.ts";
import {
  clearPendingChanges,
  deletePendingForTable,
  generateCreateTableSQL,
  generateDiffSQL,
  getAllPendingChanges,
  getForeignKeys,
  getFullSchema,
  getPendingForTable,
  renameTable,
  savePendingChanges,
} from "./queries.ts";
import { erDiagramView } from "./views.ts";
import { html } from "hono/html";

function getPendingColumnsMap(
  db: Parameters<typeof getAllPendingChanges>[0],
): Map<string, DesiredColumn[]> {
  return new Map(
    getAllPendingChanges(db).map((p) => [p.tableName, p.desiredColumns]),
  );
}

function nextMigrationFilename(dir: string): string {
  const files = getFileMigrations(dir);
  const nums = files
    .map((f) => parseInt(f.name.split("_")[0] ?? "0", 10))
    .filter((n) => !Number.isNaN(n));
  const next = nums.length > 0 ? Math.max(...nums) + 1 : 1;
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `${String(next).padStart(3, "0")}_edit_tables_${today}.sql`;
}

export function createSchemaRouter(): Hono<AppEnv> {
  const app = new Hono<AppEnv>();

  app.get("/", async (c) => {
    const db = c.get("db")!;
    const config = c.get("config");
    const base = config.basePath.replace(/\/$/, "");
    const babybaseDir = config.settingsDir;
    const settings = readSettings(babybaseDir);
    const dbName = config.database ? basename(config.database) : undefined;
    const camera = dbName ? getCameraState(settings, dbName) : undefined;
    const savedPositions = dbName ? getTablePositions(settings, dbName) : {};
    const tables = listTables(db);
    const schema = getFullSchema(db);
    const pending = getPendingColumnsMap(db);
    const content = erDiagramView(
      schema,
      base,
      pending,
      config.database,
      config.readonly,
      camera,
      savedPositions,
    );
    const navHtml = nav({
      basePath: base,
      activeSection: "schema",
      tables,
      readonly: config.readonly,
    });
    return respond(c, {
      fullPage: () => layout({ title: "Schema", nav: navHtml, content }),
      fragment: () => html`<main id="main">${content}</main>`,
    });
  });

  app.post("/tables", async (c) => {
    if (c.get("config").readonly) return c.json({ error: "readonly" }, 403);
    const db = c.get("db")!;
    const config = c.get("config");
    const base = config.basePath.replace(/\/$/, "");
    let body: Record<string, string> = {};
    try {
      body = (await c.req.json()) as Record<string, string>;
    } catch {
      // malformed or missing body — treat as empty
    }
    const name = (body.tablename ?? "").trim();
    if (name) {
      db.exec(
        `CREATE TABLE IF NOT EXISTS ${JSON.stringify(name)} (id INTEGER PRIMARY KEY)`,
      );
    }
    const schema = getFullSchema(db);
    const pending = getPendingColumnsMap(db);
    const content = erDiagramView(schema, base, pending, config.database);
    return sseAction(c, async ({ patchElements }) => {
      await patchElements(html`<main id="main">${content}</main>`);
    });
  });

  // Load new-table dialog content into the shared edit-table-dialog shell
  app.get("/new-table-dialog", async (c) => {
    if (c.get("config").readonly) return c.json({ error: "readonly" }, 403);
    const config = c.get("config");
    const base = config.basePath.replace(/\/$/, "");
    const signals = { newtablename: "", editColCount: 0 };
    const bodyHtml = newTableDialogContent(base);
    return sseAction(c, async ({ patchSignals, patchElements }) => {
      await patchSignals(signals);
      await patchElements(html`<div id="edit-dialog-body">${bodyHtml}</div>`);
    });
  });

  // Create a new table with column definitions
  app.post("/tables/new", async (c) => {
    if (c.get("config").readonly) return c.json({ error: "readonly" }, 403);
    const db = c.get("db")!;
    const config = c.get("config");
    const base = config.basePath.replace(/\/$/, "");
    let body: Record<string, unknown> = {};
    try {
      body = (await c.req.json()) as Record<string, unknown>;
    } catch {
      // empty body
    }
    const tableName = String(body.newtablename ?? "").trim();
    if (tableName) {
      const count = Number(body.editColCount ?? 0);
      const cols: DesiredColumn[] = [];
      for (let i = 0; i < count; i++) {
        if (body[`editcol_${i}_deleted`]) continue;
        const name = String(body[`editcol_${i}_name`] ?? "").trim();
        if (!name) continue;
        cols.push({
          name,
          originalName: "",
          type: String(body[`editcol_${i}_type`] ?? "TEXT"),
          dflt_value: String(body[`editcol_${i}_default`] ?? ""),
          notnull: Boolean(body[`editcol_${i}_notnull`]),
          fkRef: String(body[`editcol_${i}_fkref`] ?? ""),
        });
      }
      const sql = generateCreateTableSQL(tableName, cols);
      db.exec(sql);
      ensureMigrationsTable(db);
      const filename = nextMigrationFilename(config.migrationsDir);
      saveMigration(config.migrationsDir, filename, sql);
      db.prepare("INSERT INTO _babybase_migrations (name) VALUES (?)").run(
        filename,
      );
    }
    const schema = getFullSchema(db);
    const pending = getPendingColumnsMap(db);
    const content = erDiagramView(schema, base, pending, config.database);
    return sseAction(c, async ({ patchElements }) => {
      await patchElements(html`<main id="main">${content}</main>`);
    });
  });

  // Add a new empty column row for the new-table dialog
  app.get("/tables/new-col-row", async (c) => {
    const db = c.get("db")!;
    const idx = Number(c.req.query("idx") ?? 0);
    const fullSchema = getFullSchema(db);
    const newRow = newEmptyColRow(idx, fullSchema);
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

  // Load edit dialog content for a specific table
  app.get("/tables/:name/edit-dialog", async (c) => {
    if (c.get("config").readonly) return c.json({ error: "readonly" }, 403);
    const db = c.get("db")!;
    const config = c.get("config");
    const base = config.basePath.replace(/\/$/, "");
    const tableName = c.req.param("name");
    const dbColumns = getColumns(db, tableName);
    const pending = getPendingForTable(db, tableName);
    const fullSchema = getFullSchema(db);
    const otherSchema = fullSchema.filter((t) => t.name !== tableName);
    const currentFKs = getForeignKeys(db, tableName);
    const fkMap = new Map(
      currentFKs.map((fk) => [fk.from, `${fk.table}.${fk.to}`]),
    );
    const cols =
      pending ??
      dbColumns.map((col) => ({
        name: col.name,
        originalName: col.name,
        type: toAffinity(col.type || ""),
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
        ? (pending[i]?.fkRef ?? "")
        : (fkMap.get(cols[i].name) ?? "");
    }

    const bodyHtml = editTableDialogContent(
      tableName,
      dbColumns,
      base,
      pending,
      otherSchema,
      currentFKs,
    );

    return sseAction(c, async ({ patchSignals, patchElements }) => {
      await patchSignals(signals);
      await patchElements(html`<div id="edit-dialog-body">${bodyHtml}</div>`);
    });
  });

  // Append a new empty column row to the dialog
  app.get("/tables/:name/new-column-row", async (c) => {
    if (c.get("config").readonly) return c.json({ error: "readonly" }, 403);
    const db = c.get("db")!;
    const idx = Number(c.req.query("idx") ?? 0);
    const tableName = c.req.param("name");
    const fullSchema = getFullSchema(db);
    const otherSchema = fullSchema.filter((t) => t.name !== tableName);
    const newRow = newEmptyColRow(idx, otherSchema);
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
    if (c.get("config").readonly) return c.json({ error: "readonly" }, 403);
    const db = c.get("db")!;
    const config = c.get("config");
    const base = config.basePath.replace(/\/$/, "");
    const tableName = c.req.param("name");

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

    const newTableName = String(body.editTableName ?? "").trim();
    const effectiveTableName =
      newTableName && newTableName !== tableName
        ? (renameTable(db, tableName, newTableName), newTableName)
        : tableName;

    if (cols.length > 0) {
      savePendingChanges(db, effectiveTableName, cols);
    }

    const schema = getFullSchema(db);
    const pending = getPendingColumnsMap(db);
    const content = erDiagramView(schema, base, pending, config.database);
    return sseAction(c, async ({ patchElements }) => {
      await patchElements(html`<main id="main">${content}</main>`);
    });
  });

  // Return dialog content listing all pending changes with their SQL
  app.get("/edits-dialog", async (c) => {
    const db = c.get("db")!;
    const config = c.get("config");
    const base = config.basePath.replace(/\/$/, "");
    const allPending = getAllPendingChanges(db);
    const entries = allPending.map(({ tableName, desiredColumns }) => {
      const current = getColumns(db, tableName);
      const currentFKs = getForeignKeys(db, tableName);
      const sql = generateDiffSQL(
        tableName,
        current,
        desiredColumns,
        currentFKs,
      );
      return { tableName, sql };
    });

    const bodyHtml = editsDialogContent(entries, base);

    return sseAction(c, async ({ patchElements }) => {
      await patchElements(html`<div id="edits-dialog-body">${bodyHtml}</div>`);
    });
  });

  // Remove pending changes for a single table
  app.delete("/tables/:name/pending", async (c) => {
    if (c.get("config").readonly) return c.json({ error: "readonly" }, 403);
    const db = c.get("db")!;
    const config = c.get("config");
    const base = config.basePath.replace(/\/$/, "");
    const tableName = c.req.param("name");
    deletePendingForTable(db, tableName);
    const allPending = getAllPendingChanges(db);
    const pendingCount = allPending.length;
    const entries = allPending.map(({ tableName: tName, desiredColumns }) => {
      const current = getColumns(db, tName);
      const currentFKs = getForeignKeys(db, tName);
      const sql = generateDiffSQL(tName, current, desiredColumns, currentFKs);
      return { tableName: tName, sql };
    });

    const bodyHtml = editsDialogContent(entries, base);

    return sseAction(c, async ({ patchElements }) => {
      await patchElements(html`<div id="edits-dialog-body">${bodyHtml}</div>`);
      await patchElements(schemaActions(base, pendingCount));
      await patchElements(
        html`<span id="pending-dot-${tableName}" style="display:none"></span>`,
      );
    });
  });

  // Publish: apply all pending changes, generate migration file
  app.post("/publish", async (c) => {
    if (c.get("config").readonly) return c.json({ error: "readonly" }, 403);
    const db = c.get("db")!;
    const config = c.get("config");
    const base = config.basePath.replace(/\/$/, "");

    const allPending = getAllPendingChanges(db);
    if (allPending.length === 0) {
      const schema = getFullSchema(db);
      const content = erDiagramView(schema, base, new Map(), config.database);
      return sseAction(c, async ({ patchElements }) => {
        await patchElements(html`<main id="main">${content}</main>`);
      });
    }

    // Generate SQL diff for each staged table
    const sqlParts: string[] = [];
    for (const { tableName, desiredColumns } of allPending) {
      const current = getColumns(db, tableName);
      const currentFKs = getForeignKeys(db, tableName);
      const sql = generateDiffSQL(
        tableName,
        current,
        desiredColumns,
        currentFKs,
      );
      if (sql) sqlParts.push(sql);
    }

    const fullSql = sqlParts.join("\n\n");

    if (fullSql) {
      ensureMigrationsTable(db);
      const filename = nextMigrationFilename(config.migrationsDir);
      saveMigration(config.migrationsDir, filename, fullSql);
      db.exec("PRAGMA foreign_keys=OFF");
      db.exec("BEGIN");
      try {
        db.exec(fullSql);
        db.exec("COMMIT");
      } catch (e) {
        db.exec("ROLLBACK");
        throw e;
      } finally {
        db.exec("PRAGMA foreign_keys=ON");
      }
      db.prepare("INSERT INTO _babybase_migrations (name) VALUES (?)").run(
        filename,
      );
    }

    clearPendingChanges(db);

    const schema = getFullSchema(db);
    const content = erDiagramView(schema, base, new Map(), config.database);
    return sseAction(c, async ({ patchElements }) => {
      await patchElements(html`<main id="main">${content}</main>`);
    });
  });

  // Save a single table's drag position to settings
  app.post("/table-positions", async (c) => {
    const config = c.get("config");
    if (!config.database) return c.json({ ok: false }, 400);
    let body: Record<string, unknown> = {};
    try {
      body = (await c.req.json()) as Record<string, unknown>;
    } catch {
      return c.json({ ok: false }, 400);
    }
    const tableName = String(body.tableName ?? "").trim();
    const x = Number(body.x ?? 0);
    const y = Number(body.y ?? 0);
    if (!tableName || !Number.isFinite(x) || !Number.isFinite(y)) {
      return c.json({ ok: false }, 400);
    }
    const babybaseDir = config.settingsDir;
    const dbName = basename(config.database);
    const settings = readSettings(babybaseDir);
    writeSettings(
      babybaseDir,
      setTablePosition(settings, dbName, tableName, { x, y }),
    );
    return c.json({ ok: true });
  });

  // Save camera pan/zoom state to settings
  app.post("/camera", async (c) => {
    const config = c.get("config");
    if (!config.database) return c.json({ ok: false }, 400);
    let body: Record<string, unknown> = {};
    try {
      body = (await c.req.json()) as Record<string, unknown>;
    } catch {
      return c.json({ ok: false }, 400);
    }
    const x = Number(body.x ?? 0);
    const y = Number(body.y ?? 0);
    const z = Number(body.z ?? 1);
    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) {
      return c.json({ ok: false }, 400);
    }
    const babybaseDir = config.settingsDir;
    const dbName = basename(config.database);
    const settings = readSettings(babybaseDir);
    writeSettings(babybaseDir, setCameraState(settings, dbName, { x, y, z }));
    return c.json({ ok: true });
  });

  return app;
}
