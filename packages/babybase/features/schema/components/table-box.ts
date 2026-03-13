import { html } from "hono/html";
import { iconKey, iconLink, iconPencil, iconTable } from "@babybase/ui";
import type { DesiredColumn, TableSchema } from "../queries.ts";

const css = String.raw;

export const tableBoxStyles = css`
  .table-box {
    user-select: none;
    position: absolute;
    border: 1px solid var(--pb-border);
    border-radius: 8px;
    overflow: visible;
    background: var(--pb-surface);
  }
  .table-box-header {
    display: flex;
    align-items: center;
    position: relative;
    background: var(--pb-diagram-header);
    border-bottom: 1px solid var(--pb-border);
    border-radius: 8px 8px 0 0;
  }
  .table-box-rows {
    overflow: hidden;
    border-radius: 0 0 8px 8px;
  }
  .table-box-header-inner {
    display: flex;
    align-items: center;
    padding: 0 10px;
    gap: 6px;
    cursor: grab;
    width: 100%;
    height: 100%;
  }
  .table-box-header-inner > svg {
    flex-shrink: 0;
    pointer-events: none;
  }
  .table-box-title {
    font-size: 12px;
    font-weight: 500;
    color: var(--pb-diagram-title);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
    pointer-events: none;
  }
  .table-box-edit-btn,
  .table-box-link-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 3px 5px;
    color: var(--pb-text-faint);
    display: flex;
    align-items: center;
    text-decoration: none;
    position: relative;
    height: 28px;
  }
  .table-box-edit-btn:hover,
  .table-box-link-btn:hover {
    background: none;
    color: var(--pb-text-muted);
  }
  .table-box-edit-btn[data-tooltip]::before,
  .table-box-link-btn[data-tooltip]::before {
    top: unset;
    bottom: calc(100% + calc(6px / var(--pb-zoom, 1)));
    padding: calc(4px / var(--pb-zoom, 1)) calc(8px / var(--pb-zoom, 1));
    border-radius: calc(6px / var(--pb-zoom, 1));
    font-size: calc(11px / var(--pb-zoom, 1));
  }
  .table-box-edit-btn[data-tooltip]::after,
  .table-box-link-btn[data-tooltip]::after {
    top: unset;
    bottom: calc(100% + 2px);
    border-bottom-color: transparent;
    border-top-color: #000;
  }
  .table-box-pending-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--pb-primary, #f97316);
    flex-shrink: 0;
    pointer-events: none;
  }
  .table-box-row {
    display: flex;
    align-items: center;
    padding: 0 10px;
    pointer-events: none;
  }
  .table-box-row--pending-new {
    opacity: 0.45;
  }
  .table-box-row > svg {
    flex-shrink: 0;
    margin-right: 5px;
  }
  .table-box-col-name {
    font-size: 11px;
    color: var(--pb-text-heading);
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .table-box-col-type {
    font-size: 10px;
    color: var(--pb-text-faint);
    font-family: var(--pb-monospace);
    letter-spacing: 0.05em;
    white-space: nowrap;
    padding-left: 8px;
  }
`;

const pkSvg = iconKey(11);

export function tableBox(
  t: TableSchema,
  pos: { x: number; y: number; h: number },
  BOX_W: number,
  BOX_HEADER_H: number,
  ROW_H: number,
  base: string,
  pendingColumns: DesiredColumn[] | null = null,
  readonly = false,
) {
  const hasPending = pendingColumns !== null;
  const pkMap = new Map(t.columns.map((c) => [c.name, c]));

  const colRows = pendingColumns
    ? pendingColumns.map((c, ci) => {
        const isNew = c.originalName === "";
        const isPk = !isNew && (pkMap.get(c.originalName)?.pk ?? false);
        const fk =
          c.fkRef ||
          (!isNew && t.foreignKeys.some((f) => f.from === c.originalName))
            ? "⤷ "
            : "";
        const bg = ci % 2 === 1 ? "var(--pb-diagram-row-alt)" : "var(--pb-bg)";
        const extraClass = isNew ? " table-box-row--pending-new" : "";
        return html`<div
          class="table-box-row${extraClass}"
          style="height:${ROW_H}px;background:${bg}"
        >
          ${isPk ? pkSvg : ""}
          <span class="table-box-col-name"
            >${fk}${c.name}${c.dflt_value ? ` = ${c.dflt_value}` : ""}</span
          >
          <span class="table-box-col-type">${c.type || "ANY"}</span>
        </div>`;
      })
    : t.columns.map((c, ci) => {
        const fk = t.foreignKeys.some((f) => f.from === c.name) ? "⤷ " : "";
        const bg = ci % 2 === 1 ? "var(--pb-diagram-row-alt)" : "var(--pb-bg)";
        return html`<div
          class="table-box-row"
          style="height:${ROW_H}px;background:${bg}"
        >
          ${c.pk ? pkSvg : ""}
          <span class="table-box-col-name"
            >${fk}${c.name}${
              c.dflt_value != null ? ` = ${String(c.dflt_value)}` : ""
            }</span
          >
          <span class="table-box-col-type">${c.type || "ANY"}</span>
        </div>`;
      });

  const pendingDot = hasPending
    ? html`<span
        id="pending-dot-${t.name}"
        title="Unpublished changes"
        class="table-box-pending-dot"
      ></span>`
    : html`<span id="pending-dot-${t.name}" style="display:none"></span>`;

  return html`<div
    data-table="${t.name}"
    data-h="${pos.h}"
    class="table-box"
    style="left:${pos.x}px;top:${pos.y}px;width:${BOX_W}px"
  >
    <div class="table-box-header" style="height:${BOX_HEADER_H}px">
      <div data-header="true" class="table-box-header-inner">
        ${iconTable(13, "var(--pb-diagram-title)")}
        <span class="table-box-title"> ${t.name} </span>
        <a
          href="${base}/tables/${t.name}"
          data-tooltip="Browse table"
          class="table-box-link-btn"
        >
          <!-- data-on:click="@get('${base}/tables/${t.name}')" -->
          ${iconLink(12)}
        </a>
        ${!readonly ? html`<button
          type="button"
          data-tooltip="Edit table"
          data-on:click="$_editTableDialog.showModal(); @get('${base}/schema/tables/${t.name}/edit-dialog')"
          class="table-box-edit-btn"
        >
          ${iconPencil(12)}
        </button>` : ""}
        ${pendingDot}
      </div>
    </div>
    <div class="table-box-rows">${colRows}</div>
  </div>`;
}
