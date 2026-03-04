import { html, raw } from "hono/html";
import type { Column } from "./queries.ts";

const css = String.raw;

const emptyStateStyles = css`
  .tables-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 5rem 2rem;
    text-align: center;
    gap: 0.75rem;
  }
  .tables-empty-icon {
    background: var(--pb-bg);
    border-radius: 50%;
    width: 60px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--pb-text-muted);
    margin-bottom: 0.5rem;
  }
  .tables-empty-title {
    font-size: 1rem;
    font-weight: 600;
    margin: 0;
  }
  .tables-empty-body {
    font-size: 0.875rem;
    color: var(--pb-text-muted);
    max-width: 300px;
    margin: 0 0 0.5rem;
    line-height: 1.5;
  }
`;

const rowsStyles = css`
  .rows-wrapper {
    display: contents;
  }
  #table-tabs-bar {
    position: fixed;
    top: 1rem;
    left: 50%;
    transform: translateX(-50%);
    z-index: 100;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  #table-tabs-bar .ctrl-group {
    display: flex;
    align-items: center;
    gap: 2px;
    background: var(--pb-surface);
    border: 1px solid var(--pb-border);
    border-radius: 10px;
    padding: 3px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
    flex-shrink: 0;
  }
  #table-tabs-bar .ctrl-group a {
    width: 28px;
    height: 28px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: 7px;
    color: var(--pb-text-muted);
    text-decoration: none;
    transition:
      background 0.12s,
      color 0.12s;
  }
  #table-tabs-bar .ctrl-group a:hover {
    background: var(--pb-nav-hover);
    color: var(--pb-text-heading);
    border-color: transparent;
  }
  .table-tabs-wrap {
    background: var(--pb-surface);
    border: 1px solid var(--pb-border);
    border-radius: 10px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
    padding: 3px;
    max-width: calc(100vw - 24rem);
  }
  .table-tabs-wrap::before,
  .table-tabs-wrap::after {
    content: "";
    position: absolute;
    top: 3px;
    bottom: 3px;
    width: 2.5rem;
    pointer-events: none;
    z-index: 1;
    opacity: 0;
    transition: opacity 0.15s;
  }
  .table-tabs-wrap::before {
    left: 3px;
    border-radius: 7px 0 0 7px;
    background: linear-gradient(to right, var(--pb-surface), transparent);
  }
  .table-tabs-wrap::after {
    right: 3px;
    border-radius: 0 7px 7px 0;
    background: linear-gradient(to left, var(--pb-surface), transparent);
  }
  .table-tabs-wrap.fade-left::before {
    opacity: 1;
  }
  .table-tabs-wrap.fade-right::after {
    opacity: 1;
  }
  #table-tabs {
    position: static;
    background: none;
    border: none;
    border-radius: 0;
    box-shadow: none;
    padding: 0;
    gap: 2px;
    overflow-x: auto;
    scrollbar-width: none;
    flex-wrap: nowrap;
    max-width: none;
  }
  #table-tabs::-webkit-scrollbar {
    display: none;
  }
  #table-tabs a {
    padding: 0.4rem 0.875rem;
    height: 28px;
    border-radius: 7px;
    color: var(--pb-text-muted);
  }
  #table-tabs a:hover {
    background: var(--pb-nav-hover);
    color: var(--pb-text-heading);
  }
  #table-tabs a.active {
    background: rgba(255, 255, 255, 0.1);
    color: #fafafa;
  }
  .rows-container {
    padding: 4.5rem 1.5rem 6rem;
    max-width: 1200px;
    margin-inline: auto;
    width: 100%;
  }
  .rows-card {
    background: var(--pb-surface);
    border: 1px solid var(--pb-border);
    border-radius: 12px;
    overflow: hidden;
  }
  .row-count {
    padding: 0.625rem 0.875rem;
    font-size: 0.8rem;
    color: var(--pb-text-muted);
    border-top: 1px solid var(--pb-border);
  }
  .pk-cell {
    font-size: 0.8rem;
  }
`;

export function tableListView(tables: string[], basePath: string): string {
  const base = basePath.replace(/\/$/, "");
  if (tables.length === 0) {
    return String(
      html`<div id="tables-view">
        <style>
          ${raw(emptyStateStyles)}
        </style>
        <div class="tables-empty">
          <div class="tables-empty-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="icon icon-tabler icons-tabler-outline icon-tabler-table-off"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path
                d="M7 3h12a2 2 0 0 1 2 2v12m-.585 3.413a1.994 1.994 0 0 1 -1.415 .587h-14a2 2 0 0 1 -2 -2v-14c0 -.55 .223 -1.05 .583 -1.412"
              />
              <path d="M3 10h7m4 0h7" />
              <path d="M10 3v3m0 4v11" />
              <path d="M3 3l18 18" />
            </svg>
          </div>
          <h3 class="tables-empty-title">No tables yet</h3>
          <p class="tables-empty-body">
            Create your first table in the Schema view to start storing data.
          </p>
          <button class="primary" data-on:click="@get('${base}/schema')">
            Go to Schema
          </button>
        </div>
      </div>`,
    );
  }
  const rows = tables
    .map(
      (t) =>
        `<tr><td><a href="${basePath}/tables/${t}" data-on:click="@get('${basePath}/tables/${t}')">${t}</a></td></tr>`,
    )
    .join("\n");
  return String(
    html` <table>
      <thead>
        <tr>
          <th>Name</th>
        </tr>
      </thead>
      <tbody>
        ${raw(rows)}
      </tbody>
    </table>`,
  );
}

export function buildTabBar(
  tables: string[],
  table: string,
  basePath: string,
): string {
  if (tables.length === 0) return "";
  const base = basePath.replace(/\/$/, "");
  const links = tables
    .map(
      (t) =>
        `<a href="${base}/tables/${t}" data-on:click__prevent="@get('${base}/tables/${t}')"${t === table ? ' class="active"' : ""}>${t}</a>`,
    )
    .join("");
  return `<div id="table-tabs-bar">
  <div class="ctrl-group">
    <a href="${base}/schema" data-on:click="@get('${base}/schema')" data-tooltip="Back to schemas" aria-label="Schema">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 12l14 0"/><path d="M5 12l6 6"/><path d="M5 12l6 -6"/></svg>
    </a>
  </div>
  <div id="table-tabs-wrap" class="table-tabs-wrap"><nav id="table-tabs" class="tab-bar">${links}</nav></div>
</div>
<script>
(function () {
  var nav = document.getElementById('table-tabs');
  var wrap = nav && nav.parentElement;
  if (!nav || !wrap) return;
  function update() {
    var sl = nav.scrollLeft;
    var max = nav.scrollWidth - nav.clientWidth;
    wrap.classList.toggle('fade-left', sl > 2);
    wrap.classList.toggle('fade-right', max > 2 && sl < max - 2);
  }
  nav.addEventListener('scroll', update);
  update();
})();
</script>`;
}

export function buildRowsContainer(opts: {
  table: string;
  columns: Column[];
  rows: Record<string, unknown>[];
  page: number;
  total: number;
  limit: number;
  basePath: string;
}): string {
  const { table, columns, rows, page, total, limit, basePath } = opts;
  const totalPages = Math.ceil(total / limit);
  const pkCol = columns.find((c) => c.pk);

  const headers = columns
    .map(
      (c) =>
        `<th>${c.name}${c.pk ? ' <span class="badge pk">PK</span>' : ""}</th>`,
    )
    .join("");

  const dataRows = rows
    .map((row) => {
      const rowid = pkCol ? row[pkCol.name] : null;
      const cells = columns
        .map((c) => `<td>${String(row[c.name] ?? "")}</td>`)
        .join("");
      return `<tr id="row-${rowid}">${cells}<td><button class="danger" data-on:click="@delete('${basePath}/tables/${table}/${rowid}')">Delete</button></td></tr>`;
    })
    .join("\n");

  const pageNums = [
    ...new Set(
      [1, totalPages, page - 1, page, page + 1].filter(
        (p) => p >= 1 && p <= totalPages,
      ),
    ),
  ].sort((a, b) => a - b);
  const pageItems: (number | "...")[] = [];
  for (let i = 0; i < pageNums.length; i++) {
    if (i > 0 && pageNums[i] - pageNums[i - 1] > 1) pageItems.push("...");
    pageItems.push(pageNums[i]);
  }
  const pageUrl = (p: number) =>
    `@get('${basePath}/tables/${table}?page=${p}')`;
  const pageButtons = pageItems
    .map((item) =>
      item === "..."
        ? `<span class="pagination-dots">···</span>`
        : item === page
          ? `<button class="pagination-btn active">${item}</button>`
          : `<button class="pagination-btn" data-on:click="${pageUrl(item)}">${item}</button>`,
    )
    .join("");

  const pagination =
    totalPages > 1
      ? `<nav class="pagination">
          ${page > 1 ? `<button class="pagination-btn" data-on:click="${pageUrl(page - 1)}">&#8249; Previous</button>` : `<button class="pagination-btn" disabled>&#8249; Previous</button>`}
          <span class="pagination-buttons">${pageButtons}</span>
          ${page < totalPages ? `<button class="pagination-btn" data-on:click="${pageUrl(page + 1)}">Next &#8250;</button>` : `<button class="pagination-btn" disabled>Next &#8250;</button>`}
        </nav>`
      : `<p class="row-count">${total} row${total !== 1 ? "s" : ""}</p>`;

  const insertCols = columns.filter((c) => !c.pk);
  const resetSignals = insertCols.map((c) => `$${c.name}=''`).join(";");
  const insertCells = columns
    .map((c) => {
      if (c.pk) return `<td class="text-faint pk-cell">—</td>`;
      const hasDefault = c.dflt_value != null;
      const placeholder = hasDefault
        ? `default: ${c.dflt_value}`
        : c.type || "text";
      const required = c.notnull && !hasDefault ? " required" : "";
      return `<td><input data-bind:${c.name} placeholder="${placeholder}"${required}></td>`;
    })
    .join("");
  const insertRow =
    insertCols.length > 0
      ? `<tr>${insertCells}<td><button class="primary" data-on:click="@post('${basePath}/tables/${table}')${resetSignals ? `;${resetSignals}` : ""}">Add</button></td></tr>`
      : "";

  return `<div id="rows-container" class="rows-container"><div class="rows-card"><table><thead><tr>${headers}<th></th></tr></thead><tbody id="rows-${table}">${insertRow}${dataRows}</tbody></table>${pagination}</div></div>`;
}

export function rowsView(opts: {
  table: string;
  tables: string[];
  columns: Column[];
  rows: Record<string, unknown>[];
  page: number;
  total: number;
  limit: number;
  basePath: string;
}): string {
  const { table, tables, columns, rows, page, total, limit, basePath } = opts;
  const insertCols = columns.filter((c) => !c.pk);
  const colSignals = insertCols.map((c) => `${c.name}:''`).join(",");
  const signalsAttr = colSignals ? `{${colSignals}}` : `{}`;

  return String(
    html`<div
      id="rows-view"
      class="rows-wrapper"
      data-signals="${raw(signalsAttr)}"
    >
      <style>
        ${raw(rowsStyles)}
      </style>
      ${raw(buildTabBar(tables, table, basePath))}
      ${raw(
        buildRowsContainer({
          table,
          columns,
          rows,
          page,
          total,
          limit,
          basePath,
        }),
      )}
    </div>`,
  );
}
