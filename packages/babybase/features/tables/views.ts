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
} from "../../components/icons.ts";
import { tableTabsScript } from "../../components/scripts.ts";
import type { Column } from "./queries.ts";

const css = String.raw;

const rowsStyles = css`
  .table-tabs-bar {
    display: inline-grid;
    gap: 0.5rem;
    grid-template-columns: auto 1fr;
    position: sticky;
    top: 3rem;
    margin-inline: auto;
    padding-inline: 1rem;
    margin-top: 3rem;
  }

  .table-tabs {
    width: 100%;
    overflow: auto;
    background: var(--background-color);
  }

  .rows-wrapper {
    display: contents;
  }
  .rows-container {
    padding: 12px 1.5rem 6rem;
    max-width: 1200px;
    margin-inline: auto;
    width: 100%;
  }
  .rows-card {
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
  }
  th.sortable:hover {
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
    top: calc(4rem + 30px);
    z-index: 50;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.5rem 0;
    margin-bottom: 0.75rem;

    label {
      background-color: var(--background-color);
    }
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
      <div class="empty">
        ${iconTableOff(24)}
        <h3>No tables yet</h3>
        <p>
          Create your first table in the Schema view to start storing data.
        </p>
        <button data-on:click="@get('${base}/schema')">
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
        class="button ghost"
        href="${base}/tables/${t}"
        data-on:click__prevent="history.pushState(null,'','${base}/tables/${t}');@get('${base}/tables/${t}')"
        ${raw(t === table ? ' class="active"' : "")}
      >
        ${t}
      </a>`,
  );
  return html`<div class="table-tabs-bar">
    <a
      class="button square ghost"
      href="${base}/schema"
      data-on:click="@get('${base}/schema')"
      data-tooltip="Back to schemas"
      data-placement="bottom"
      aria-label="Schema"
    >
      ${iconArrowLeft(16)}
    </a>

    <nav class="table-tabs">
      <fieldset role="group">${links}</fieldset>
    </nav>

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
          class="ghost destructive"
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
        ? html`<button class="pagination-btn">${item}</button>`
        : html`<button
            class="pagination-btn ghost"
            data-on:click="${pageUrl(item)}"
          >
            ${item}
          </button>`,
  );

  const pagination =
    totalPages > 1
      ? html`<nav class="pagination">
          ${page > 1
            ? html`<button
                class="pagination-btn ghost"
                data-on:click="${pageUrl(page - 1)}"
              >
                &#8249; Previous
              </button>`
            : html`<button class="pagination-btn ghost" disabled>
                &#8249; Previous
              </button>`}
          <span class="pagination-buttons">${pageButtons}</span>
          ${page < totalPages
            ? html`<button
                class="pagination-btn ghost"
                data-on:click="${pageUrl(page + 1)}"
              >
                Next &#8250;
              </button>`
            : html`<button class="pagination-btn ghost" disabled>
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
        <input
          data-bind:${c.name}
          placeholder="${placeholder}"
          ${required}
          type="text"
        />
      </td>`;
    });

  const insertRow =
    insertCols.length > 0
      ? html`<tr>
          ${insertCells}
          <td>
            <button
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

    return html` <li>
      <label>
        <input
          type="checkbox"
          value="size"
          ${isVisible ? " checked" : ""}
          data-on:click="@post('${toggleBase}/${encodedCol}${toggleQuerySuffix}')"
        />
        ${col.name}
      </label>
    </li>`;
  });

  const hiddenCount = hiddenColumns.length;
  const colSelectorLabel =
    hiddenCount > 0
      ? html`Columns
          <span class="col-selector-count">
            ${columns.length - hiddenCount}/${columns.length}
          </span>`
      : `Columns`;

  // const colSelector = html`<details
  //   class="dropdown"
  //   data-ref="${id}"
  //   data-on:click__outside="$${id}.open=false"
  // >
  //   <summary>${colSelectorLabel}</summary>
  //   <div class="dropdown-panel">${colSelectorItems}</div>
  // </details>`;

  const colSelector = html`<button popovertarget="column_selector">
      ${colSelectorLabel}
    </button>

    <div id="column_selector" popover>
      <menu>
        ${colSelectorItems}
        <!-- <li><button class="ghost">Edit</button></li>
        <li><button class="ghost">Duplicate</button></li>
        <li><button class="ghost">Share</button></li>
        <li><button class="ghost">Archive</button></li> -->
      </menu>
    </div>`;

  const searchInput = html`<div
    class="rows-toolbar"
    data-on:keydown__window="if(evt.metaKey&&evt.key==='f'){evt.preventDefault();document.getElementById('search-input').focus()}"
  >
    <label>
      <svg
        data-prefix
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M3 10a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" />
        <path d="M21 21l-6 -6" />
      </svg>

      <input
        id="search-input"
        type="search"
        data-bind:search
        placeholder="Search all columns…"
        data-on:input__debounce_300ms="history.replaceState(null,'','${baseSearchUrl}' + ($search ? '&search=' + encodeURIComponent($search) : '')); @get('${baseSearchUrl}&search=' + encodeURIComponent($search))"
        type="search"
      />
      <kbd data-suffix>⌘K</kbd>
    </label>
    <!-- <div class="search-input-wrap">
      <input
        
      />
      <span class="search-kbd-hint"><kbd>⌘</kbd><kbd>F</kbd> </span>
    </div> -->
    ${colSelector}
  </div>`;

  return html`<div id="rows-container" class="rows-container">
    ${searchInput}
    <div class="rows-card">
      <div class="rows-table-wrap">
        <table style="--cols: repeat(${headers.length + 1}, 1fr)">
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
