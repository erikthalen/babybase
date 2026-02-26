import { html, raw } from "hono/html";
import type { Column } from "./queries.ts";

export function tableListView(tables: string[], basePath: string): string {
  if (tables.length === 0) {
    return String(html` <p>No tables found in this database.</p>`);
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
        .map((c) => {
          const val = String(row[c.name] ?? "");
          return `<td>${val}</td>`;
        })
        .join("");
      return `<tr id="row-${rowid}">${cells}<td>
  <button class="danger" data-on:click="@delete('${basePath}/tables/${table}/${rowid}')">Delete</button>
</td></tr>`;
    })
    .join("\n");

  // Build page number list with ellipsis gaps
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
          <span class="pagination-buttons">
          ${pageButtons}
          </span>
          ${page < totalPages ? `<button class="pagination-btn" data-on:click="${pageUrl(page + 1)}">Next &#8250;</button>` : `<button class="pagination-btn" disabled>Next &#8250;</button>`}
        </nav>`
      : `<p class="text-muted" style="margin:0.5rem;font-size:0.8rem">${total} row${total !== 1 ? "s" : ""}</p>`;

  // Insert row — one input per non-PK column, pinned to bottom of table
  const insertCols = columns.filter((c) => !c.pk);
  const colSignals = insertCols.map((c) => `${c.name}:''`).join(",");
  const signalsAttr = colSignals ? `{${colSignals}}` : `{}`;
  const resetSignals = insertCols.map((c) => `$${c.name}=''`).join(";");

  const insertCells = columns
    .map((c) => {
      if (c.pk) return `<td class="text-faint" style="font-size:0.8rem">—</td>`;
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
      ? `<tr>${insertCells}<td><button class="primary" data-on:click="@post('${basePath}/tables/${table}')${resetSignals ? ";" + resetSignals : ""}">Add</button></td></tr>`
      : "";

  const tabBar =
    tables.length > 0
      ? `<nav id="table-tabs" class="tab-bar">${tables.map((t) => `<a href="${basePath}/tables/${t}" data-on:click="@get('${basePath}/tables/${t}')"${t === table ? ' class="active"' : ""}>${t}</a>`).join("")}</nav>`
      : "";

  return String(
    html`<div style="display:contents;" data-signals="${raw(signalsAttr)}">
      ${raw(tabBar)}
      <table>
        <thead>
          <tr>
            ${raw(headers)}
            <th></th>
          </tr>
        </thead>
        <tbody id="rows-${table}">
          ${raw(insertRow)} ${raw(dataRows)}
        </tbody>
      </table>
      ${raw(pagination)}
    </div>`,
  );
}
