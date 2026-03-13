import { html, raw } from "hono/html";
import { highlightSql, iconX } from "@babybase/ui";

const css = String.raw;

const shellStyles = css`
  #edits-dialog {
    background: var(--pb-surface);
    border: 1px solid var(--pb-border);
    padding: 0;
    color: var(--pb-text);
    width: min(90vw, 640px);
    max-height: 100vh;
    height: 100vh;
    overflow: auto;
    right: 0%;
    left: auto;
    top: 0%;
  }
`;

const contentStyles = css`
  #edits-dialog-body {
    display: flex;
    flex-direction: column;
  }
  .edits-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid var(--pb-border);
    position: sticky;
    top: 0;
    background: var(--pb-surface);
    z-index: 1;
  }
  .edits-header h2 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
  }
  .edits-close-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1.2rem;
    color: var(--pb-text-faint);
    line-height: 1;
  }
  .edits-entry {
    padding: 1rem 1.5rem;
    border-bottom: 1px solid var(--pb-border);
  }
  .edits-entry-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.5rem;
  }
  .edits-entry-table {
    font-weight: 600;
    font-size: 0.875rem;
  }
  .edits-sql {
    font-family: var(--pb-monospace);
    font-size: 0.8rem;
    line-height: 1.6;
    overflow-x: auto;
    white-space: pre;
    color: #fafafa;
    background: var(--pb-syntax-bg);
    border-radius: 8px;
    padding: 1rem 1.25rem;
    margin: 0;
  }
`;

/** Empty dialog shell rendered once in the ER diagram page */
export function editsDialogShell() {
  return html`
    <dialog id="edits-dialog" data-ref="_editsDialog" closedby="any">
      <style>
        ${shellStyles}
      </style>
      <div id="edits-dialog-body">
        <!-- Populated by SSE when Edits button is clicked -->
      </div>
    </dialog>
  `;
}

/** Full dialog body — patched via SSE when the Edits button is clicked */
export function editsDialogContent(
  entries: Array<{ tableName: string; sql: string }>,
  base: string,
) {
  return html`
    <style>
      ${contentStyles}
    </style>
    <div class="edits-header">
      <h2>Pending Changes</h2>
      <button
        type="button"
        class="edits-close-btn"
        data-on:click="$_editsDialog.close()"
      >
        ${iconX(16)}
      </button>
    </div>
    ${entries.length === 0
      ? html`<p
          class="empty-state-body"
          style="padding:2rem;text-align:center;"
        >
          No pending changes.
        </p>`
      : entries.map(
          (e) => html`
            <div class="edits-entry">
              <div class="edits-entry-header">
                <span class="edits-entry-table">${e.tableName}</span>
                <button
                  type="button"
                  class="danger"
                  data-on:click="@delete('${base}/schema/tables/${e.tableName}/pending')"
                >
                  Remove
                </button>
              </div>
              <pre class="edits-sql">
${highlightSql(e.sql || "-- no changes detected")}</pre
              >
            </div>
          `,
        )}
  `;
}

/** Publish + Edits action buttons — patched when pending count changes */
export function schemaActions(base: string, pendingCount: number) {
  if (pendingCount === 0) {
    return html`<span id="schema-actions" style="display:none"></span>`;
  }
  return html`<div id="schema-actions" class="button-group">
    <button
      data-on:click="$_editsDialog.showModal(); @get('${base}/schema/edits-dialog')"
    >
      Edits (${pendingCount})
    </button>
    <button class="primary" data-on:click="@post('${base}/schema/publish')">
      Publish (${pendingCount})
    </button>
  </div>`;
}
