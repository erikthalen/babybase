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
  opts: { limit: number; offset: number },
): Record<string, unknown>[] {
  return db
    .prepare(`SELECT * FROM ${JSON.stringify(table)} LIMIT ? OFFSET ?`)
    .all(opts.limit, opts.offset) as Record<string, unknown>[];
}

export function countRows(db: DatabaseSync, table: string): number {
  const row = db
    .prepare(`SELECT COUNT(*) as n FROM ${JSON.stringify(table)}`)
    .get() as { n: number };
  return row.n;
}
