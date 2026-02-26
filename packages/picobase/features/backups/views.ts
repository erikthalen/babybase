import { html, raw } from "hono/html";
import type { BackupEntry } from "./queries.ts";

function formatBytes(b: number): string {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 / 1024).toFixed(2)} MB`;
}

export function backupsView(opts: {
  backups: BackupEntry[];
  basePath: string;
}): string {
  const { backups, basePath } = opts;
  const base = basePath.replace(/\/$/, "");

  const rows =
    backups.length === 0
      ? '<tr><td colspan="4" class="text-muted">No backups yet.</td></tr>'
      : backups
          .map((b) => {
            const label = b.createdAt.toLocaleString();
            return `<tr>
  <td style="font-family:monospace;font-size:0.8rem">${b.name}</td>
  <td>${label}</td>
  <td>${formatBytes(b.size)}</td>
  <td><button class="danger" data-on:click="$_restoreTarget='${b.name}'">Restore</button></td>
</tr>`;
          })
          .join("\n");

  return String(
    html`<div data-signals="{_restoreTarget:''}">
      <div id="backup-status"></div>
      <table style="margin-bottom:1.5rem">
        <thead>
          <tr>
            <th>File</th>
            <th>Created</th>
            <th>Size</th>
            <th></th>
          </tr>
        </thead>
        <tbody id="backups-list">
          ${raw(rows)}
        </tbody>
      </table>

      <button
        class="primary"
        style="margin-inline: 1rem"
        data-on:click="@post('${base}/backups')"
      >
        Create backup
      </button>

      <div
        data-show="$_restoreTarget !== ''"
        style="position:fixed;inset:0;z-index:100"
      >
        <div
          style="width:100%;height:100%;background:rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center"
        >
          <div
            style="background:var(--pb-surface);border-radius:8px;padding:1.5rem;width:100%;max-width:380px;box-shadow:var(--pb-shadow-sm)"
          >
            <h3 style="font-size:1rem;font-weight:600;margin-bottom:0.5rem">
              Restore database
            </h3>
            <p
              style="font-size:0.875rem;margin-bottom:1.25rem;color:var(--pb-text-muted)"
            >
              Restore from
              <span
                style="font-family:monospace;color:inherit"
                data-text="$_restoreTarget"
              ></span
              >?
            </p>
            <div style="display:flex;gap:0.5rem">
              <button
                class="primary"
                data-on:click="@post('${base}/backups/' + $_restoreTarget + '/restore?backup=true'); $_restoreTarget=''"
              >
                Backup &amp; Restore
              </button>
              <button
                data-on:click="@post('${base}/backups/' + $_restoreTarget + '/restore?backup=false'); $_restoreTarget=''"
              >
                Restore
              </button>
              <button data-on:click="$_restoreTarget=''">Cancel</button>
            </div>
          </div>
        </div>
      </div>
    </div>`,
  );
}
