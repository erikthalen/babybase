import { html, raw } from 'hono/html'
import type { BackupEntry } from './queries.ts'

function formatBytes(b: number): string {
  if (b < 1024) return `${b} B`
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`
  return `${(b / 1024 / 1024).toFixed(2)} MB`
}

export function backupsView(opts: { backups: BackupEntry[]; basePath: string }): string {
  const { backups, basePath } = opts
  const base = basePath.replace(/\/$/, '')

  const rows = backups.length === 0
    ? '<tr><td colspan="4" style="color:#6b7280">No backups yet.</td></tr>'
    : backups.map((b) => {
        const label = b.createdAt.toLocaleString()
        return `<tr>
  <td style="font-family:monospace;font-size:0.8rem">${b.name}</td>
  <td>${label}</td>
  <td>${formatBytes(b.size)}</td>
  <td><button class="danger" data-on:click="@post('${base}/backups/${encodeURIComponent(b.name)}/restore')">Restore</button></td>
</tr>`
      }).join('\n')

  return String(html`<div style="display:flex;align-items:center;gap:1rem;margin-bottom:1.5rem">
  <h2>Backups</h2>
  <button class="primary" data-on:click="@post('${base}/backups')">Create backup</button>
</div>
<div id="backup-status"></div>
<table>
  <thead><tr><th>File</th><th>Created</th><th>Size</th><th></th></tr></thead>
  <tbody id="backups-list">${raw(rows)}</tbody>
</table>`)
}
