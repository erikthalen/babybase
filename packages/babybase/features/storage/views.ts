import { basename } from "node:path";
import { html, raw } from "hono/html";
import type { BackupEntry } from "./queries.ts";

const css = String.raw;

const styles = css`
  #storage-view {
  }
  .storage-container {
    padding: 4.5rem 1.5rem 6rem;
    max-width: 880px;
    margin-inline: auto;
  }
  .storage-card {
    background: var(--pb-surface);
    border: 1px solid var(--pb-border);
    border-radius: 12px;
    overflow: hidden;
  }
  .storage-controls {
    position: fixed;
    top: 1rem;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .storage-controls .ctrl-group {
    display: flex;
    align-items: center;
    gap: 2px;
    background: var(--pb-surface);
    border: 1px solid var(--pb-border);
    border-radius: 10px;
    padding: 3px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
  }
  .storage-controls .ctrl-group button {
    border: none;
    border-radius: 7px;
  }
  .storage-controls .ctrl-group button:hover {
    border-color: transparent;
  }
  .active-db-indicator {
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 5px 10px;
    font-size: 0.8rem;
    color: var(--pb-text-muted);
    view-transition-name: active-db-indicator;
  }
  ::view-transition-image-pair(*) {
    overflow: hidden;
  }
  ::view-transition-old(*),
  ::view-transition-new(*) {
    object-fit: none;
    object-position: center;
  }
  .storage-controls .ctrl-group:last-child {
    view-transition-name: storage-controls-actions;
  }
  .active-db-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #22c55e;
    flex-shrink: 0;
  }
  .active-db-name {
    font-family: var(--pb-monospace);
  }
  .storage-card-footer {
    padding: 1rem;
    border-top: 1px solid var(--pb-border);
  }
  .storage-card-footer .upload-zone {
    margin: 0;
    max-width: none;
  }
  .storage-table {
  }
  .backup-filename {
    font-family: monospace;
    font-size: 0.8rem;
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: baseline;
  }
  .backup-badges {
    display: flex;
    gap: 4px;
  }
  .backup-badge {
    font-size: 0.65rem;
    padding: 1px 5px;
    border-radius: 3px;
    vertical-align: middle;
  }
  .backup-badge + .backup-badge {
    margin-left: 4px;
  }
  .upload-badge {
    background: var(--pb-badge-pk-bg);
    color: var(--pb-badge-pk-fg);
  }
  .original-badge {
    background: rgba(139, 92, 246, 0.15);
    color: #a78bfa;
  }
  .active-badge {
    background: rgba(34, 197, 94, 0.12);
    color: #4ade80;
  }
  tr.active-row td {
    background: rgba(34, 197, 94, 0.04);
  }
  .backup-actions-cell {
    justify-content: flex-end;
  }
  .backup-btn-group {
    display: flex;
    align-items: center;
    gap: 3px;
    background: var(--pb-surface);
    border: 1px solid var(--pb-border);
    border-radius: 10px;
    padding: 3px;
  }
  .backup-btn-group button {
    border-color: transparent;
    border-radius: 7px;
    height: 27px;
  }
  .backup-btn-group button:hover,
  .backup-btn-group button.danger:hover {
    border-color: transparent;
  }
  .backup-btn-group button + button {
    position: relative;
  }
  .backup-btn-group button + button::before {
    content: "";
    position: absolute;
    left: -3px;
    top: 0;
    bottom: 0;
    width: 1px;
    background: var(--pb-border);
  }
  .upload-zone {
    border: 2px dashed var(--pb-border);
    border-radius: 8px;
    padding: 2.5rem 1rem;
    text-align: center;
    max-width: 400px;
    cursor: pointer;
    color: var(--pb-text-muted);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    margin-inline: auto;
    margin-top: 2rem;
    user-select: none;
    transition:
      border-color 0.15s,
      background-color 0.15s;
  }
  .upload-zone:hover,
  .upload-zone.drag-over {
    border-color: var(--pb-text-muted);
    background-color: var(--pb-bg);
  }
  .upload-zone.uploading {
    opacity: 0.6;
    cursor: wait;
    pointer-events: none;
  }
  .upload-zone-title {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--pb-text);
  }
  .upload-zone-subtitle {
    font-size: 0.8rem;
  }
  .delete-confirm-dialog {
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
  .delete-confirm-dialog::backdrop {
    background: rgba(0, 0, 0, 0.5);
  }
  .delete-confirm-title {
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 0.75rem;
  }
  .delete-confirm-body {
    font-size: 0.875rem;
    color: var(--pb-text-muted);
    line-height: 1.5;
    margin-bottom: 0.75rem;
  }
  .delete-confirm-name {
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
  .delete-confirm-label {
    display: block;
    font-size: 0.8rem;
    color: var(--pb-text-muted);
    margin-bottom: 0.35rem;
  }
  .delete-confirm-dialog input {
    width: 100%;
  }
  .delete-confirm-actions {
    display: flex;
    justify-content: end;
    gap: 0.5rem;
    margin-top: 1.25rem;
  }
`;

function formatBytes(b: number): string {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 / 1024).toFixed(2)} MB`;
}

export function storageListRows(
  entries: BackupEntry[],
  basePath: string,
  activeDatabase: string,
): string {
  if (entries.length === 0) {
    return '<tr><td colspan="4" class="text-muted">No files yet.</td></tr>';
  }
  return entries
    .map((b) => {
      const isActive = b.path === activeDatabase;
      const label =
        b.createdAt.getTime() === 0 ? "—" : b.createdAt.toLocaleString();

      const typeBadge =
        b.type === "upload"
          ? '<span class="backup-badge upload-badge">upload</span>'
          : b.type === "original"
            ? '<span class="backup-badge original-badge">original</span>'
            : "";
      const activeBadge = isActive
        ? '<span class="backup-badge active-badge">active</span>'
        : "";

      const mountUrl =
        b.type === "original"
          ? `${basePath}/storage/~original/mount`
          : `${basePath}/storage/${encodeURIComponent(b.name)}/mount`;

      const vtGroup = `vt-${b.name.replace(/[^a-zA-Z0-9]/g, "-")}`;

      const mountBtn = isActive
        ? `<button disabled><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-check"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 12l5 5l10 -10" /></svg></button>`
        : `<button data-on:click="@post('${mountUrl}')">Mount</button>`;

      const deleteBtn =
        b.type !== "original"
          ? `<button class="danger" data-on:click="$_deleteTarget='${b.name}'; $_deleteConfirm=''; document.getElementById('delete-confirm-dialog').showModal()">Delete</button>`
          : "";

      return `<tr${isActive ? ' class="active-row"' : ""}>
  <td class="backup-filename">
    <span>${b.name}</span>
    ${typeBadge || activeBadge ? `<span class="backup-badges">${typeBadge}${activeBadge}</span>` : ""}
  </td>
  <td>${label}</td>
  <td>${formatBytes(b.size)}</td>
  <td class="backup-actions-cell"><div class="backup-btn-group" style="view-transition-name: ${vtGroup}">${deleteBtn}${mountBtn}</div></td>
</tr>`;
    })
    .join("\n");
}

export function activeDbIndicator(name: string): string {
  return `<span id="active-db-indicator" class="active-db-indicator">
    <span class="active-db-dot"></span>
    <span class="active-db-name">${name}</span>
  </span>`;
}

export function storageView(opts: {
  entries: BackupEntry[];
  basePath: string;
  activeDatabase: string;
}): string {
  const { entries, basePath, activeDatabase } = opts;
  const base = basePath.replace(/\/$/, "");
  const activeDbName = basename(activeDatabase);

  const uploadInput = html`<input
    type="file"
    id="upload-input"
    accept=".db,.sqlite"
    style="display:none"
  />`;

  const uploadScript = html`<script>
    (function () {
      var zone = document.getElementById("upload-zone");
      var input = document.getElementById("upload-input");
      if (!zone || !input) return;
      var url = zone.dataset.uploadUrl;
      zone.addEventListener("dragover", function (e) {
        e.preventDefault();
        zone.classList.add("drag-over");
      });
      zone.addEventListener("dragleave", function () {
        zone.classList.remove("drag-over");
      });
      zone.addEventListener("drop", function (e) {
        e.preventDefault();
        zone.classList.remove("drag-over");
        var file = e.dataTransfer && e.dataTransfer.files[0];
        if (file) doUpload(file);
      });
      input.addEventListener("change", function () {
        if (input.files && input.files[0]) doUpload(input.files[0]);
      });
      function doUpload(file) {
        var fd = new FormData();
        fd.append("file", file);
        zone.classList.add("uploading");
        fetch(url, { method: "POST", body: fd })
          .then(function (r) {
            if (r.ok) window.location.reload();
          })
          .catch(function () {})
          .finally(function () {
            zone.classList.remove("uploading");
          });
      }
    })();
  </script>`;

  const deleteDialog = html`<dialog
    id="delete-confirm-dialog"
    class="delete-confirm-dialog"
    closedby="any"
  >
    <h3 class="delete-confirm-title">Delete backup</h3>
    <p class="delete-confirm-body">
      This action cannot be undone. Type the filename to confirm:
    </p>
    <code class="delete-confirm-name" data-text="$_deleteTarget"></code>
    <span class="delete-confirm-label">Filename</span>
    <input
      data-bind:_delete-confirm
      data-attr:placeholder="$_deleteTarget"
      autocomplete="off"
      spellcheck="false"
    />
    <div class="delete-confirm-actions">
      <form method="dialog">
        <button type="submit" data-on:click="$_deleteConfirm=''">Cancel</button>
      </form>
      <button
        class="danger"
        data-attr:disabled="$_deleteConfirm !== $_deleteTarget"
        data-on:click="@delete('${base}/storage/' + $_deleteTarget); $_deleteTarget=''; $_deleteConfirm=''; document.getElementById('delete-confirm-dialog').close()"
      >
        Delete
      </button>
    </div>
  </dialog>`;

  const rows = storageListRows(entries, base, activeDatabase);

  return String(
    html`<div
      id="storage-view"
      data-signals="{_deleteTarget:'', _deleteConfirm:''}"
    >
      <style>
        ${raw(styles)}
      </style>
      <div class="storage-controls">
        <div class="ctrl-group">${raw(activeDbIndicator(activeDbName))}</div>
        <div class="ctrl-group">
          <button class="primary" data-on:click="@post('${base}/storage')">
            Create backup
          </button>
        </div>
      </div>
      <div class="storage-container">
        <div class="storage-card">
          <table class="storage-table">
            <thead>
              <tr>
                <th>File</th>
                <th>Created</th>
                <th>Size</th>
                <th></th>
              </tr>
            </thead>
            <tbody id="storage-list">
              ${raw(rows)}
            </tbody>
          </table>
          <div class="storage-card-footer">
            ${uploadInput}
            <label
              for="upload-input"
              id="upload-zone"
              class="upload-zone"
              data-upload-url="${base}/storage/upload"
            >
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
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2" />
                <path d="M7 9l5 -5l5 5" />
                <path d="M12 4l0 12" />
              </svg>
              <span class="upload-zone-title"
                >Drag &amp; drop a database file here</span
              >
              <span class="upload-zone-subtitle"
                >or click to select (.db, .sqlite)</span
              >
            </label>
          </div>
        </div>
      </div>

      ${uploadScript} ${deleteDialog}
    </div>`,
  );
}
