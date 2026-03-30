import { html } from "hono/html";
import { iconX } from "@babybase/ui";
import type { Column } from "../../tables/queries.ts";
import type { DesiredColumn, ForeignKey } from "../queries.ts";

const SQLITE_TYPES = [
  "TEXT",
  "INTEGER",
  "REAL",
  "BLOB",
  "NUMERIC",
  "BOOLEAN",
  "DATE",
  "DATETIME",
  "VARCHAR",
  "JSON",
];

/** Map any declared column type to the nearest SQLite affinity per the spec:
 *  https://www.sqlite.org/datatype3.html#type_affinity */
export function toAffinity(type: string): string {
  const t = type.toUpperCase();
  if (t.includes("INT")) return "INTEGER";
  if (t.includes("CHAR") || t.includes("CLOB") || t.includes("TEXT"))
    return "TEXT";
  if (t.includes("BLOB") || t === "") return "BLOB";
  if (t.includes("REAL") || t.includes("FLOA") || t.includes("DOUB"))
    return "REAL";
  return "NUMERIC";
}

const DEFAULT_SUGGESTIONS = [
  "NULL",
  "0",
  "1",
  "''",
  "CURRENT_TIMESTAMP",
  "CURRENT_DATE",
  "CURRENT_TIME",
  "(datetime('now'))",
  "(datetime('now', 'localtime'))",
];

const css = String.raw;

const shellStyles = css`
  #edit-table-dialog {
    width: min(90vw, 680px);
    height: 100vh;
    overflow: auto;
    top: 0;
    right: 0;
    left: auto;
    max-height: none;
    border-radius: 0;
  }
`;

const contentStyles = css`
  #edit-dialog-body {
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 0;
  }
  #edit-dialog-col-list {
    display: contents;
  }
  .etd-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.25rem;
    background: var(--jazz-neutral-100);
  }
  .etd-header-title {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
  }
  .etd-header-badge {
    color: var(--jazz-neutral-600);
    border: 1px solid var(--jazz-neutral-400);
    border-radius: 6px;
    padding: 0.15rem 0.5rem;
  }
  .etd-fields {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1.25rem;
    /* border-bottom: 1px solid var(--pb-border); */
  }
  .etd-field-row {
    display: grid;
    grid-template-columns: 160px 1fr;
    align-items: center;
    gap: 1rem;
  }
  .etd-field-label {
    font-size: 0.875rem;
    color: var(--pb-text);
  }
  .etd-field-input {
    width: 100%;
    box-sizing: border-box;
  }
  .etd-col-grid {
    display: grid;
    grid-template-columns: 2fr 1.5fr 1.5fr 2fr auto 28px;
    padding: 0 0.5rem;
  }
  .etd-col-labels {
    display: grid;
    grid-column: 1 / -1;
    grid-template-columns: subgrid;
    gap: 8px;
    margin: 0 -0.5rem;
    padding: 0.625rem 1rem;
    font-size: 0.6875rem;
    font-weight: 500;
    color: var(--jazz-neutral-400);
    letter-spacing: 0.06em;
    background: var(--jazz-neutral-100);
    border-top: 1px solid var(--jazz-neutral-300);
    border-bottom: 1px solid var(--jazz-neutral-300);
    align-items: center;
  }
  .etd-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 1rem;
    padding: 0.5rem;
    padding-top: 1rem;
  }
  .etd-footer-actions {
    display: flex;
    gap: 8px;
  }
  .edit-col-row {
    display: grid;
    grid-column: 1 / -1;
    grid-template-columns: subgrid;
    gap: 8px;
    padding: 0.5rem 0;
    border-bottom: 1px solid var(--pb-border);
    align-items: center;
  }
  .edit-col-row--pk {
    opacity: 0.5;
  }
  .col-name {
    flex: 2;
    min-width: 0;
  }
  .col-type {
    flex: 1.5;
    min-width: 0;
  }
  .col-default {
    flex: 1.5;
    min-width: 0;
  }
  .col-fkref {
    flex: 2;
    min-width: 0;
  }
  .col-pk-spacer {
    flex: 2;
    min-width: 0;
  }
  .col-notnull-label {
    white-space: nowrap;
  }
  .col-delete-placeholder {
    display: inline-block;
    width: 28px;
  }

  .col-deleted {
    opacity: 0.35;
    text-decoration: line-through;
  }
  .col-deleted input,
  .col-deleted select {
    pointer-events: none;
  }
  .etd-table-name-input {
    font-size: inherit;
    font-weight: inherit;
    border: none;
    border-bottom: 2px solid transparent;
    background: none;
    color: var(--pb-text);
    padding: 0;
    flex: 1;
    min-width: 0;
    outline: none;
  }
  .etd-table-name-input:focus {
    border-bottom-color: var(--pb-border);
  }
  .etd-table-name-input::placeholder {
    color: var(--pb-text-faint);
    font-weight: 400;
  }
`;

/** Empty dialog shell rendered once in the ER diagram page */
export function editTableDialogShell() {
  return html`
    <dialog id="edit-table-dialog" data-ref="_editTableDialog" closedby="any">
      <style>
        ${shellStyles}
      </style>
      <div id="edit-dialog-body">
        <!-- Populated by SSE when edit button is clicked -->
      </div>
    </dialog>
  `;
}

/** One column row inside the dialog */
function colRow(
  i: number,
  col: {
    name: string;
    type: string;
    dflt_value: string;
    notnull: boolean;
    originalName: string;
    pk: boolean;
    fkRef: string;
  },
  otherSchema: { name: string; columns: { name: string }[] }[],
) {
  if (col.pk) {
    return html`
      <div
        id="edit-col-row-${i}"
        class="edit-col-row edit-col-row--pk"
        title="Primary key columns cannot be edited"
      >
        <input value="${col.name}" disabled class="col-name" type="text" />
        <input value="${col.type}" disabled class="col-type" type="text" />
        <input value="" disabled placeholder="—" class="col-default" type="text" />
        <span class="col-pk-spacer"></span>
        <input type="checkbox" checked disabled />
        <span class="col-delete-placeholder"></span>
      </div>
    `;
  }

  const fkRef = col.fkRef;
  const fkOptions = otherSchema.flatMap((t) =>
    t.columns.map((c) => {
      const val = `${t.name}.${c.name}`;
      return html`<option
        value="${val}"
        ${fkRef === val ? html` selected` : ""}
      >
        ${val}
      </option>`;
    }),
  );

  const fkSelect = html`<select
    data-bind:editcol_${i}_fkref
    class="col-fkref"
    title="Foreign key reference"
  >
    <option value="">— none —</option>
    ${fkOptions}
  </select>`;

  return html`
    <div
      id="edit-col-row-${i}"
      class="edit-col-row"
      data-class="{'col-deleted': $editcol_${i}_deleted}"
    >
      <input
        data-bind:editcol_${i}_name
        value="${col.name}"
        class="col-name"
        type="text"
      />
      <select data-bind:editcol_${i}_type class="col-type">
        ${SQLITE_TYPES.map(
          (t) =>
            html`<option value="${t}" ${t === col.type ? " selected" : ""}>
              ${t}
            </option>`,
        )}
      </select>
      <input
        list="col-defaults"
        data-bind:editcol_${i}_default
        value="${col.dflt_value}"
        placeholder="NULL"
        class="col-default"
        type="text"
      />
      ${fkSelect}
      <input
        type="checkbox"
        data-bind:editcol_${i}_notnull
        ${col.notnull ? "checked" : ""}
      />
      <button
        type="button"
        title="Remove column"
        data-on:click="$editcol_${i}_deleted = !$editcol_${i}_deleted"
        class="square destructive ghost"
      >
        ${iconX(16)}
      </button>
    </div>
  `;
}

/** Full dialog body content — patched via SSE when edit button is clicked */
export function editTableDialogContent(
  tableName: string,
  dbColumns: Column[],
  base: string,
  pending: DesiredColumn[] | null,
  otherSchema: { name: string; columns: { name: string }[] }[],
  currentFKs: ForeignKey[],
) {
  const fkMap = new Map(
    currentFKs.map((fk) => [fk.from, `${fk.table}.${fk.to}`]),
  );

  const cols: Array<{
    name: string;
    type: string;
    dflt_value: string;
    notnull: boolean;
    originalName: string;
    pk: boolean;
    fkRef: string;
  }> = pending
    ? pending.map((d) => ({
        name: d.name,
        type: d.type,
        dflt_value: d.dflt_value,
        notnull: d.notnull,
        originalName: d.originalName,
        pk: dbColumns.find((c) => c.name === d.originalName)?.pk ?? false,
        fkRef: d.fkRef ?? "",
      }))
    : dbColumns.map((c) => ({
        name: c.name,
        type: toAffinity(c.type || ""),
        dflt_value: c.dflt_value == null ? "" : String(c.dflt_value),
        notnull: c.notnull,
        originalName: c.name,
        pk: c.pk,
        fkRef: fkMap.get(c.name) ?? "",
      }));

  const rows = cols.map((col, i) => colRow(i, col, otherSchema));

  return html`
    <style>
      ${contentStyles}
    </style>

    <div class="etd-header">
      <h2 class="etd-header-title">
        Update table
        <span class="etd-header-badge">${tableName}</span>
      </h2>
      <button
        type="button"
        data-on:click="$_editTableDialog.close()"
        class="ghost square"
      >
        ${iconX(16)}
      </button>
    </div>

    <div class="etd-fields">
      <div class="etd-field-row">
        <label class="etd-field-label" for="etd-name-input">Table name</label>
        <input
          id="etd-name-input"
          data-bind:editTableName
          value="${tableName}"
          class="etd-field-input"
          type="text"
        />
      </div>
    </div>

    <div class="etd-col-grid">
      <div class="etd-col-labels">
        <span class="col-name">Name</span>
        <span class="col-type">Type</span>
        <span class="col-default">Default</span>
        <span class="col-fkref">Ref</span>
        <span class="col-notnull-label">Not null</span>
        <span class="col-delete-placeholder"></span>
      </div>

      <div id="edit-dialog-col-list">${rows}</div>
    </div>

    <datalist id="col-defaults">
      ${DEFAULT_SUGGESTIONS.map((s) => html`<option value="${s}"></option>`)}
    </datalist>

    <div class="etd-footer">
      <button
        type="button"
        class="outline"
        data-on:click="@get('${base}/schema/tables/${tableName}/new-column-row?idx=' + $editColCount)"
      >
        + Add column
      </button>
      <div class="etd-footer-actions">
        <button type="button" class="ghost" data-on:click="$_editTableDialog.close()">
          Cancel
        </button>
        <button
          type="button"
          class="primary"
          data-on:click="@post('${base}/schema/tables/${tableName}/pending'); $_editTableDialog.close()"
        >
          Save changes
        </button>
      </div>
    </div>
  `;
}

/** A single new empty column row (appended via SSE on "Add column") */
export function newEmptyColRow(
  i: number,
  otherSchema: { name: string; columns: { name: string }[] }[],
) {
  const fkOptions = otherSchema.flatMap((t) =>
    t.columns.map((c) => {
      const val = `${t.name}.${c.name}`;
      return html`<option value="${val}">${val}</option>`;
    }),
  );

  const fkSelect = html`<select
    data-bind:editcol_${i}_fkref
    class="col-fkref"
    title="Foreign key reference"
  >
    <option value="">— none —</option>
    ${fkOptions}
  </select>`;

  return html`
    <div
      id="edit-col-row-${i}"
      class="edit-col-row"
      data-class="{'col-deleted': $editcol_${i}_deleted}"
    >
      <input
        data-bind:editcol_${i}_name
        placeholder="column_name"
        class="col-name"
        type="text"
      />
      <select data-bind:editcol_${i}_type class="col-type">
        ${SQLITE_TYPES.map((t) => html`<option value="${t}">${t}</option>`)}
      </select>
      <input
        list="col-defaults"
        data-bind:editcol_${i}_default
        placeholder="NULL"
        class="col-default"
        type="text"
      />
      ${fkSelect}
      <input type="checkbox" data-bind:editcol_${i}_notnull />
      <button
        type="button"
        title="Remove column"
        data-on:click="$editcol_${i}_deleted = !$editcol_${i}_deleted"
        class="destructive ghost square"
      >
        ${iconX(16)}
      </button>
    </div>
  `;
}

/** Dialog body for creating a brand-new table — opened via the "New Table" button */
export function newTableDialogContent(base: string) {
  return html`
    <style>
      ${contentStyles}
    </style>

    <div class="etd-header">
      <h2 class="etd-header-title">
        New table
        <input
          data-bind:newtablename
          placeholder="table_name"
          class="etd-table-name-input"
          autofocus
          type="text"
        />
      </h2>
      <button
        type="button"
        data-on:click="$_editTableDialog.close()"
        class="ghost square"
      >
        ${iconX(16)}
      </button>
    </div>

    <div class="etd-col-grid">
      <div class="etd-col-labels">
        <span class="col-name">Name</span>
        <span class="col-type">Type</span>
        <span class="col-default">Default</span>
        <span class="col-fkref">Ref</span>
        <span class="col-notnull-label">Not null</span>
        <span class="col-delete-placeholder"></span>
      </div>

      <div id="edit-dialog-col-list"></div>
    </div>

    <datalist id="col-defaults">
      ${DEFAULT_SUGGESTIONS.map((s) => html`<option value="${s}"></option>`)}
    </datalist>

    <div class="etd-footer">
      <button
        type="button"
        class="outline"
        data-on:click="@get('${base}/schema/tables/new-col-row?idx=' + $editColCount)"
      >
        + Add column
      </button>
      <div class="etd-footer-actions">
        <button class="ghost" type="button" data-on:click="$_editTableDialog.close()">
          Cancel
        </button>
        <button
          type="button"
          data-on:click="@post('${base}/schema/tables/new'); $_editTableDialog.close()"
        >
          Create table
        </button>
      </div>
    </div>
  `;
}
