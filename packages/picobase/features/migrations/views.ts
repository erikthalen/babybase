import { html, raw } from "hono/html";
import type { MigrationFile } from "./queries.ts";

export function migrationsView(opts: {
  files: MigrationFile[];
  applied: string[];
  basePath: string;
}): string {
  const { files, applied, basePath } = opts;
  const base = basePath.replace(/\/$/, "");
  const appliedSet = new Set(applied);

  const rows =
    files.length === 0
      ? '<tr><td colspan="3" class="text-muted">No migration files found.</td></tr>'
      : files
          .map((f) => {
            const isApplied = appliedSet.has(f.name);
            const statusBadge = isApplied
              ? '<span class="badge fk">Applied</span>'
              : '<span class="badge pk">Pending</span>';
            const runBtn = !isApplied
              ? `<button class="primary" data-on:click="@post('${base}/migrations/${encodeURIComponent(f.name)}/run')">Run</button>`
              : "";
            return `<tr><td style="font-family:monospace;font-size:0.8rem">${f.name}</td><td>${statusBadge}</td><td>${runBtn}</td></tr>`;
          })
          .join("\n");

  const hasPending = files.some((f) => !appliedSet.has(f.name));

  return String(html`
    <table style="margin-bottom:1.5rem">
      <thead>
        <tr>
          <th>File</th>
          <th>Status</th>
          <th></th>
        </tr>
      </thead>
      <tbody id="migrations-list">
        ${raw(rows)}
      </tbody>
    </table>

    <div style="margin: 1rem;" data-signals="{_showEditor:false}">
      ${raw(
        hasPending
          ? `<button class="primary" data-on:click="@post('${base}/migrations/run-all')">Run all pending</button>`
          : "",
      )}

      <dialog
        id="migration_editor"
        closedby="any"
        style="background:var(--pb-surface);border:1px solid var(--pb-border);border-radius:8px;padding:1.5rem;margin-bottom:1.5rem;left:50%;top: 50%;transform:translate(-50%,-50%);width:90%;max-width:500px;color:inherit"
      >
        <div data-signals="{sql:'',filename:''}">
          <h3 style="margin-bottom:1rem">New migration</h3>
          <label style="display:block;margin-bottom:0.75rem">
            <span style="font-size:0.8rem;font-weight:600">
              Filename (e.g. 002_add_posts.sql)
            </span>
            <input data-bind:filename placeholder="002_description.sql" />
          </label>
          <label style="display:block;margin-bottom:0.75rem">
            <span style="font-size:0.8rem;font-weight:600">SQL</span>
            <textarea
              data-bind:sql
              rows="8"
              style="font-family:monospace;font-size:0.85rem"
              placeholder="CREATE TABLE ..."
            ></textarea>
          </label>
          <div style="display:flex;gap:0.5rem">
            <button
              class="primary"
              data-on:click="@post('${base}/migrations'); $_showEditor=false"
            >
              Save
            </button>
            <button
              class="primary"
              data-on:click="@post('${base}/migrations/save-and-run'); $_showEditor=false"
            >
              Save &amp; Run
            </button>
            <form method="dialog">
              <button type="submit">Cancel</button>
            </form>
          </div>
        </div>
      </dialog>

      <button
        style="margin-inline:1rem"
        data-on:click="document.getElementById('migration_editor').showModal()"
      >
        + New migration
      </button>
    </div>
  `);
}
