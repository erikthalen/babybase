# Foreign Key Support in Edit-Table Dialog

**Date:** 2026-03-02

## Goal

Allow users to mark a column as a foreign key reference to another table's column directly from the edit-table dialog. The FK is saved as a pending change and applied to the database on publish.

## UI (Option A — single select)

Each editable column row in the dialog gets a `<select>` showing:
- `— none —` (empty, default)
- One option per `table.column` for all other tables in the schema

The select is populated at dialog load time (server has full schema). PK rows remain disabled. Signal name: `editcol_${i}_fkref`.

Row layout: `name | type | default | FK ref | notnull | ×`

## Data Model

`DesiredColumn` gains an optional field:

```ts
fkRef?: string  // "table.column" | "" (no FK)
```

## SQL Generation

- `buildColumnDef` appends `REFERENCES "table" ("column")` when `fkRef` is non-empty.
- Adding a FK to an **existing** column or changing an existing FK is treated as "modified", triggering table recreation.
- Adding a FK on a **new** column uses `ALTER TABLE ADD COLUMN ... REFERENCES`.

FK equality check: compare `fkRef` from pending against current FK from `getForeignKeys`.

## Signal Flow

1. `/tables/:name/edit-dialog` — calls `getFullSchema(db)`, passes other tables to `editTableDialogContent`. Initialises `editcol_${i}_fkref` signals from existing FK data.
2. Edit dialog renders FK `<select>` per column row.
3. User picks a target; signal updates.
4. `@post` to `/tables/:name/pending` — server reads `editcol_${i}_fkref` from body, stores in `DesiredColumn.fkRef`.

## Pending Display

`tableBox` already resolves FK prefix (`⤷`) from `t.foreignKeys`. For pending columns, resolve FK prefix from `fkRef` string directly — no DB lookup needed.

## Out of Scope

- SVG relation lines for pending FKs (pre-publish preview arrows).
- Cascade rules (ON DELETE / ON UPDATE).
- Composite foreign keys.
