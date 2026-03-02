import type { DatabaseSync } from "node:sqlite";
import { listTables } from "../../db/schema-queries.ts";
import type { Column } from "../tables/queries.ts";
import { getColumns } from "../tables/queries.ts";

// ── Pending changes ────────────────────────────────────────────────────────

export interface DesiredColumn {
  name: string
  originalName: string  // '' = new column; same as name = unchanged; different = rename
  type: string
  dflt_value: string   // '' = no default
  notnull: boolean
  fkRef: string        // "table.column" or "" for no FK
}

export interface PendingChange {
  tableName: string
  desiredColumns: DesiredColumn[]
}

export function ensurePendingChangesTable(db: DatabaseSync): void {
  db.exec(`CREATE TABLE IF NOT EXISTS _picobase_pending_changes (
    table_name TEXT PRIMARY KEY,
    desired_columns TEXT NOT NULL,
    updated_at TEXT DEFAULT (datetime('now'))
  )`)
}

export function savePendingChanges(db: DatabaseSync, tableName: string, columns: DesiredColumn[]): void {
  db.prepare('INSERT OR REPLACE INTO _picobase_pending_changes (table_name, desired_columns) VALUES (?, ?)')
    .run(tableName, JSON.stringify(columns))
}

export function getAllPendingChanges(db: DatabaseSync): PendingChange[] {
  const rows = db.prepare('SELECT table_name, desired_columns FROM _picobase_pending_changes ORDER BY table_name').all() as { table_name: string; desired_columns: string }[]
  return rows.map((r) => ({
    tableName: r.table_name,
    desiredColumns: JSON.parse(r.desired_columns) as DesiredColumn[],
  }))
}

export function getPendingForTable(db: DatabaseSync, tableName: string): DesiredColumn[] | null {
  const row = db.prepare('SELECT desired_columns FROM _picobase_pending_changes WHERE table_name = ?').get(tableName) as { desired_columns: string } | undefined
  if (!row) return null
  return JSON.parse(row.desired_columns) as DesiredColumn[]
}

export function clearPendingChanges(db: DatabaseSync): void {
  db.exec('DELETE FROM _picobase_pending_changes')
}

// ── SQL diff generation ────────────────────────────────────────────────────

function quoteIdent(name: string): string {
  return `"${name.replace(/"/g, '""')}"`
}

function buildColumnDef(col: DesiredColumn): string {
  let def = `${quoteIdent(col.name)} ${col.type || 'TEXT'}`
  if (col.notnull) def += ' NOT NULL'
  if (col.dflt_value !== '') def += ` DEFAULT ${col.dflt_value}`
  if (col.fkRef) {
    const dot = col.fkRef.indexOf('.')
    if (dot !== -1) {
      const refTable = col.fkRef.slice(0, dot)
      const refCol = col.fkRef.slice(dot + 1)
      def += ` REFERENCES ${quoteIdent(refTable)} (${quoteIdent(refCol)})`
    }
  }
  return def
}

function tableRecreationSQL(
  tableName: string,
  current: Column[],
  desired: DesiredColumn[],
  currentMap: Map<string, Column>,
): string {
  const tmpName = `_new_${tableName}`

  const colDefs = desired.map((d) => {
    if (d.originalName === '') return buildColumnDef(d)
    const orig = currentMap.get(d.originalName)
    if (orig?.pk) return `${quoteIdent(d.name)} ${orig.type} PRIMARY KEY`
    return buildColumnDef(d)
  })

  const insertCols: string[] = []
  const selectCols: string[] = []
  for (const d of desired) {
    if (d.originalName === '') continue
    insertCols.push(quoteIdent(d.name))
    selectCols.push(quoteIdent(d.originalName))
  }

  const qt = quoteIdent(tableName)
  const qtmp = quoteIdent(tmpName)

  const parts = [
    'BEGIN;',
    `CREATE TABLE ${qtmp} (${colDefs.join(', ')});`,
    insertCols.length > 0
      ? `INSERT INTO ${qtmp} (${insertCols.join(', ')}) SELECT ${selectCols.join(', ')} FROM ${qt};`
      : '',
    `DROP TABLE ${qt};`,
    `ALTER TABLE ${qtmp} RENAME TO ${qt};`,
    'COMMIT;',
  ]
  return parts.filter((s) => s !== '').join('\n')
}

export function generateDiffSQL(
  tableName: string,
  current: Column[],
  desired: DesiredColumn[],
  currentFKs: ForeignKey[] = [],
): string {
  if (desired.length === 0) return ''

  const currentMap = new Map(current.map((c) => [c.name, c]))
  const fkMap = new Map(currentFKs.map((fk) => [fk.from, `${fk.table}.${fk.to}`]))
  const desiredOriginals = new Set(desired.map((d) => d.originalName).filter((n) => n !== ''))

  const added = desired.filter((d) => d.originalName === '')
  const dropped = current.filter((c) => !c.pk && !desiredOriginals.has(c.name))
  const existing = desired.filter((d) => d.originalName !== '')

  const modified = existing.filter((d) => {
    const orig = currentMap.get(d.originalName)
    if (!orig || orig.pk) return false
    const origDefault = orig.dflt_value == null ? '' : String(orig.dflt_value)
    const origFkRef = fkMap.get(d.originalName) ?? ''
    return (
      d.type !== orig.type ||
      d.dflt_value !== origDefault ||
      d.notnull !== orig.notnull ||
      (d.fkRef ?? '') !== origFkRef
    )
  })

  const renamed = existing.filter(
    (d) => d.name !== d.originalName && !modified.some((m) => m.originalName === d.originalName),
  )

  if (!added.length && !dropped.length && !renamed.length && !modified.length) return ''

  if (modified.length > 0) {
    return tableRecreationSQL(tableName, current, desired, currentMap)
  }

  const stmts: string[] = []
  for (const col of renamed) {
    stmts.push(`ALTER TABLE ${quoteIdent(tableName)} RENAME COLUMN ${quoteIdent(col.originalName)} TO ${quoteIdent(col.name)};`)
  }
  for (const col of dropped) {
    stmts.push(`ALTER TABLE ${quoteIdent(tableName)} DROP COLUMN ${quoteIdent(col.name)};`)
  }
  for (const col of added) {
    stmts.push(`ALTER TABLE ${quoteIdent(tableName)} ADD COLUMN ${buildColumnDef(col)};`)
  }
  return stmts.join('\n')
}

export interface TableSchema {
	name: string;
	columns: Column[];
	foreignKeys: ForeignKey[];
}

export interface ForeignKey {
	from: string;
	table: string;
	to: string;
}

export function getForeignKeys(db: DatabaseSync, table: string): ForeignKey[] {
  const rows = db.prepare(`PRAGMA foreign_key_list(${quoteIdent(table)})`).all() as Array<{
    from: string; table: string; to: string
  }>
  return rows.map((r) => ({ from: r.from, table: r.table, to: r.to }))
}

export function getFullSchema(db: DatabaseSync): TableSchema[] {
	const tables = listTables(db);
	return tables.map((name) => ({
		name,
		columns: getColumns(db, name),
		foreignKeys: getForeignKeys(db, name),
	}));
}
