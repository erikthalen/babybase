import { html, raw } from "hono/html";
import { iconFileCode, iconPlus } from "../../components/icons.ts";
import type { MigrationFile } from "./queries.ts";

const css = String.raw;

const styles = css`
  .migrations-container {
    padding: 4.5rem 1.5rem 6rem;
    max-width: 880px;
    margin-inline: auto;
  }

  .migrations-controls {
    position: fixed;
    top: 1rem;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .migration-filename {
    font-family: monospace;
    font-size: 0.8rem;
  }

  #migration-sql-dialog {
    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
  }

  .migration-sql-dialog-title {
    font-family: monospace;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .migration-sql-pre {
    margin: 0;
    font-family: var(--pb-monospace);
    font-size: 0.8rem;
    line-height: 1.6;
    overflow-x: auto;
    white-space: pre;
    color: #fafafa;
    background: var(--pb-syntax-bg);
    border-radius: 8px;
    padding: 1rem 1.25rem;
  }

  .migration-sql {
    font-family: var(--pb-monospace);
    font-size: 0.8rem;
    width: 100%;
    resize: vertical;
  }

  .migrations-empty {
    padding: 5rem 2rem 25vh;
    height: 100vh;
  }
`;

function getNextMigrationNumber(files: MigrationFile[]): string {
  const nums = files
    .map((f) => parseInt(f.name.match(/^(\d+)/)?.[1] ?? "0", 10))
    .filter((n) => n > 0);
  const next = nums.length > 0 ? Math.max(...nums) + 1 : 1;
  return next.toString().padStart(3, "0");
}

export function migrationsView(opts: {
  files: MigrationFile[];
  applied: string[];
  basePath: string;
}) {
  const { files, applied, basePath } = opts;
  const base = basePath.replace(/\/$/, "");
  const appliedSet = new Set(applied);
  const nextNum = getNextMigrationNumber(files);

  const hasPending = files.some((f) => !appliedSet.has(f.name));

  const deleteDialog = html`
    <dialog id="mig-delete-confirm-dialog" closedby="any">
      <article>
        <header>
          <h3>Delete migration</h3>
          <p>
            <small>
              This action cannot be undone. Type the filename to confirm:
            </small>
          </p>
        </header>

        <div style="display:grid;gap:1rem;">
          <code style="font-size:1rem;" data-text="$_migDeleteTarget"></code>

          <label class="field">
            <span>Filename</span>

            <input
              data-bind:_mig-delete-confirm
              data-attr:placeholder="$_migDeleteTarget"
              autocomplete="off"
              spellcheck="false"
              type="text"
            />
          </label>
        </div>

        <footer style="display:flex; gap: 0.5rem;justify-content:flex-end;">
          <form method="dialog">
            <button
              class="ghost"
              type="submit"
              data-on:click="$_migDeleteConfirm=''"
            >
              Cancel
            </button>
          </form>
          <button
            class="destructive"
            data-attr:disabled="$_migDeleteConfirm !== $_migDeleteTarget"
            data-on:click="@delete('${base}/migrations/' + $_migDeleteTarget); $_migDeleteTarget=''; $_migDeleteConfirm=''; document.getElementById('mig-delete-confirm-dialog').close()"
          >
            Delete
          </button>
        </footer>
      </article>
    </dialog>
  `;

  const dialog = html`
    <dialog id="migration-editor" closedby="any">
      <article data-signals="{sql:'', filename:'', _description:''}">
        <header>
          <h3>New migration</h3>
        </header>

        <div style="display:grid;gap:1rem;">
          <label class="field">
            <span>Description</span>

            <input
              data-bind:_description
              data-on:input="const s = evt.target.value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, ''); $filename = s ? '${nextNum}_' + s + '.sql' : ''"
              placeholder="e.g. add users table"
              autocomplete="off"
              spellcheck="false"
              type="text"
            />

            <small>
              <span>Filename</span>
              <code
                data-text="$filename || '${nextNum}_description.sql'"
              ></code>
            </small>
          </label>

          <label class="field">
            <span>SQL</span>

            <textarea
              data-bind:sql
              rows="8"
              class="migration-sql"
              placeholder="CREATE TABLE ..."
            ></textarea>
          </label>
        </div>

        <footer style="display:flex;justify-content:flex-end;gap:1rem;">
          <form method="dialog">
            <button class="ghost" type="submit">Cancel</button>
          </form>

          <button
            class="outline"
            data-attr:disabled="!$filename"
            data-on:click="document.getElementById('migration-editor').close(); @post('${base}/migrations')"
          >
            Save
          </button>
          <button
            data-attr:disabled="!$filename"
            data-on:click="document.getElementById('migration-editor').close(); @post('${base}/migrations/save-and-run')"
          >
            Save &amp; Run
          </button>
        </footer>
      </article>
    </dialog>
  `;

  const sqlDialog = html`
    <dialog id="migration-sql-dialog" closedby="any">
      <article>
        <header>
          <h3
            class="migration-sql-dialog-title"
            id="migration-sql-dialog-title"
          ></h3>
          <form method="dialog">
            <button type="submit" class="ghost">Close</button>
          </form>
        </header>
        <div id="migration-sql-content"></div>
      </article>
    </dialog>
  `;

  if (files.length === 0) {
    return html`
      <div
        id="migrations-view"
        data-signals="{_migDeleteTarget:'', _migDeleteConfirm:''}"
      >
        <style>
          ${styles}
        </style>
        ${dialog} ${sqlDialog} ${deleteDialog}
        <div class="empty migrations-empty">
          ${iconFileCode(24)}
          <h3>No migrations yet</h3>
          <p>
            Create SQL migration files to track and apply schema changes to your
            database.
          </p>
          <button
            data-on:click="$_description=''; $filename=''; $sql=''; document.getElementById('migration-editor').showModal()"
          >
            ${iconPlus(12)} New migration
          </button>
        </div>
      </div>
    `;
  }

  const rows = files
    .map((f) => {
      const isApplied = appliedSet.has(f.name);
      const statusBadge = isApplied
        ? html`<span class="badge fk">Applied</span>`
        : html`<span class="badge pk">Pending</span>`;
      const runBtn = !isApplied
        ? html`<button
            class="ghost"
            data-on:click="@post('${base}/migrations/${encodeURIComponent(
              f.name,
            )}/run')"
          >
            Run
          </button>`
        : "";
      const viewBtn = html`<button
        class="ghost"
        data-on:click="document.getElementById('migration-sql-dialog-title').textContent='${f.name.replace(
          /'/g,
          "\\'",
        )}'; document.getElementById('migration-sql-dialog').showModal(); @get('${base}/migrations/${encodeURIComponent(
          f.name,
        )}')"
      >
        View
      </button>`;
      const deleteBtn = html`<button
        class="ghost destructive"
        data-on:click="$_migDeleteTarget='${f.name}'; $_migDeleteConfirm=''; document.getElementById('mig-delete-confirm-dialog').showModal()"
      >
        Delete
      </button>`;
      return html`<tr>
        <td class="migration-filename">${f.name}</td>
        <td>${statusBadge}</td>
        <td style="justify-content:flex-end">
          <fieldset role="group">${runBtn} ${viewBtn} ${deleteBtn}</fieldset>
        </td>
      </tr>`;
    })
    .join("\n");

  return html`
    <div
      id="migrations-view"
      data-signals="{_migDeleteTarget:'', _migDeleteConfirm:''}"
    >
      <style>
        ${styles}
      </style>
      ${dialog} ${sqlDialog} ${deleteDialog}
      <div class="migrations-controls">
        ${hasPending
          ? html`<fieldset
              role="group"
                         >
              <button
                class="primary"
                data-on:click="@post('${base}/migrations/run-all')"
              >
                Run all pending
              </button>
            </fieldset>`
          : ""}
        <fieldset role="group">
          <button
            class="ghost"
            data-on:click="$_description=''; $filename=''; $sql=''; document.getElementById('migration-editor').showModal()"
          >
            New migration
          </button>
        </fieldset>
      </div>
      <div class="migrations-container">
        <table>
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
      </div>
    </div>
  `;
}
