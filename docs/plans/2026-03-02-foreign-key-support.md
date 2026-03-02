# Foreign Key Support Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a FK reference select to each column row in the edit-table dialog, stored as a pending change and applied to the DB on publish.

**Architecture:** `DesiredColumn` gains `fkRef?: string` ("table.column" format). The dialog populates a single `<select>` from other tables' columns at load time (server-rendered). `generateDiffSQL` detects FK changes and triggers table recreation. Pending FK columns show `⤷` prefix in the table-box.

**Tech Stack:** TypeScript, Hono `html` helper, Datastar signals via SSE, node:sqlite

---

### Task 1: Extend `DesiredColumn` and `buildColumnDef`

**Files:**
- Modify: `packages/picobase/features/schema/queries.ts`

**Step 1: Add `fkRef` to `DesiredColumn`**

In `queries.ts`, extend the interface:

```ts
export interface DesiredColumn {
  name: string
  originalName: string
  type: string
  dflt_value: string
  notnull: boolean
  fkRef: string  // "table.column" or "" for no FK
}
```

**Step 2: Update `buildColumnDef` to append REFERENCES**

```ts
function buildColumnDef(col: DesiredColumn): string {
  let def = `${quoteIdent(col.name)} ${col.type || 'TEXT'}`
  if (col.notnull) def += ' NOT NULL'
  if (col.dflt_value !== '') def += ` DEFAULT ${col.dflt_value}`
  if (col.fkRef) {
    const dot = col.fkRef.indexOf('.')
    const refTable = col.fkRef.slice(0, dot)
    const refCol = col.fkRef.slice(dot + 1)
    def += ` REFERENCES ${quoteIdent(refTable)} (${quoteIdent(refCol)})`
  }
  return def
}
```

**Step 3: Verify TypeScript still compiles**

Run: `pnpm --filter picobase build` (or `pnpm dev` and check for type errors in the terminal).

Expected: no errors. You'll see downstream errors about `fkRef` missing from object literals — fix them in subsequent tasks.

---

### Task 2: Update `generateDiffSQL` to detect FK changes

**Files:**
- Modify: `packages/picobase/features/schema/queries.ts`

**Step 1: Add `currentFKs` parameter to `generateDiffSQL`**

Change the signature:

```ts
export function generateDiffSQL(
  tableName: string,
  current: Column[],
  desired: DesiredColumn[],
  currentFKs: ForeignKey[] = [],
): string {
```

**Step 2: Build a FK lookup map and include FK diff in the `modified` check**

Right after `const currentMap = new Map(...)`, add:

```ts
const fkMap = new Map(currentFKs.map((fk) => [fk.from, `${fk.table}.${fk.to}`]))
```

In the `modified` filter, add the FK check:

```ts
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
```

**Step 3: Update the publish route to pass current FKs**

In `packages/picobase/features/schema/router.ts`, in the `app.post('/publish')` handler, change:

```ts
// Before:
const sql = generateDiffSQL(tableName, current, desiredColumns)

// After:
const currentFKs = getForeignKeys(db, tableName)
const sql = generateDiffSQL(tableName, current, desiredColumns, currentFKs)
```

**Step 4: Commit**

```bash
git add packages/picobase/features/schema/queries.ts packages/picobase/features/schema/router.ts
git commit -m "feat: extend DesiredColumn with fkRef, detect FK changes in diff"
```

---

### Task 3: Update the edit-table dialog to render the FK select

**Files:**
- Modify: `packages/picobase/features/schema/components/edit-table-dialog.ts`

**Step 1: Add `otherSchema` parameter to `editTableDialogContent` and `colRow`**

The `colRow` function needs a list of `{ name: string; columns: { name: string }[] }[]` to build the FK options. Pass it as the last parameter to both `colRow` and `editTableDialogContent`.

`colRow` signature change:

```ts
function colRow(
  i: number,
  col: { name: string; type: string; dflt_value: string; notnull: boolean; originalName: string; pk: boolean; fkRef: string },
  otherSchema: { name: string; columns: { name: string }[] }[],
)
```

**Step 2: Build FK `<select>` options**

Inside `colRow` (non-pk branch), after the `notnull` checkbox, add the FK select:

```ts
const fkOptions = otherSchema.flatMap((t) =>
  t.columns.map((c) => {
    const val = `${t.name}.${c.name}`
    return html`<option value="${val}"${col.fkRef === val ? ' selected' : ''}>${val}</option>`
  })
)

const fkSelect = html`
  <select
    data-bind:editcol_${i}_fkref
    style="flex:2;min-width:0;font-size:11px"
    title="Foreign key reference"
  >
    <option value="">— none —</option>
    ${fkOptions}
  </select>
`
```

**Step 3: Insert `fkSelect` into the row HTML**

Place it between the default input and the not-null checkbox:

```ts
// current order: name | type | default | notnull | ×
// new order:     name | type | default | fkref   | notnull | ×
```

The full row `return html\`...\`` should be:
```ts
return html`
  <div id="edit-col-row-${i}" ... >
    <input data-bind:editcol_${i}_name value="${col.name}" style="flex:2;min-width:0" />
    <select data-bind:editcol_${i}_type style="flex:1.5;min-width:0">
      ${SQLITE_TYPES.map((t) => html`<option value="${t}"${t === col.type ? ' selected' : ''}>${t}</option>`)}
    </select>
    <input list="col-defaults" data-bind:editcol_${i}_default value="${col.dflt_value}" placeholder="NULL" style="flex:1.5;min-width:0" />
    ${fkSelect}
    <input type="checkbox" data-bind:editcol_${i}_notnull ${col.notnull ? 'checked' : ''} />
    <button type="button" title="Remove column"
      data-on:click="$editcol_${i}_deleted = !$editcol_${i}_deleted"
      style="background:none;border:none;cursor:pointer;padding:2px 6px;color:var(--pb-text-faint);font-size:1.1rem;flex-shrink:0">×</button>
  </div>
`
```

**Step 4: Add the FK column header label**

In `editTableDialogContent`, update the header row to include a "Ref" label:

```ts
// Before: Name | Type | Default | Not null | (delete icon)
// After:  Name | Type | Default | Ref      | Not null | (delete icon)
```

Add `<span style="flex:2;font-size:0.72rem;...">Ref</span>` between Default and Not null headers.

**Step 5: Update `editTableDialogContent` signature and pass `otherSchema` to `colRow`**

```ts
export function editTableDialogContent(
  tableName: string,
  dbColumns: Column[],
  base: string,
  pending: DesiredColumn[] | null,
  otherSchema: { name: string; columns: { name: string }[] }[],
)
```

Update the `cols` mapping to include `fkRef`:

```ts
// When building from pending:
{ ..., fkRef: d.fkRef ?? '' }

// When building from dbColumns (no pending yet):
// Need current FK data — read from a fkMap passed in or computed above.
// editTableDialogContent receives dbColumns but not FKs.
// Solution: add a currentFKs parameter too.
```

Actually, to pre-select the current FK for existing columns, `editTableDialogContent` needs to know the current FKs. Add a `currentFKs: ForeignKey[]` parameter:

```ts
export function editTableDialogContent(
  tableName: string,
  dbColumns: Column[],
  base: string,
  pending: DesiredColumn[] | null,
  otherSchema: { name: string; columns: { name: string }[] }[],
  currentFKs: ForeignKey[],
)
```

Build a `fkMap` inside:

```ts
const fkMap = new Map(currentFKs.map((fk) => [fk.from, `${fk.table}.${fk.to}`]))
```

When building `cols` from `dbColumns` (no pending):

```ts
dbColumns.map((c) => ({
  name: c.name,
  type: c.type || 'TEXT',
  dflt_value: c.dflt_value == null ? '' : String(c.dflt_value),
  notnull: c.notnull,
  originalName: c.name,
  pk: c.pk,
  fkRef: fkMap.get(c.name) ?? '',
}))
```

**Step 6: Update `newEmptyColRow` to include the FK select**

```ts
export function newEmptyColRow(
  i: number,
  otherSchema: { name: string; columns: { name: string }[] }[],
)
```

Add the same FK select (with no pre-selected value, i.e., `col.fkRef === ''` always) between the default input and notnull checkbox.

**Step 7: Commit**

```bash
git add packages/picobase/features/schema/components/edit-table-dialog.ts
git commit -m "feat: add FK reference select to edit-table dialog rows"
```

---

### Task 4: Update the router — signals, body reading, and call sites

**Files:**
- Modify: `packages/picobase/features/schema/router.ts`

**Step 1: Update `/tables/:name/edit-dialog` handler**

Call `getFullSchema` and `getForeignKeys`, build `otherSchema`, add `fkref` signals:

```ts
const fullSchema = getFullSchema(db)
const otherSchema = fullSchema.filter((t) => t.name !== tableName)
const currentFKs = getForeignKeys(db, tableName)

// In signals loop, add:
signals[`editcol_${i}_fkref`] = cols[i].fkRef ?? ''
```

Pass `otherSchema` and `currentFKs` to `editTableDialogContent`:

```ts
const bodyHtml = String(
  editTableDialogContent(tableName, dbColumns, base, pending, otherSchema, currentFKs),
)
```

**Step 2: Update `/tables/:name/new-column-row` handler**

Get `otherSchema` and pass to `newEmptyColRow`:

```ts
const tableName = c.req.param('name')
const fullSchema = getFullSchema(db)
const otherSchema = fullSchema.filter((t) => t.name !== tableName)

// Add fkref signal:
signals[`editcol_${idx}_fkref`] = ''

const newRow = String(newEmptyColRow(idx, otherSchema))
```

**Step 3: Update `/tables/:name/pending` handler to read `fkref`**

In the column-building loop, read the FK signal:

```ts
cols.push({
  name,
  originalName: String(body[`editcol_${i}_original`] ?? ''),
  type: String(body[`editcol_${i}_type`] ?? 'TEXT'),
  dflt_value: String(body[`editcol_${i}_default`] ?? ''),
  notnull: Boolean(body[`editcol_${i}_notnull`]),
  fkRef: String(body[`editcol_${i}_fkref`] ?? ''),
})
```

**Step 4: Commit**

```bash
git add packages/picobase/features/schema/router.ts
git commit -m "feat: wire FK signals through edit-dialog and pending endpoints"
```

---

### Task 5: Show FK prefix for pending columns in table-box

**Files:**
- Modify: `packages/picobase/features/schema/components/table-box.ts`

**Step 1: Use `fkRef` to show `⤷` on pending column rows**

In the `pendingColumns` render branch, the `⤷` prefix currently comes from:
```ts
const fk = t.foreignKeys.some((f) => f.from === (c.originalName || c.name)) ? "⤷ " : ""
```

This already handles existing FK columns (from the DB). For new columns with `fkRef` set, also check `c.fkRef`:

```ts
const fk =
  (c.fkRef ? true : t.foreignKeys.some((f) => f.from === (c.originalName || c.name)))
    ? "⤷ "
    : ""
```

**Step 2: Verify dev server**

Run `pnpm dev`, open the ER diagram, create/edit a table, add a column, pick a FK reference, save — confirm the `⤷` appears in the table-box.

**Step 3: Commit**

```bash
git add packages/picobase/features/schema/components/table-box.ts
git commit -m "feat: show FK prefix for pending columns with fkRef set"
```

---

### Task 6: End-to-end smoke test

**Step 1: Start dev server**
```bash
pnpm dev
```

**Step 2: Verify FK select appears**
Open ER diagram → click edit on any table → confirm each non-PK column row has a "Ref" select with `— none —` and all `table.column` options.

**Step 3: Verify pre-population**
On a table that already has FK columns, open the dialog — confirm the FK select is pre-selected with the correct `table.column` value.

**Step 4: Verify pending + publish**
1. Add a new column with a FK reference → Save changes
2. Confirm the table-box shows the new column (muted) with `⤷`
3. Click Publish
4. Confirm the migration SQL in `migrations/` contains `REFERENCES`
5. Reopen the dialog → FK select should now show the persisted reference
