import { html } from "hono/html";
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
  .table-box-table-icon {
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
  .table-box-pk-icon {
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

const pkSvg = html`<svg
  width="11"
  height="11"
  viewBox="0 0 24 24"
  fill="var(--pb-text-heading)"
  class="table-box-pk-icon"
>
  <path
    d="M14.52 2c1.029 0 2.015 .409 2.742 1.136l3.602 3.602a3.877 3.877 0 0 1 0 5.483l-2.643 2.643a3.88 3.88 0 0 1 -4.941 .452l-.105 -.078l-5.882 5.883a3 3 0 0 1 -1.68 .843l-.22 .027l-.221 .009h-1.172c-1.014 0 -1.867 -.759 -1.991 -1.823l-.009 -.177v-1.172c0 -.704 .248 -1.386 .73 -1.96l.149 -.161l.414 -.414a1 1 0 0 1 .707 -.293h1v-1a1 1 0 0 1 .883 -.993l.117 -.007h1v-1a1 1 0 0 1 .206 -.608l.087 -.1l1.468 -1.469l-.076 -.103a3.9 3.9 0 0 1 -.678 -1.963l-.007 -.236c0 -1.029 .409 -2.015 1.136 -2.742l2.643 -2.643a3.88 3.88 0 0 1 2.741 -1.136m.495 5h-.02a2 2 0 1 0 0 4h.02a2 2 0 1 0 0 -4"
  />
</svg>`;

export function tableBox(
  t: TableSchema,
  pos: { x: number; y: number; h: number },
  BOX_W: number,
  BOX_HEADER_H: number,
  ROW_H: number,
  base: string,
  pendingColumns: DesiredColumn[] | null = null,
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
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--pb-diagram-title)"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="table-box-table-icon"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path
            d="M3 5a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-14"
          />
          <path d="M3 10h18" />
          <path d="M10 3v18" />
        </svg>
        <span class="table-box-title"> ${t.name} </span>
        <a
          href="${base}/tables/${t.name}"
          data-tooltip="Browse table"
          class="table-box-link-btn"
        >
          <!-- data-on:click="@get('${base}/tables/${t.name}')" -->
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M9 15l6 -6" />
            <path d="M11 6l.463 -.536a5 5 0 0 1 7.071 7.072l-.534 .464" />
            <path
              d="M13 18l-.397 .534a5.068 5.068 0 0 1 -7.127 0a4.972 4.972 0 0 1 0 -7.071l.524 -.463"
            />
          </svg>
        </a>
        <button
          type="button"
          data-tooltip="Edit table"
          data-on:click="$_editTableDialog.showModal(); @get('${base}/schema/tables/${t.name}/edit-dialog')"
          class="table-box-edit-btn"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path
              d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
            />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
        ${pendingDot}
      </div>
    </div>
    <div class="table-box-rows">${colRows}</div>
  </div>`;
}
