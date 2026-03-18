import { html, raw } from "hono/html";
import {
  iconArrowDown,
  iconArrowLeft,
  iconArrowsUpDown,
  iconArrowUp,
  iconBraces,
  iconCalendar,
  iconFile,
  iconHash,
  iconLetterT,
  iconTableOff,
  iconToggleLeft,
  tableTabsScript,
} from "@babybase/ui";
import type { Column } from "./queries.ts";

const css = String.raw;

const rowsStyles = css`
  .rows-wrapper {
    display: contents;
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
  .rows-table-wrap {
    overflow-x: auto;
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
  th.sortable {
    cursor: pointer;
    user-select: none;
    white-space: nowrap;
    color: var(--pb-primary);
  }
  th.sortable:hover {
    color: var(--pb-text-heading);
  }
  th.sortable:hover .sort-icon {
    opacity: 0.75;
  }
  .sort-icon {
    margin-left: 0.3rem;
    font-size: 0.75em;
    opacity: 0.33;
    display: inline-flex;
  }
  th.sort-asc .sort-icon,
  th.sort-desc .sort-icon {
    opacity: 1;
  }
  .rows-toolbar {
    position: sticky;
    top: calc(1rem + 50px);
    z-index: 50;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.5rem 0;
    margin-bottom: 0.75rem;
  }
  .search-input-wrap {
    position: relative;
    flex: 1;
    max-width: 400px;
    background: var(--pb-bg);
    border-radius: 6px;
  }
  .rows-toolbar input[type="search"] {
    width: 100%;
    font-size: 0.9rem;
    padding: 0.45rem 5rem 0.45rem 0.75rem;
  }
  .search-kbd-hint {
    position: absolute;
    right: 0.5rem;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    align-items: center;
    gap: 0.25rem;
    color: var(--pb-text-muted);
    font-size: 0.75rem;
    pointer-events: none;
  }
  .col-selector-count {
    color: var(--pb-accent);
  }
  mark {
    background: var(--pb-badge-fk-bg);
    color: var(--pb-badge-fk-fg);
    border-radius: 2px;
  }
`;

export function tableListView(tables: string[], basePath: string) {
  const base = basePath.replace(/\/$/, "");
  if (tables.length === 0) {
    return html`<div id="tables-view">
      <div class="empty-state">
        <div class="empty-state-icon">${iconTableOff(24)}</div>
        <h3 class="empty-state-title">No tables yet</h3>
        <p class="empty-state-body">
          Create your first table in the Schema view to start storing data.
        </p>
        <button class="primary" data-on:click="@get('${base}/schema')">
          Go to Schema
        </button>
      </div>
    </div>`;
  }
  const rows = tables.map(
    (t) =>
      html`<tr>
        <td>
          <a
            href="${basePath}/tables/${t}"
            data-on:click="@get('${basePath}/tables/${t}')"
          >
            ${t}
          </a>
        </td>
      </tr>`,
  );
  return html` <table>
    <thead>
      <tr>
        <th>Name</th>
      </tr>
    </thead>
    <tbody>
      ${raw(rows)}
    </tbody>
  </table>`;
}

export function buildTabBar(tables: string[], table: string, basePath: string) {
  if (tables.length === 0) return html``;

  const base = basePath.replace(/\/$/, "");

  const links = tables.map(
    (t) =>
      html`<a
        href="${base}/tables/${t}"
        data-on:click__prevent="history.pushState(null,'','${base}/tables/${t}');@get('${base}/tables/${t}')"
        ${raw(t === table ? ' class="active"' : "")}
      >
        ${t}
      </a>`,
  );
  return html`<div class="table-tabs-bar">
    <div class="button-group">
      <a
        href="${base}/schema"
        data-on:click="@get('${base}/schema')"
        data-tooltip="Back to schemas"
        aria-label="Schema"
      >
        ${iconArrowLeft(14)}
      </a>
    </div>
    <div class="table-tabs-wrap">
      <nav class="table-tabs">${links}</nav>
    </div>
    <script>
      ${raw(tableTabsScript)};
    </script>
  </div>`;
}

export function buildRowsContainer(opts: {
  table: string;
  columns: Column[];
  rows: Record<string, unknown>[];
  page: number;
  total: number;
  limit: number;
  basePath: string;
  sort?: { col: string; dir: "asc" | "desc" };
  search?: string;
  hiddenColumns?: string[];
}) {
  const {
    table,
    columns,
    rows,
    page,
    total,
    limit,
    basePath,
    sort,
    search,
    hiddenColumns = [],
  } = opts;
  const totalPages = Math.ceil(total / limit);
  const pkCol = columns.find((c) => c.pk);

  const highlightMatch = (text: string) => {
    if (!search) return text;

    const re = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");

    return raw(text.replace(re, (m) => `<mark>${m}</mark>`));
  };

  const nextSortQuery = (colName: string): string => {
    if (!sort || sort.col !== colName)
      return `&sort=${encodeURIComponent(colName)}&dir=asc`;
    if (sort.dir === "asc")
      return `&sort=${encodeURIComponent(colName)}&dir=desc`;
    return "";
  };

  const thClass = (colName: string): string => {
    if (sort?.col === colName) return `sortable sort-${sort.dir}`;
    return "sortable";
  };

  const sortIcon = (colName: string) => {
    if (sort?.col === colName) {
      return html`<span class="sort-icon">
        ${sort.dir === "asc" ? iconArrowUp(12) : iconArrowDown(12)}
      </span>`;
    }

    return html`<span class="sort-icon">${iconArrowsUpDown(12)}</span>`;
  };

  const typeIcon = (type: string) => {
    const t = type.toUpperCase();
    if (
      t.includes("INT") ||
      t.includes("NUMERIC") ||
      t.includes("REAL") ||
      t.includes("FLOAT") ||
      t.includes("DOUBLE") ||
      t === "NUMBER"
    )
      return iconHash(12);
    if (t.includes("BOOL")) return iconToggleLeft(12);
    if (t.includes("DATE") || t.includes("TIME")) return iconCalendar(12);
    if (t.includes("JSON")) return iconBraces(12);
    if (t.includes("BLOB")) return iconFile(12);
    return iconLetterT(12);
  };

  const headers = columns
    .filter((c) => !hiddenColumns.includes(c.name))
    .map(
      (c) =>
        html`<th
          class="${thClass(c.name)}"
          data-on:click="@get('${basePath}/tables/${table}?page=1${nextSortQuery(
            c.name,
          )}')"
        >
          ${typeIcon(c.type)}${c.name}${c.pk
            ? html`<span class="badge pk">PK</span>`
            : ""}${sortIcon(c.name)}
        </th>`,
    );

  const dataRows = rows.map((row) => {
    const rowid = pkCol ? row[pkCol.name] : null;
    const cells = columns
      .filter((c) => !hiddenColumns.includes(c.name))
      .map((c) => html`<td>${highlightMatch(String(row[c.name] ?? ""))}</td>`);

    return html`<tr id="row-${rowid}">
      ${cells}
      <td>
        <button
          class="danger"
          data-on:click="@delete('${basePath}/tables/${table}/${rowid}')"
        >
          Delete
        </button>
      </td>
    </tr>`;
  });

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

  const sortQuery = sort
    ? `&sort=${encodeURIComponent(sort.col)}&dir=${sort.dir}`
    : "";

  const pageUrl = (p: number) =>
    `@get('${basePath}/tables/${table}?page=${p}${sortQuery}')`;

  const pageButtons = pageItems.map((item) =>
    item === "..."
      ? html`<span class="pagination-dots">···</span>`
      : item === page
        ? html`<button class="pagination-btn active">${item}</button>`
        : html`<button class="pagination-btn" data-on:click="${pageUrl(item)}">
            ${item}
          </button>`,
  );

  const pagination =
    totalPages > 1
      ? html`<nav class="pagination">
          ${page > 1
            ? html`<button
                class="pagination-btn"
                data-on:click="${pageUrl(page - 1)}"
              >
                &#8249; Previous
              </button>`
            : html`<button class="pagination-btn" disabled>
                &#8249; Previous
              </button>`}
          <span class="pagination-buttons">${pageButtons}</span>
          ${page < totalPages
            ? html`<button
                class="pagination-btn"
                data-on:click="${pageUrl(page + 1)}"
              >
                Next &#8250;
              </button>`
            : html`<button class="pagination-btn" disabled>
                Next &#8250;
              </button>`}
        </nav>`
      : html`<p class="row-count">${total} row${total !== 1 ? "s" : ""}</p>`;

  const insertCols = columns.filter((c) => !c.pk);
  const resetSignals = insertCols.map((c) => `$${c.name}=''`).join(";");
  const insertCells = columns
    .filter((c) => !hiddenColumns.includes(c.name))
    .map((c) => {
      if (c.pk) return html`<td class="text-faint pk-cell">—</td>`;

      const hasDefault = c.dflt_value != null;
      const placeholder = hasDefault
        ? `default: ${c.dflt_value}`
        : c.type || "text";
      const required = c.notnull && !hasDefault ? " required" : "";

      return html`<td>
        <input data-bind:${c.name} placeholder="${placeholder}" ${required} />
      </td>`;
    });

  const insertRow =
    insertCols.length > 0
      ? html`<tr>
          ${insertCells}
          <td>
            <button
              class="primary"
              data-on:click="@post('${basePath}/tables/${table}')${resetSignals
                ? `;${resetSignals}`
                : ""}"
            >
              Add
            </button>
          </td>
        </tr>`
      : "";

  const baseSearchUrl = `${basePath}/tables/${table}?page=1${sortQuery}`;
  const searchQuery = search ? `&search=${encodeURIComponent(search)}` : "";
  const toggleBase = `${basePath}/tables/${table}/toggle-column`;
  const toggleQuerySuffix = `?page=${page}${sortQuery}${searchQuery}`;

  const colSelectorItems = columns.map((col) => {
    const isVisible = !hiddenColumns.includes(col.name);
    const encodedCol = encodeURIComponent(col.name);
    return html`<label class="dropdown-item">
      <input
        type="checkbox"
        ${isVisible ? " checked" : ""}
        data-on:click="@post('${toggleBase}/${encodedCol}${toggleQuerySuffix}')"
      />
      ${html`${col.name}`}</label
    >`;
  });

  const hiddenCount = hiddenColumns.length;
  const colSelectorLabel =
    hiddenCount > 0
      ? html`Columns
          <span class="col-selector-count">
            ${columns.length - hiddenCount}/${columns.length}
          </span>`
      : `Columns`;

  const id = "id" + Math.random();

  const colSelector = html`<details
    class="dropdown"
    data-ref="${id}"
    data-on:click__outside="$${id}.open=false"
  >
    <summary>${colSelectorLabel}</summary>
    <div class="dropdown-panel">${colSelectorItems}</div>
  </details>`;

  const searchInput = html`<div
    class="rows-toolbar"
    data-on:keydown__window="if(evt.metaKey&&evt.key==='f'){evt.preventDefault();document.getElementById('search-input').focus()}"
  >
    <div class="search-input-wrap">
      <input
        id="search-input"
        type="search"
        data-bind:search
        placeholder="Search all columns…"
        data-on:input__debounce_300ms="history.replaceState(null,'','${baseSearchUrl}' + ($search ? '&search=' + encodeURIComponent($search) : '')); @get('${baseSearchUrl}&search=' + encodeURIComponent($search))"
      />
      <span class="search-kbd-hint"><kbd>⌘</kbd><kbd>F</kbd> </span>
    </div>
    ${colSelector}
  </div>`;

  return html`<div id="rows-container" class="rows-container">
    ${searchInput}
    <div class="rows-card">
      <div class="rows-table-wrap">
        <table>
          <thead>
            <tr>
              ${headers}
              <th></th>
            </tr>
          </thead>
          <tbody id="rows-${table}">
            ${insertRow}${dataRows}
          </tbody>
        </table>
      </div>
      ${pagination}
    </div>
  </div>`;
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
  sort?: { col: string; dir: "asc" | "desc" };
  search?: string;
  hiddenColumns?: string[];
}) {
  const {
    table,
    tables,
    columns,
    rows,
    page,
    total,
    limit,
    basePath,
    sort,
    search,
    hiddenColumns,
  } = opts;
  const insertCols = columns.filter((c) => !c.pk);
  const colSignals = insertCols.map((c) => `${c.name}:''`).join(",");
  // Escape the search value for embedding in a single-quoted JS string inside a double-quoted HTML attribute
  const searchVal = (search ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/"/g, "&quot;")
    .replace(/\n/g, "\\n");
  const signalsAttr = colSignals
    ? `{search:'${searchVal}',${colSignals}}`
    : `{search:'${searchVal}'}`;

  return html`<div
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
        sort,
        search,
        hiddenColumns,
      }),
    )}
  </div>`;
}
