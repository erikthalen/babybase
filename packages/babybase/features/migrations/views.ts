import { html, raw } from "hono/html";
import { iconFileCode, iconPlus } from "@babybase/ui";
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
  .migrations-controls .button-group {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
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
    <dialog
      id="mig-delete-confirm-dialog"
      class="confirm-dialog"
      closedby="any"
    >
      <h3 class="confirm-dialog-title">Delete migration</h3>
      <p class="confirm-dialog-body">
        This action cannot be undone. Type the filename to confirm:
      </p>
      <code
        class="confirm-dialog-name"
        data-text="$_migDeleteTarget"
      ></code>
      <span class="confirm-dialog-label">Filename</span>
      <input
        data-bind:_mig-delete-confirm
        data-attr:placeholder="$_migDeleteTarget"
        autocomplete="off"
        spellcheck="false"
      />
      <div class="confirm-dialog-actions">
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
    return html`
      <div
        id="migrations-view"
        data-signals="{_migDeleteTarget:'', _migDeleteConfirm:''}"
      >
        <style>
          ${styles}
        </style>
        ${dialog} ${sqlDialog} ${deleteDialog}
        <div class="empty-state migrations-empty">
          <div class="empty-state-icon">${iconFileCode(24)}</div>
          <h3 class="empty-state-title">No migrations yet</h3>
          <p class="empty-state-body">
            Create SQL migration files to track and apply schema changes to your
            database.
          </p>
          <button
            class="primary"
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
        ? '<span class="badge fk">Applied</span>'
        : '<span class="badge pk">Pending</span>';
      const runBtn = !isApplied
        ? `<button class="primary" data-on:click="@post('${base}/migrations/${encodeURIComponent(f.name)}/run')">Run</button>`
        : "";
      const viewBtn = `<button data-on:click="document.getElementById('migration-sql-dialog-title').textContent='${f.name.replace(/'/g, "\\'")}'; document.getElementById('migration-sql-dialog').showModal(); @get('${base}/migrations/${encodeURIComponent(f.name)}')">View</button>`;
      const deleteBtn = `<button class="danger" data-on:click="$_migDeleteTarget='${f.name}'; $_migDeleteConfirm=''; document.getElementById('mig-delete-confirm-dialog').showModal()">Delete</button>`;
      return `<tr><td class="migration-filename">${f.name}</td><td>${statusBadge}</td><td style="justify-content:flex-end"><div class="button-group">${runBtn}${viewBtn}${deleteBtn}</div></td></tr>`;
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
        ${raw(
          hasPending
            ? `<div class="button-group" style="view-transition-name: button-group-1;"><button class="primary" data-on:click="@post('${base}/migrations/run-all')">Run all pending</button></div>`
            : "",
        )}
        <div class="button-group" style="view-transition-name: button-group-2;">
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
  `;
}
