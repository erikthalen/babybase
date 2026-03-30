import { basename } from "node:path";
import { html, raw } from "hono/html";
import {
  iconArrowDown,
  iconCheck,
  iconLink,
  iconMenu,
  iconUpload,
  iconX,
  uploadZoneScript,
} from "@babybase/ui";
import type { BackupEntry } from "./queries.ts";

const css = String.raw;

const styles = css`
  #storage-view {
  }
  .storage-container {
    padding: 4.5rem 1.5rem 6rem;
    max-width: 880px;
    margin-inline: auto;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .storage-card-header {
    padding: 0.875rem 1.25rem 0.75rem;
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
  .storage-dropzone-card {
    background: var(--pb-surface);
    border: 1px solid var(--pb-border);
    border-radius: 12px;
    overflow-y: clip;
    padding: 1rem;
  }
  .storage-dropzone-card .upload-zone {
    margin: 0;
    max-width: none;
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
  tr.active-row td {
    background: rgba(34, 197, 94, 0.04);
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
  mode: "local" | "s3" = "local",
) {
  if (entries.length === 0) {
    return html`<tr>
      <td colspan="4" class="text-muted">No files yet.</td>
    </tr>`;
  }

  return entries.map((b, i) => {
    const isActive =
      b.source === "local" && !!activeDatabase && b.path === activeDatabase;
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
      mode === "local"
        ? b.type === "upload"
          ? html`<span class="badge upload">upload</span>`
          : b.type === "original"
            ? html`<span class="badge original">original</span>`
            : ""
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

    const cloneUrl = `${basePath}/storage/s3/${encodeURIComponent(b.name)}/clone`;

    const downloadUrl =
      b.type === "original"
        ? `${basePath}/storage/~original/download`
        : `${basePath}/storage/${encodeURIComponent(b.name)}/download`;

    const vtGroup = `vt-${i}-${b.name.replace(/[^a-zA-Z0-9]/g, "-")}`;
    const id = "id" + Math.random();

    const mountItem = isActive
      ? html`<span
          class="button ghost"
          style="opacity:0.4;view-transition-name:${vtGroup}"
        >
          ${iconCheck(14)} Mounted
        </span>`
      : mode === "s3"
        ? html`<button class="ghost" data-on:click="@post('${cloneUrl}')">
            ${iconLink(14)} Clone to local
          </button>`
        : html`<button class="ghost" data-on:click="@post('${mountUrl}')">
            ${iconLink(14)} Mount
          </button>`;

    return html`<tr ${isActive ? 'class="active-row"' : ""}>
      <td class="backup-filename">
        <span>${b.name}</span>
        <small style="color: var(--jazz-neutral-500)">${b.path}</small>
        ${typeBadge || activeBadge
          ? html`<span class="backup-badges">
              ${typeBadge}${activeBadge}
            </span>`
          : ""}
      </td>
      <td>${label}</td>
      <td>${formatBytes(b.size)}</td>
      <td class="backup-actions-cell">
        <button popovertarget="actions-${id}" class="square outline">
          ${iconMenu(14)}
        </button>

        <div id="actions-${id}" popover data-placement="bottom right">
          <menu>
            <li>${mountItem}</li>
            <li>
              <a class="button ghost" href="${downloadUrl}" download="{b.name}">
                ${iconArrowDown(14)} Download
              </a>
            </li>

            ${b.type !== "original"
              ? html`<li><hr /></li>
                  <li>
                    <button
                      class="ghost destructive"
                      data-on:click="$_deleteTarget='${b.name}'; $_deleteSource='${b.source}'; $_deleteConfirm=''; document.getElementById('delete-confirm-dialog').showModal()"
                    >
                      ${iconX(14)} Delete
                    </button>
                  </li> `
              : ""}
          </menu>
        </div>
      </td>
    </tr>`;
  });
}

export function activeDbIndicator(name: string, active: boolean) {
  return html`<span
    id="active-db-indicator"
    class="active-db-indicator button ghost"
  >
    <span class="active-db-dot ${active ? "" : "active-db-dot--none"}"></span>
    <span class="active-db-name">${name}</span>
  </span>`;
}

export function storageView(opts: {
  entries: BackupEntry[];
  basePath: string;
  activeDatabase: string | undefined;
  s3?: boolean;
}) {
  const { entries, basePath, activeDatabase, s3 } = opts;
  const base = basePath.replace(/\/$/, "");
  const activeDbName = activeDatabase
    ? basename(activeDatabase)
    : "No database";

  const localEntries = entries.filter((e) => e.source === "local");
  const s3Entries = entries.filter((e) => e.source === "s3");

  const uploadScript = html`<script>
    ${raw(uploadZoneScript)};
    document
      .getElementById("upload-zone")
      .addEventListener("upload-zone:success", function () {
        <!-- window.location.reload(); -->
      });
    document
      .getElementById("upload-zone")
      .addEventListener("upload-zone:error", function (e) {
        var container = document.getElementById("toast-container");
        if (!container) return;
        var el = document.createElement("div");
        el.className = "toast toast-error";
        el.setAttribute("role", "alert");
        el.innerHTML =
          '<div class="toast-content"><div class="toast-title">Upload failed</div><div class="toast-body">' +
          e.detail.message +
          '</div></div><button class="toast-dismiss" onclick="this.closest(&quot;.toast&quot;).remove()" aria-label="Dismiss"></button>';
        container.prepend(el);
      });
  </script>`;

  const deleteDialog = html`<dialog id="delete-confirm-dialog" closedby="any">
    <article>
      <header>
        <h3>Delete backup</h3>
        <p>
          <small>
            This action cannot be undone. Type the filename to confirm:
          </small>
        </p>
      </header>

      <div style="display:grid;gap:1rem;">
        <code style="font-size:1rem;" data-text="$_deleteTarget"></code>

        <label class="field">
          <span>Filename</span>
          <input
            data-bind:_delete-confirm
            data-attr:placeholder="$_deleteTarget"
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
            data-on:click="$_deleteConfirm=''"
          >
            Cancel
          </button>
        </form>

        <button
          class="destructive"
          data-attr:disabled="$_deleteConfirm !== $_deleteTarget"
          data-on:click="@delete($_deleteSource === 's3' ? '${base}/storage/s3/' + $_deleteTarget : '${base}/storage/' + $_deleteTarget); $_deleteSource=''; $_deleteTarget=''; $_deleteConfirm=''; document.getElementById('delete-confirm-dialog').close()"
        >
          Delete
        </button>
      </footer>
    </article>
  </dialog>`;

  const localTable = html`<div>
    <table>
      <thead>
        <tr>
          <th>File</th>
          <th>Created</th>
          <th>Size</th>
          <th></th>
        </tr>
      </thead>
      <tbody id="storage-list">
        ${storageListRows(localEntries, base, activeDatabase, "local")}
      </tbody>
    </table>
  </div>`;

  const s3Table = s3
    ? html`<div>
        <div class="storage-card-header">
          <small>S3 Backups</small>
        </div>
        <table>
          <thead>
            <tr>
              <th>File</th>
              <th>Created</th>
              <th>Size</th>
              <th></th>
            </tr>
          </thead>
          <tbody id="storage-list-s3">
            ${storageListRows(s3Entries, base, activeDatabase, "s3")}
          </tbody>
        </table>
      </div>`
    : "";

  const dropzone = html`
    <label
      id="upload-zone"
      class="file-drop"
      data-upload-url="${base}/storage/upload"
    >
      <input type="file" id="upload-input" accept=".db,.sqlite" />
      Drag files here or choose from folder
      <small> or click to select (.db, .sqlite)</small>
    </label>
  `;

  return html`<div
    id="storage-view"
    data-signals="{_deleteTarget:'', _deleteSource:'', _deleteConfirm:''}"
  >
    <style>
      ${raw(styles)}
    </style>
    <div class="storage-controls">
      <fieldset role="group" style="view-transition-name: button-group-1;">
        ${activeDbIndicator(activeDbName, !!activeDatabase)}
      </fieldset>
      ${activeDatabase
        ? html`<fieldset
            role="group"
            style="view-transition-name: button-group-2;"
          >
            <button class="primary" data-on:click="@post('${base}/storage')">
              Create backup
            </button>
          </fieldset> `
        : ""}
    </div>
    <div class="storage-container">${localTable} ${s3Table} ${dropzone}</div>

    ${uploadScript} ${deleteDialog}
  </div>`;
}
