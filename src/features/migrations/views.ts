import { html, raw } from 'hono/html'
import type { MigrationFile } from './queries.ts'

export function migrationsView(opts: {
  files: MigrationFile[]
  applied: string[]
  basePath: string
}): string {
  const { files, applied, basePath } = opts
  const base = basePath.replace(/\/$/, '')
  const appliedSet = new Set(applied)

  const rows = files.length === 0
    ? '<tr><td colspan="3" style="color:#6b7280">No migration files found.</td></tr>'
    : files.map((f) => {
        const isApplied = appliedSet.has(f.name)
        const statusBadge = isApplied
          ? '<span class="badge" style="background:#d1fae5;color:#065f46">Applied</span>'
          : '<span class="badge" style="background:#fef3c7;color:#92400e">Pending</span>'
        const runBtn = !isApplied
          ? `<button class="primary" data-on:click="@post('${base}/migrations/${encodeURIComponent(f.name)}/run')">Run</button>`
          : ''
        return `<tr><td style="font-family:monospace;font-size:0.8rem">${f.name}</td><td>${statusBadge}</td><td>${runBtn}</td></tr>`
      }).join('\n')

  const hasPending = files.some((f) => !appliedSet.has(f.name))

  return String(html`<div style="display:flex;align-items:center;gap:1rem;margin-bottom:1.5rem">
  <h2>Migrations</h2>
  ${raw(hasPending ? `<button class="primary" data-on:click="@post('${base}/migrations/run-all')">Run all pending</button>` : '')}
  <button data-on:click="_showEditor=!_showEditor">+ New migration</button>
</div>

<table style="margin-bottom:1.5rem">
  <thead><tr><th>File</th><th>Status</th><th></th></tr></thead>
  <tbody id="migrations-list">${raw(rows)}</tbody>
</table>

<div data-signals="{_showEditor:false,sql:'',filename:''}" data-show="_showEditor"
     style="background:white;border:1px solid #e5e7eb;border-radius:8px;padding:1.5rem">
  <h3 style="margin-bottom:1rem">New migration</h3>
  <label style="display:block;margin-bottom:0.75rem">
    <span style="font-size:0.8rem;font-weight:600">Filename (e.g. 002_add_posts.sql)</span>
    <input data-bind:value="filename" placeholder="002_description.sql">
  </label>
  <label style="display:block;margin-bottom:0.75rem">
    <span style="font-size:0.8rem;font-weight:600">SQL</span>
    <textarea data-bind:value="sql" rows="8" style="font-family:monospace;font-size:0.85rem"
              placeholder="CREATE TABLE ..."></textarea>
  </label>
  <div style="display:flex;gap:0.5rem">
    <button class="primary" data-on:click="@post('${base}/migrations'); _showEditor=false">Save</button>
    <button class="primary" data-on:click="@post('${base}/migrations/save-and-run'); _showEditor=false">Save &amp; Run</button>
    <button data-on:click="_showEditor=false">Cancel</button>
  </div>
</div>`)
}
