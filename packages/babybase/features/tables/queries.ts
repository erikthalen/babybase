import type { DatabaseSync } from "node:sqlite";

export interface Column {
  name: string;
  type: string;
  notnull: boolean;
  dflt_value: unknown;
  pk: boolean;
}

export function getColumns(db: DatabaseSync, table: string): Column[] {
  const rows = db
    .prepare(`PRAGMA table_info(${JSON.stringify(table)})`)
    .all() as Array<{
    name: string;
    type: string;
    notnull: number;
    dflt_value: unknown;
    pk: number;
  }>;
  return rows.map((r) => ({
    name: r.name,
    type: r.type,
    notnull: r.notnull === 1,
    dflt_value: r.dflt_value,
    pk: r.pk > 0,
  }));
}

export function getRows(
  db: DatabaseSync,
  table: string,
  opts: {
    limit: number;
    offset: number;
    sort?: { col: string; dir: "asc" | "desc" };
    search?: string;
    columns?: Column[];
  },
): Record<string, unknown>[] {
  const orderBy = opts.sort
    ? ` ORDER BY ${JSON.stringify(opts.sort.col)} ${opts.sort.dir === "asc" ? "ASC" : "DESC"}`
    : "";
  if (opts.search && opts.columns?.length) {
    const term = `%${opts.search}%`;
    const where = opts.columns
      .map((c) => `CAST(${JSON.stringify(c.name)} AS TEXT) LIKE ?`)
      .join(" OR ");
    return db
      .prepare(
        `SELECT * FROM ${JSON.stringify(table)} WHERE ${where}${orderBy} LIMIT ? OFFSET ?`,
      )
      .all(...opts.columns.map(() => term), opts.limit, opts.offset) as Record<
      string,
      unknown
    >[];
  }
  return db
    .prepare(`SELECT * FROM ${JSON.stringify(table)}${orderBy} LIMIT ? OFFSET ?`)
    .all(opts.limit, opts.offset) as Record<string, unknown>[];
}

export function countRows(
  db: DatabaseSync,
  table: string,
  opts?: { search?: string; columns?: Column[] },
): number {
  if (opts?.search && opts.columns?.length) {
    const term = `%${opts.search}%`;
    const where = opts.columns
      .map((c) => `CAST(${JSON.stringify(c.name)} AS TEXT) LIKE ?`)
      .join(" OR ");
    const row = db
      .prepare(`SELECT COUNT(*) as n FROM ${JSON.stringify(table)} WHERE ${where}`)
      .get(...opts.columns.map(() => term)) as { n: number };
    return row.n;
  }
  const row = db
    .prepare(`SELECT COUNT(*) as n FROM ${JSON.stringify(table)}`)
    .get() as { n: number };
  return row.n;
}
