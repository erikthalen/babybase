import { basename } from "node:path";
import { html, raw } from "hono/html";
import { iconCheck, iconUpload, uploadZoneScript } from "@babybase/ui";
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
    overflow-y: clip;
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
  .storage-controls .button-group {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
  }
  .storage-controls .button-group:last-child {
    view-transition-name: storage-controls-actions;
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
    width: 100%;
  }

  .storage-table td {
    min-height: 72px;
  }

  .backup-filename {
    font-family: monospace;
    font-size: 0.8rem;
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: baseline;
  }
  .backup-filepath {
    font-size: 0.7rem;
    color: var(--pb-text-faint);
    word-break: break-all;
  }
  .backup-badges {
    display: flex;
    gap: 4px;
  }
  tr.active-row td {
    background: rgba(34, 197, 94, 0.04);
  }
  .backup-actions-cell {
    justify-content: flex-end;
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
  activeDatabase: string | undefined,
) {
  if (entries.length === 0) {
    return html`<tr>
      <td colspan="4" class="text-muted">No files yet.</td>
    </tr>`;
  }

  return entries.map((b, i) => {
    const isActive = b.path === activeDatabase;
    const label =
      b.createdAt.getTime() === 0
        ? "—"
        : new Intl.DateTimeFormat("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }).format(b.createdAt);

    const typeBadge =
      b.type === "upload"
        ? html`<span class="badge upload">upload</span>`
        : b.type === "original"
          ? html`<span class="badge original">original</span>`
          : "";

    const activeBadge = isActive
      ? html`<span
          class="badge active"
          style="view-transition-name: active-badge"
        >
          active
        </span>`
      : "";

    const mountUrl =
      b.type === "original"
        ? `${basePath}/storage/~original/mount`
        : `${basePath}/storage/${encodeURIComponent(b.name)}/mount`;

    const downloadUrl =
      b.type === "original"
        ? `${basePath}/storage/~original/download`
        : `${basePath}/storage/${encodeURIComponent(b.name)}/download`;

const vtGroup = `vt-${i}-${b.name.replace(/[^a-zA-Z0-9]/g, "-")}`;

    const mountBtn = isActive
      ? html`<button disabled style="view-transition-name: ${vtGroup}">
          <span data-tooltip="Currently mounted" style="display: flex;">
            ${iconCheck(12)}
          </span>
        </button>`
      : html`<button data-on:click="@post('${mountUrl}')">Mount</button>`;

    const deleteBtn =
      b.type !== "original"
        ? html`<button
            class="danger"
            data-on:click="$_deleteTarget='${b.name}'; $_deleteConfirm=''; document.getElementById('delete-confirm-dialog').showModal()"
          >
            Delete
          </button>`
        : "";

    return html`<tr ${isActive ? 'class="active-row"' : ""}>
      <td class="backup-filename">
        <span>${b.name}</span>
        <span class="backup-filepath">${b.path}</span>
        ${typeBadge || activeBadge
          ? html`<span class="backup-badges">
              ${typeBadge}${activeBadge}
            </span>`
          : ""}
      </td>
      <td>${label}</td>
      <td>${formatBytes(b.size)}</td>
      <td class="backup-actions-cell">
        <div class="button-group">
          ${deleteBtn}
          <a href="${downloadUrl}" download="${b.name}">Download</a>
          ${mountBtn}
        </div>
      </td>
    </tr>`;
  });
}

export function activeDbIndicator(name: string, active: boolean) {
  return html`<span id="active-db-indicator" class="active-db-indicator">
    <span class="active-db-dot${active ? "" : " active-db-dot--none"}"></span>
    <span class="active-db-name">${name}</span>
  </span>`;
}

export function storageView(opts: {
  entries: BackupEntry[];
  basePath: string;
  activeDatabase: string | undefined;
}) {
  const { entries, basePath, activeDatabase } = opts;
  const base = basePath.replace(/\/$/, "");
  const activeDbName = activeDatabase
    ? basename(activeDatabase)
    : "No database";

  const uploadScript = html`<script>
    ${raw(uploadZoneScript)}
    document.getElementById("upload-zone").addEventListener("upload-zone:success", function () {
      window.location.reload();
    });
    document.getElementById("upload-zone").addEventListener("upload-zone:error", function (e) {
      var container = document.getElementById("toast-container");
      if (!container) return;
      var el = document.createElement("div");
      el.className = "toast toast-error";
      el.setAttribute("role", "alert");
      el.innerHTML = '<div class="toast-content"><div class="toast-title">Upload failed</div><div class="toast-body">' + e.detail.message + '</div></div><button class="toast-dismiss" onclick="this.closest(&quot;.toast&quot;).remove()" aria-label="Dismiss"></button>';
      container.prepend(el);
    });
  </script>`;

  const deleteDialog = html`<dialog
    id="delete-confirm-dialog"
    class="confirm-dialog"
    closedby="any"
  >
    <h3 class="confirm-dialog-title">Delete backup</h3>
    <p class="confirm-dialog-body">
      This action cannot be undone. Type the filename to confirm:
    </p>
    <code class="confirm-dialog-name" data-text="$_deleteTarget"></code>
    <span class="confirm-dialog-label">Filename</span>
    <input
      data-bind:_delete-confirm
      data-attr:placeholder="$_deleteTarget"
      autocomplete="off"
      spellcheck="false"
    />
    <div class="confirm-dialog-actions">
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

  return html`<div
    id="storage-view"
    data-signals="{_deleteTarget:'', _deleteConfirm:''}"
  >
    <style>
      ${raw(styles)}
    </style>
    <div class="storage-controls">
      <div class="button-group" style="view-transition-name: button-group-1;">
        ${activeDbIndicator(activeDbName, !!activeDatabase)}
      </div>
      ${activeDatabase
        ? html`<div
            class="button-group"
            style="view-transition-name: button-group-2;"
          >
            <button class="primary" data-on:click="@post('${base}/storage')">
              Create backup
            </button>
          </div>`
        : ""}
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
            ${rows}
          </tbody>
        </table>
        <div class="storage-card-footer">
          <input
            type="file"
            id="upload-input"
            accept=".db,.sqlite"
            style="display:none"
          />
          <label
            for="upload-input"
            id="upload-zone"
            class="upload-zone"
            data-upload-url="${base}/storage/upload"
          >
            ${iconUpload(24)}
            <span class="upload-zone-title">
              Drag &amp; drop a database file here
            </span>
            <span class="upload-zone-subtitle">
              or click to select (.db, .sqlite)
            </span>
          </label>
        </div>
      </div>
    </div>

    ${uploadScript} ${deleteDialog}
  </div>`;
}
