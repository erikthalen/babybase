import { html, raw } from 'hono/html'
import type { Column } from './queries.ts'

export function tableListView(tables: string[], basePath: string): string {
  if (tables.length === 0) {
    return String(html`<h2>Tables</h2><p>No tables found in this database.</p>`)
  }
  const rows = tables
    .map((t) => `<tr><td><a href="${basePath}/tables/${t}" data-on:click="@get('${basePath}/tables/${t}')">${t}</a></td></tr>`)
    .join('\n')
  return String(html`<h2>Tables</h2>
<table><thead><tr><th>Name</th></tr></thead><tbody>${raw(rows)}</tbody></table>`)
}

export function rowsView(opts: {
  table: string
  columns: Column[]
  rows: Record<string, unknown>[]
  page: number
  total: number
  limit: number
  basePath: string
}): string {
  const { table, columns, rows, page, total, limit, basePath } = opts
  const totalPages = Math.ceil(total / limit)
  const pkCol = columns.find((c) => c.pk)

  const headers = columns.map((c) =>
    `<th>${c.name}${c.pk ? ' <span class="badge pk">PK</span>' : ''}</th>`
  ).join('')

  const dataRows = rows.map((row) => {
    const rowid = pkCol ? row[pkCol.name] : null
    const cells = columns.map((c) => {
      const val = String(row[c.name] ?? '')
      return `<td>${val}</td>`
    }).join('')
    return `<tr id="row-${rowid}">${cells}<td>
  <button class="danger" data-on:click="@delete('${basePath}/tables/${table}/${rowid}')">Delete</button>
</td></tr>`
  }).join('\n')

  const pagination = totalPages > 1
    ? `<div style="display:flex;gap:0.5rem;margin-top:1rem;align-items:center">
  ${page > 1 ? `<button data-on:click="@get('${basePath}/tables/${table}?page=${page - 1}')">← Prev</button>` : ''}
  <span>Page ${page} of ${totalPages} (${total} rows)</span>
  ${page < totalPages ? `<button data-on:click="@get('${basePath}/tables/${table}?page=${page + 1}')">Next →</button>` : ''}
</div>`
    : `<p style="margin-top:0.5rem;color:#6b7280;font-size:0.8rem">${total} row${total !== 1 ? 's' : ''}</p>`

  // Insert form — one input per non-PK column
  const insertInputs = columns
    .filter((c) => !c.pk)
    .map((c) => `<label style="display:block;margin-bottom:0.5rem">
    <span style="font-size:0.8rem;font-weight:600">${c.name}</span>
    <input name="${c.name}" placeholder="${c.type || 'text'}">
  </label>`)
    .join('')

  return String(html`<div data-signals="{_showInsert:false}" style="display:flex;align-items:center;gap:1rem;margin-bottom:1rem">
  <h2>${table}</h2>
  <button class="primary" data-on:click="_showInsert=!_showInsert">+ Add row</button>
</div>
<div data-show="_showInsert" style="margin-bottom:1rem;padding:1rem;background:white;border-radius:8px;border:1px solid #e5e7eb">
  <form data-on:submit="@post('${basePath}/tables/${table}'); _showInsert=false">
    ${raw(insertInputs)}
    <button type="submit" class="primary">Insert</button>
  </form>
</div>
<table>
  <thead><tr>${raw(headers)}<th></th></tr></thead>
  <tbody id="rows-${table}">${raw(dataRows)}</tbody>
</table>
${raw(pagination)}`)
}
