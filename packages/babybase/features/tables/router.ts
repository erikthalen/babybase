import { basename } from "node:path";
import { Hono } from "hono";
import { layout, nav } from "../../components/layout.ts";
import { respond, sseAction } from "../../components/sse.ts";
import { listTables } from "../../db/schema-queries.ts";
import type { AppEnv } from "../../index.ts";
import {
  getHiddenColumns,
  readSettings,
  setHiddenColumns,
  writeSettings,
} from "../storage/queries.ts";
import { countRows, getColumns, getRows } from "./queries.ts";
import {
  buildRowsContainer,
  buildTabBar,
  rowsView,
  tableListView,
} from "./views.ts";
import { html } from "hono/html";

const LIMIT = 50;

export function createTablesRouter(): Hono<AppEnv> {
  const app = new Hono<AppEnv>();

  function resolveHiddenColumns(
    settingsDir: string,
    database: string | undefined,
    tableName: string,
  ): string[] {
    if (!database) return [];
    const settings = readSettings(settingsDir);
    return getHiddenColumns(settings, basename(database), tableName);
  }

  // List all tables — redirect to first table if any exist
  app.get("/", async (c) => {
    const db = c.get("db")!;
    const config = c.get("babybaseConfig");
    const tables = listTables(db);
    const base = config.basePath.replace(/\/$/, "");
    if (tables.length > 0) {
      return c.redirect(`${base}/tables/${tables[0]}`);
    }
    const content = tableListView(tables, base);
    const navHtml = nav({
      basePath: base,
      activeSection: "schema",
      tables,
      readonly: config.readonly,
    });
    return respond(c, {
      fullPage: () => layout({ title: "Tables", nav: navHtml, content }),
      fragment: () => html`<main id="main">${content}</main>`,
    });
  });

  // View rows for a table
  app.get("/:table", async (c) => {
    const db = c.get("db")!;
    const config = c.get("babybaseConfig");
    const tableName = c.req.param("table");
    const page = Number(c.req.query("page") ?? 1);
    const base = config.basePath.replace(/\/$/, "");
    const tables = listTables(db);
    const columns = getColumns(db, tableName);
    const sortCol = c.req.query("sort");
    const sortDir = c.req.query("dir");
    const sort =
      sortCol &&
      (sortDir === "asc" || sortDir === "desc") &&
      columns.some((col) => col.name === sortCol)
        ? { col: sortCol, dir: sortDir as "asc" | "desc" }
        : undefined;
    const search = c.req.query("search")?.trim() || undefined;
    const hiddenColumns = resolveHiddenColumns(
      config.settingsDir,
      config.database,
      tableName,
    );
    const total = countRows(db, tableName, { search, columns });
    const rows = getRows(db, tableName, {
      limit: LIMIT,
      offset: (page - 1) * LIMIT,
      sort,
      search,
      columns,
    });
    const isDatastar = c.req.header("accept")?.includes("text/event-stream");
    if (!isDatastar) {
      const content = rowsView({
        table: tableName,
        tables,
        columns,
        rows,
        page,
        total,
        limit: LIMIT,
        basePath: base,
        sort,
        search,
        hiddenColumns,
      });
      const navHtml = nav({
        basePath: base,
        activeSection: "schema",
        tables,
        readonly: config.readonly,
      });
      return c.html(layout({ title: tableName, nav: navHtml, content }));
    }

    return sseAction(c, async ({ patchElements }) => {
      await patchElements(buildTabBar(tables, tableName, base));
      await patchElements(
        buildRowsContainer({
          table: tableName,
          columns,
          rows,
          page,
          total,
          limit: LIMIT,
          basePath: base,
          sort,
          search,
          hiddenColumns,
        }),
      );
    });
  });

  // Toggle a column's visibility
  app.post("/:table/toggle-column/:col", async (c) => {
    const config = c.get("babybaseConfig");
    const db = c.get("db")!;
    const tableName = c.req.param("table");
    const colName = decodeURIComponent(c.req.param("col"));
    const base = config.basePath.replace(/\/$/, "");

    if (!config.database) {
      return c.json({ error: "No database mounted" }, 400);
    }

    // Validate column exists
    const columns = getColumns(db, tableName);
    if (!columns.some((col) => col.name === colName)) {
      return c.json({ error: "Unknown column" }, 400);
    }

    // Read current state and toggle
    const dbName = basename(config.database);
    const settings = readSettings(config.settingsDir);
    const currentHidden = getHiddenColumns(settings, dbName, tableName);
    const newHidden = currentHidden.includes(colName)
      ? currentHidden.filter((col) => col !== colName)
      : [...currentHidden, colName];
    writeSettings(
      config.settingsDir,
      setHiddenColumns(settings, dbName, tableName, newHidden),
    );

    // Re-render with updated visibility — columns already fetched above
    const page = Number(c.req.query("page") ?? 1);
    const sortCol = c.req.query("sort");
    const sortDir = c.req.query("dir");
    const sort =
      sortCol &&
      (sortDir === "asc" || sortDir === "desc") &&
      columns.some((col) => col.name === sortCol)
        ? { col: sortCol, dir: sortDir as "asc" | "desc" }
        : undefined;
    const search = c.req.query("search")?.trim() || undefined;
    const total = countRows(db, tableName, { search, columns });
    const rows = getRows(db, tableName, {
      limit: LIMIT,
      offset: (page - 1) * LIMIT,
      sort,
      search,
      columns,
    });

    return sseAction(c, async ({ patchElements }) => {
      await patchElements(
        buildRowsContainer({
          table: tableName,
          columns,
          rows,
          page,
          total,
          limit: LIMIT,
          basePath: base,
          sort,
          search,
          hiddenColumns: newHidden,
        }),
      );
    });
  });

  // Insert row
  app.post("/:table", async (c) => {
    const db = c.get("db")!;
    const config = c.get("babybaseConfig");
    const tableName = c.req.param("table");
    const body = (await c.req.json()) as Record<string, string>;
    const cols = Object.keys(body).filter((k) => body[k] !== "");
    if (cols.length > 0) {
      const vals = cols.map((k) => body[k]);
      db.prepare(
        `INSERT INTO ${JSON.stringify(tableName)} (${cols.map((k) => JSON.stringify(k)).join(",")}) VALUES (${cols.map(() => "?").join(",")})`,
      ).run(...(vals as string[]));
    }
    const base = config.basePath.replace(/\/$/, "");
    const tables = listTables(db);
    const columns = getColumns(db, tableName);
    const total = countRows(db, tableName);
    const rows = getRows(db, tableName, { limit: LIMIT, offset: 0 });
    const hiddenCols = resolveHiddenColumns(
      config.settingsDir,
      config.database,
      tableName,
    );
    return sseAction(c, async ({ patchElements }) => {
      await patchElements(
        html`<main id="main">
          ${rowsView({
            table: tableName,
            tables,
            columns,
            rows,
            page: 1,
            total,
            limit: LIMIT,
            basePath: base,
            hiddenColumns: hiddenCols,
          })}
        </main>`,
      );
    });
  });

  // Delete row
  app.delete("/:table/:rowid", async (c) => {
    const db = c.get("db")!;
    const tableName = c.req.param("table");
    const rowid = c.req.param("rowid");
    const pkCol = getColumns(db, tableName).find((col) => col.pk);
    const pkName = pkCol?.name ?? "rowid";
    db.prepare(
      `DELETE FROM ${JSON.stringify(tableName)} WHERE ${JSON.stringify(pkName)} = ?`,
    ).run(rowid);
    return sseAction(c, async ({ patchElements }) => {
      // Send an empty element with the same id — Datastar will remove it
      await patchElements(
        html`<div id="row-${rowid}" data-swap-mode="delete"></div>`,
      );
    });
  });

  return app;
}
