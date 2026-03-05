import { html, raw } from "hono/html";
import type { MigrationFile } from "./queries.ts";

const css = String.raw;

const styles = css`
  #migrations-view {
  }
  .migrations-container {
    padding: 4.5rem 1.5rem 6rem;
    max-width: 880px;
    margin-inline: auto;
  }
  .migrations-card {
    background: var(--pb-surface);
    border: 1px solid var(--pb-border);
    border-radius: 12px;
    overflow: hidden;
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
  .migrations-controls .ctrl-group {
    display: flex;
    align-items: center;
    gap: 2px;
    background: var(--pb-surface);
    border: 1px solid var(--pb-border);
    border-radius: 10px;
    padding: 3px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
  }
  .migrations-controls .ctrl-group button {
    border: none;
    border-radius: 7px;
  }
  .migrations-controls .ctrl-group button:hover {
    border-color: transparent;
  }
  .migration-filename {
    font-family: monospace;
    font-size: 0.8rem;
  }
  #migration-sql-dialog {
    background: var(--pb-surface);
    border: 1px solid var(--pb-border);
    border-radius: 8px;
    padding: 1.5rem;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 90%;
    max-width: 640px;
    color: inherit;
  }
  #migration-sql-dialog::backdrop {
    background: rgba(0, 0, 0, 0.5);
  }
  .migration-sql-dialog-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
    gap: 1rem;
  }
  .migration-sql-dialog-title {
    font-size: 0.875rem;
    font-weight: 600;
    font-family: monospace;
    margin: 0;
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
  .sql-keyword {
    color: var(--pb-syntax-keyword);
  }
  .sql-string {
    color: var(--pb-syntax-string);
  }
  .sql-comment {
    color: var(--pb-syntax-comment);
    font-style: italic;
  }
  .sql-number {
    color: var(--pb-syntax-number);
  }
  #migration-editor {
    background: var(--pb-surface);
    border: 1px solid var(--pb-border);
    border-radius: 12px;
    padding: 1.5rem;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 90%;
    max-width: 540px;
    color: inherit;
  }
  #migration-editor::backdrop {
    background: rgba(0, 0, 0, 0.5);
  }
  .migration-form-title {
    font-size: 0.9375rem;
    font-weight: 600;
    margin-bottom: 1.25rem;
  }
  .migration-label {
    display: block;
    margin-bottom: 1rem;
  }
  .migration-label-title {
    display: block;
    font-size: 0.6875rem;
    font-weight: 600;
    color: var(--pb-text-muted);
    letter-spacing: 0.05em;
    text-transform: uppercase;
    margin-bottom: 0.375rem;
  }
  .mig-description-input {
    width: 100%;
  }
  .mig-filename-preview {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    padding: 0.5rem 0.75rem;
    background: var(--pb-syntax-bg);
    border-radius: 6px;
    margin-top: -0.5rem;
    margin-bottom: 1rem;
    overflow: hidden;
  }
  .mig-filename-preview-label {
    font-size: 0.625rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    color: var(--pb-text-faint);
    flex-shrink: 0;
  }
  .mig-filename-preview-value {
    font-family: var(--pb-monospace);
    font-size: 0.8rem;
    color: var(--pb-syntax-string);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .mig-filename-preview-value.placeholder {
    color: var(--pb-text-faint);
    font-style: italic;
  }
  .migration-sql {
    font-family: var(--pb-monospace);
    font-size: 0.8rem;
    width: 100%;
    resize: vertical;
  }
  .migration-btn-row {
    display: flex;
    gap: 0.5rem;
    margin-top: 1.25rem;
  }
  .new-migration-btn {
  }
  .mig-btn-group {
    display: flex;
    align-items: center;
    gap: 3px;
    background: var(--pb-surface);
    border: 1px solid var(--pb-border);
    border-radius: 10px;
    padding: 3px;
  }
  .mig-btn-group button {
    border-color: transparent;
    border-radius: 7px;
  }
  .mig-btn-group button:hover,
  .mig-btn-group button.danger:hover {
    border-color: transparent;
  }
  .mig-btn-group button + button {
    position: relative;
  }
  .mig-btn-group button + button::before {
    content: "";
    position: absolute;
    left: -3px;
    top: 0;
    bottom: 0;
    width: 1px;
    background: var(--pb-border);
  }
  .mig-delete-confirm-dialog {
    background: var(--pb-surface);
    border: 1px solid var(--pb-border);
    border-radius: 8px;
    padding: 1.5rem;
    color: inherit;
    width: 90%;
    max-width: 420px;
    left: 50%;
    top: 50%;
    translate: -50% -50%;
  }
  .mig-delete-confirm-dialog::backdrop {
    background: rgba(0, 0, 0, 0.5);
  }
  .mig-delete-confirm-title {
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 0.75rem;
  }
  .mig-delete-confirm-body {
    font-size: 0.875rem;
    color: var(--pb-text-muted);
    line-height: 1.5;
    margin-bottom: 0.75rem;
  }
  .mig-delete-confirm-name {
    font-family: var(--pb-monospace);
    font-size: 0.8rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--pb-border);
    border-radius: 4px;
    padding: 0.25rem 0.5rem;
    display: block;
    margin-bottom: 1rem;
    word-break: break-all;
  }
  .mig-delete-confirm-label {
    display: block;
    font-size: 0.8rem;
    color: var(--pb-text-muted);
    margin-bottom: 0.35rem;
  }
  .mig-delete-confirm-dialog input {
    width: 100%;
  }
  .mig-delete-confirm-actions {
    display: flex;
    justify-content: end;
    gap: 0.5rem;
    margin-top: 1.25rem;
  }
  .migrations-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 5rem 2rem 25vh;
    text-align: center;
    gap: 0.75rem;
    height: 100vh;
  }
  .migrations-empty-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--pb-text-faint);
    margin-bottom: 0.5rem;
  }
  .migrations-empty-title {
    font-size: 1rem;
    font-weight: 600;
    margin: 0;
  }
  .migrations-empty-body {
    font-size: 0.875rem;
    color: var(--pb-text-muted);
    max-width: 300px;
    margin: 0 0 0.5rem;
    line-height: 1.5;
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
}): string {
  const { files, applied, basePath } = opts;
  const base = basePath.replace(/\/$/, "");
  const appliedSet = new Set(applied);
  const nextNum = getNextMigrationNumber(files);

  const hasPending = files.some((f) => !appliedSet.has(f.name));

  const deleteDialog = html`
    <dialog
      id="mig-delete-confirm-dialog"
      class="mig-delete-confirm-dialog"
      closedby="any"
    >
      <h3 class="mig-delete-confirm-title">Delete migration</h3>
      <p class="mig-delete-confirm-body">
        This action cannot be undone. Type the filename to confirm:
      </p>
      <code
        class="mig-delete-confirm-name"
        data-text="$_migDeleteTarget"
      ></code>
      <span class="mig-delete-confirm-label">Filename</span>
      <input
        data-bind:_mig-delete-confirm
        data-attr:placeholder="$_migDeleteTarget"
        autocomplete="off"
        spellcheck="false"
      />
      <div class="mig-delete-confirm-actions">
        <form method="dialog">
          <button type="submit" data-on:click="$_migDeleteConfirm=''">
            Cancel
          </button>
        </form>
        <button
          class="danger"
          data-attr:disabled="$_migDeleteConfirm !== $_migDeleteTarget"
          data-on:click="@delete('${base}/migrations/' + $_migDeleteTarget); $_migDeleteTarget=''; $_migDeleteConfirm=''; document.getElementById('mig-delete-confirm-dialog').close()"
        >
          Delete
        </button>
      </div>
    </dialog>
  `;

  const dialog = html`
    <dialog id="migration-editor" closedby="any">
      <div data-signals="{sql:'', filename:'', _description:''}">
        <h3 class="migration-form-title">New migration</h3>
        <label class="migration-label">
          <span class="migration-label-title">Description</span>
          <input
            class="mig-description-input"
            data-bind:_description
            data-on:input="const s = evt.target.value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, ''); $filename = s ? '${nextNum}_' + s + '.sql' : ''"
            placeholder="e.g. add users table"
            autocomplete="off"
            spellcheck="false"
          />
        </label>
        <div class="mig-filename-preview">
          <span class="mig-filename-preview-label">Filename</span>
          <code
            class="mig-filename-preview-value"
            data-text="$filename || '${nextNum}_description.sql'"
          ></code>
        </div>
        <label class="migration-label">
          <span class="migration-label-title">SQL</span>
          <textarea
            data-bind:sql
            rows="8"
            class="migration-sql"
            placeholder="CREATE TABLE ..."
          ></textarea>
        </label>
        <div class="migration-btn-row">
          <button
            class="primary"
            data-attr:disabled="!$filename"
            data-on:click="document.getElementById('migration-editor').close(); @post('${base}/migrations')"
          >
            Save
          </button>
          <button
            class="primary"
            data-attr:disabled="!$filename"
            data-on:click="document.getElementById('migration-editor').close(); @post('${base}/migrations/save-and-run')"
          >
            Save &amp; Run
          </button>
          <form method="dialog">
            <button type="submit">Cancel</button>
          </form>
        </div>
      </div>
    </dialog>
  `;

  const sqlDialog = html`
    <dialog id="migration-sql-dialog" closedby="any">
      <div class="migration-sql-dialog-header">
        <h3
          class="migration-sql-dialog-title"
          id="migration-sql-dialog-title"
        ></h3>
        <form method="dialog">
          <button type="submit">Close</button>
        </form>
      </div>
      <div id="migration-sql-content"></div>
    </dialog>
  `;

  if (files.length === 0) {
    return String(html`
      <div
        id="migrations-view"
        data-signals="{_migDeleteTarget:'', _migDeleteConfirm:''}"
      >
        <style>
          ${styles}
        </style>
        ${dialog} ${sqlDialog} ${deleteDialog}
        <div class="migrations-empty">
          <div class="migrations-empty-icon">
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
              class="icon icon-tabler icons-tabler-outline icon-tabler-file-code"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M14 3v4a1 1 0 0 0 1 1h4" />
              <path
                d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2"
              />
              <path d="M10 13l-1 2l1 2" />
              <path d="M14 13l1 2l-1 2" />
            </svg>
          </div>
          <h3 class="migrations-empty-title">No migrations yet</h3>
          <p class="migrations-empty-body">
            Create SQL migration files to track and apply schema changes to your
            database.
          </p>
          <button
            class="primary"
            data-on:click="$_description=''; $filename=''; $sql=''; document.getElementById('migration-editor').showModal()"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="icon icon-tabler icons-tabler-outline icon-tabler-plus"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M12 5l0 14" />
              <path d="M5 12l14 0" />
            </svg>
            New migration
          </button>
        </div>
      </div>
    `);
  }

  const rows = files
    .map((f) => {
      const isApplied = appliedSet.has(f.name);
      const statusBadge = isApplied
        ? '<span class="badge fk">Applied</span>'
        : '<span class="badge pk">Pending</span>';
      const runBtn = !isApplied
        ? `<button class="primary" data-on:click="@post('${base}/migrations/${encodeURIComponent(f.name)}/run')">Run</button>`
        : "";
      const viewBtn = `<button data-on:click="document.getElementById('migration-sql-dialog-title').textContent='${f.name.replace(/'/g, "\\'")}'; document.getElementById('migration-sql-dialog').showModal(); @get('${base}/migrations/${encodeURIComponent(f.name)}')">View</button>`;
      const deleteBtn = `<button class="danger" data-on:click="$_migDeleteTarget='${f.name}'; $_migDeleteConfirm=''; document.getElementById('mig-delete-confirm-dialog').showModal()">Delete</button>`;
      return `<tr><td class="migration-filename">${f.name}</td><td>${statusBadge}</td><td style="justify-content:flex-end"><div class="mig-btn-group">${runBtn}${viewBtn}${deleteBtn}</div></td></tr>`;
    })
    .join("\n");

  return String(html`
    <div
      id="migrations-view"
      data-signals="{_migDeleteTarget:'', _migDeleteConfirm:''}"
    >
      <style>
        ${styles}
      </style>
      ${dialog} ${sqlDialog} ${deleteDialog}
      <div class="migrations-controls">
        ${raw(
          hasPending
            ? `<div class="ctrl-group" style="view-transition-name: ctrl-group-1;"><button class="primary" data-on:click="@post('${base}/migrations/run-all')">Run all pending</button></div>`
            : "",
        )}
        <div class="ctrl-group" style="view-transition-name: ctrl-group-2;">
          <button
            data-on:click="$_description=''; $filename=''; $sql=''; document.getElementById('migration-editor').showModal()"
          >
            New migration
          </button>
        </div>
      </div>
      <div class="migrations-container">
        <div class="migrations-card">
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
    </div>
  `);
}
