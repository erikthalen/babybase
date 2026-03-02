# Edit Table Feature Design

**Date:** 2026-03-02
**Status:** Approved

## Summary

Add an "edit table" capability to the ER diagram. Each table box header gets an edit button that opens a dialog for adding, removing, and editing columns. Changes are staged (not immediately applied), and a "Publish" button applies all staged changes to the live database and generates a migration file.

---

## Architecture

### 1. Edit button
A small pencil icon button added to each `table-box` header in the ER diagram. Clicking it:
- Immediately calls `showModal()` on the shared edit dialog
- Fires `GET /schema/tables/{name}/edit-dialog` to load the column editor via SSE

### 2. Staging area
A new `_picobase_pending_changes` SQLite table (one row per edited table) stores the desired column list as JSON. Changes from the dialog are saved here — the live schema is untouched until Publish.

```sql
CREATE TABLE IF NOT EXISTS _picobase_pending_changes (
  table_name TEXT PRIMARY KEY,
  desired_columns TEXT NOT NULL,  -- JSON array of column objects
  updated_at TEXT DEFAULT (datetime('now'))
)
```

### 3. Publish button
A "Publish" button in the ER diagram toolbar (next to "New Table"). One click:
1. Reads all rows from `_picobase_pending_changes`
2. Computes SQL diff vs current live schema for each table
3. Applies the SQL immediately to the database
4. Writes the SQL as a new `.sql` file to the migrations directory (auto-named, e.g. `003_edit_tables.sql`)
5. Clears `_picobase_pending_changes`
6. Refreshes the ER diagram

---

## Data Flow

```
[Edit button click]
  → showModal() + GET /schema/tables/{name}/edit-dialog
  → SSE patches dialog body with current (or previously-staged) column list

[Add column button in dialog]
  → GET /schema/tables/{name}/new-column-row
  → SSE appends a new empty row to the column list

[Save in dialog]
  → POST /schema/tables/{name}/pending
  → Stores desired column list in _picobase_pending_changes
  → SSE: closes dialog, shows staging indicator on table box header

[Publish button]
  → POST /schema/publish
  → Server: compute diffs, apply SQL to DB, write .sql file, clear staging
  → SSE: patch ER diagram with updated schema, clear all indicators
```

---

## Column Edit Form

Each column row in the dialog contains:

| Field | Control | Notes |
|---|---|---|
| Name | `<input type="text">` | — |
| Type | `<select>` | See types below |
| Default value | `<input list="col-defaults">` | Combobox with suggestions |
| Not null | `<input type="checkbox">` | — |
| Delete | `<button>` | Strikes through row, excluded from save |

Hidden per row: `originalName` — empty string for new columns, the DB name for existing. Used to detect renames.

**Primary key columns** are shown read-only (not editable or deletable).

**Flat Datastar signals used for POST:**
`_col_0_name`, `_col_0_type`, `_col_0_default`, `_col_0_notnull`, `_col_0_original`, `_col_0_deleted`, ..., `_colCount`, `_tableName`

### Column types offered
TEXT, INTEGER, REAL, BLOB, NUMERIC, BOOLEAN, DATE, DATETIME, VARCHAR, JSON

### Default value suggestions (datalist)
NULL, 0, 1, '', CURRENT_TIMESTAMP, CURRENT_DATE, CURRENT_TIME, (datetime('now')), (datetime('now', 'localtime'))

---

## SQL Generation (on Publish)

For each staged table, compare `desired_columns` vs `PRAGMA table_info(table)`:

| Change type | SQL strategy |
|---|---|
| New column (`originalName` empty) | `ALTER TABLE t ADD COLUMN name type [DEFAULT x] [NOT NULL]` |
| Dropped column | `ALTER TABLE t DROP COLUMN name` |
| Rename only | `ALTER TABLE t RENAME COLUMN old TO new` |
| Type / default / notnull changed (or rename + change) | Full table recreation (see below) |

### Table recreation sequence
```sql
BEGIN;
CREATE TABLE _new_t (... new schema ...);
INSERT INTO _new_t SELECT col1, col2, ... FROM t;  -- common columns only
DROP TABLE t;
ALTER TABLE _new_t RENAME TO t;
COMMIT;
```

**V1 limitation:** Table recreation does not preserve indexes or triggers. These will need to be manually re-added to the generated migration if needed.

---

## Visual indicators

- Tables with staged (unpublished) changes show a small dot/badge on their header in the ER diagram.
- The Publish button shows a count badge when there are pending changes (e.g. "Publish (2)").

---

## New files / changes

| File | Change |
|---|---|
| `features/schema/components/table-box.ts` | Add edit button to header |
| `features/schema/components/edit-table-dialog.ts` | New — dialog HTML component |
| `features/schema/router.ts` | Add GET/POST routes for dialog, pending, publish |
| `features/schema/queries.ts` | Add pending changes queries + SQL generation |
| `features/schema/views.ts` | Add Publish button to `erDiagramView` |
| `db/schema-queries.ts` | Add `ensurePendingChangesTable` |
