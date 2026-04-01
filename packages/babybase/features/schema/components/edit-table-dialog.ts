import { html } from "hono/html";
import { iconChevronDown, iconX } from "../../../components/icons.ts";
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
    width: min(90vw, 750px);
    max-width: none;
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
    > header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 1.25rem;
      background: var(--jazz-neutral-100);
    }

    table {
      border-radius: 0;
      border-inline: none;
    }

    td {
      display: flex;
      align-items: center;
    }

    input:not([type="checkbox"]),
    select {
      width: 100%;
    }
  }

  .etd-header-title {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    white-space: nowrap;
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
  }
  .etd-field-row {
    display: grid;
    grid-template-columns: 160px 1fr;
    align-items: center;
    gap: 1rem;
  }
  .etd-field-label {
    font-size: 0.875rem;
    color: var(--jazz-neutral-900);
  }
  .etd-field-input {
    width: 100%;
    box-sizing: border-box;
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
  .edit-col-row--pk {
    opacity: 0.5;
  }
  .col-deleted {
    opacity: 0.35;
    text-decoration: line-through;
  }
  .col-deleted input,
  .col-deleted select {
    pointer-events: none;
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

function customSelect(
  popoverId: string,
  signalName: string,
  options: { value: string; label: string; selected: boolean }[],
  placeholder: string,
) {
  return html`
    <button type="button" popovertarget="${popoverId}" class="outline">
      <span data-text="$${signalName} || '${placeholder}'"></span>
      ${iconChevronDown(14)}
    </button>
    <div id="${popoverId}" popover onchange="this.hidePopover()">
      <menu>
        ${options.map(
          ({ value, label, selected }) => html`
            <li>
              <label>
                <input
                  type="radio"
                  name="${signalName}"
                  data-bind:${signalName}
                  value="${value}"
                  ${selected ? "checked" : ""}
                />
                ${label}
              </label>
            </li>
          `,
        )}
      </menu>
    </div>
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
      <tr
        id="edit-col-row-${i}"
        class="edit-col-row--pk"
        title="Primary key columns cannot be edited"
      >
        <td><input value="${col.name}" disabled type="text" /></td>
        <td><input value="${col.type}" disabled type="text" /></td>
        <td><input value="" disabled placeholder="—" type="text" /></td>
        <td></td>
        <td><input type="checkbox" checked disabled /></td>
        <td></td>
      </tr>
    `;
  }

  const fkRef = col.fkRef;
  const fkOptions = [
    { value: "", label: "— none —", selected: fkRef === "" },
    ...otherSchema.flatMap((t) =>
      t.columns.map((c) => {
        const val = `${t.name}.${c.name}`;
        return { value: val, label: val, selected: fkRef === val };
      }),
    ),
  ];

  const fkSelect = customSelect(
    `editcol-${i}-fk`,
    `editcol_${i}_fkref`,
    fkOptions,
    "— none —",
  );

  return html`
    <tr
      id="edit-col-row-${i}"
      data-class="{'col-deleted': $editcol_${i}_deleted}"
    >
      <td>
        <input data-bind:editcol_${i}_name value="${col.name}" type="text" />
      </td>
      <td>
        ${customSelect(
          `editcol-${i}-type`,
          `editcol_${i}_type`,
          SQLITE_TYPES.map((t) => ({
            value: t,
            label: t,
            selected: t === col.type,
          })),
          "Select type",
        )}
      </td>
      <td>
        ${customSelect(
          `editcol-${i}-default`,
          `editcol_${i}_default`,
          [
            { value: "", label: "— none —", selected: col.dflt_value === "" },
            ...DEFAULT_SUGGESTIONS.map((s) => ({
              value: s,
              label: s,
              selected: s === col.dflt_value,
            })),
          ],
          "NULL",
        )}
      </td>
      <td>${fkSelect}</td>
      <td>
        <input
          type="checkbox"
          data-bind:editcol_${i}_notnull
          ${col.notnull ? "checked" : ""}
        />
      </td>
      <td>
        <button
          type="button"
          title="Remove column"
          data-on:click="$editcol_${i}_deleted = !$editcol_${i}_deleted"
          class="square destructive ghost"
        >
          ${iconX(16)}
        </button>
      </td>
    </tr>
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

    <header>
      <h4 class="etd-header-title">
        Update table
        <span class="etd-header-badge">${tableName}</span>
      </h4>
      <button
        type="button"
        data-on:click="$_editTableDialog.close()"
        class="ghost square"
      >
        ${iconX(16)}
      </button>
    </header>

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

    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Type</th>
          <th>Default</th>
          <th>Ref</th>
          <th>Not null</th>
          <th></th>
        </tr>
      </thead>
      <tbody id="edit-dialog-col-list">
        ${rows}
      </tbody>
    </table>

    <div class="etd-footer">
      <button
        type="button"
        class="outline"
        data-on:click="@get('${base}/schema/tables/${tableName}/new-column-row?idx=' + $editColCount)"
      >
        + Add column
      </button>
      <div class="etd-footer-actions">
        <button
          type="button"
          class="ghost"
          data-on:click="$_editTableDialog.close()"
        >
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
  const fkSelect = customSelect(
    `editcol-${i}-fk`,
    `editcol_${i}_fkref`,
    [
      { value: "", label: "— none —", selected: true },
      ...otherSchema.flatMap((t) =>
        t.columns.map((c) => {
          const val = `${t.name}.${c.name}`;
          return { value: val, label: val, selected: false };
        }),
      ),
    ],
    "— none —",
  );

  return html`
    <tr
      id="edit-col-row-${i}"
      data-class="{'col-deleted': $editcol_${i}_deleted}"
    >
      <td>
        <input
          data-bind:editcol_${i}_name
          placeholder="column_name"
          type="text"
        />
      </td>
      <td>
        ${customSelect(
          `editcol-${i}-type`,
          `editcol_${i}_type`,
          SQLITE_TYPES.map((t, idx) => ({
            value: t,
            label: t,
            selected: idx === 0,
          })),
          "Select type",
        )}
      </td>
      <td>
        ${customSelect(
          `editcol-${i}-default`,
          `editcol_${i}_default`,
          [
            { value: "", label: "— none —", selected: true },
            ...DEFAULT_SUGGESTIONS.map((s) => ({
              value: s,
              label: s,
              selected: false,
            })),
          ],
          "NULL",
        )}
      </td>
      <td>${fkSelect}</td>
      <td>
        <input type="checkbox" data-bind:editcol_${i}_notnull />
      </td>
      <td>
        <button
          type="button"
          title="Remove column"
          data-on:click="$editcol_${i}_deleted = !$editcol_${i}_deleted"
          class="destructive ghost square"
        >
          ${iconX(16)}
        </button>
      </td>
    </tr>
  `;
}

/** Dialog body for creating a brand-new table — opened via the "New Table" button */
export function newTableDialogContent(base: string) {
  return html`
    <style>
      ${contentStyles}
    </style>

    <header>
      <h4 class="etd-header-title">
        New table
        <input
          data-bind:newtablename
          placeholder="table_name"
          class="etd-table-name-input"
          autofocus
          type="text"
        />
      </h4>
      <button
        type="button"
        data-on:click="$_editTableDialog.close()"
        class="ghost square"
      >
        ${iconX(16)}
      </button>
    </header>

    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Type</th>
          <th>Default</th>
          <th>Ref</th>
          <th>Not null</th>
          <th></th>
        </tr>
      </thead>
      <tbody id="edit-dialog-col-list"></tbody>
    </table>

    <div class="etd-footer">
      <button
        type="button"
        class="outline"
        data-on:click="@get('${base}/schema/tables/new-col-row?idx=' + $editColCount)"
      >
        + Add column
      </button>
      <div class="etd-footer-actions">
        <button
          class="ghost"
          type="button"
          data-on:click="$_editTableDialog.close()"
        >
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
