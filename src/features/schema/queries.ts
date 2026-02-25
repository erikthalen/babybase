import type { DatabaseSync } from 'node:sqlite'
import { listTables } from '../../db/schema-queries.ts'
import { getColumns } from '../tables/queries.ts'
import type { Column } from '../tables/queries.ts'

export interface TableSchema {
  name: string
  columns: Column[]
  foreignKeys: ForeignKey[]
}

export interface ForeignKey {
  from: string
  table: string
  to: string
}

export function getForeignKeys(db: DatabaseSync, table: string): ForeignKey[] {
  const rows = db.prepare(`PRAGMA foreign_key_list(${JSON.stringify(table)})`).all() as Array<{
    from: string; table: string; to: string
  }>
  return rows.map((r) => ({ from: r.from, table: r.table, to: r.to }))
}

export function getFullSchema(db: DatabaseSync): TableSchema[] {
  const tables = listTables(db)
  return tables.map((name) => ({
    name,
    columns: getColumns(db, name),
    foreignKeys: getForeignKeys(db, name),
  }))
}
