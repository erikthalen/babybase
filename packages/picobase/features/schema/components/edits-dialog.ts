import { html } from "hono/html";

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
  .edits-empty {
    padding: 2rem;
    color: var(--pb-text-muted);
    text-align: center;
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
    font-size: 0.75rem;
    color: var(--pb-text-muted);
    white-space: pre-wrap;
    word-break: break-all;
    margin: 0;
    background: var(--pb-bg);
    border: 1px solid var(--pb-border);
    border-radius: 4px;
    padding: 0.75rem;
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
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="icon icon-tabler icons-tabler-outline icon-tabler-x"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M18 6l-12 12" />
          <path d="M6 6l12 12" />
        </svg>
      </button>
    </div>
    ${
      entries.length === 0
        ? html`<p class="edits-empty">No pending changes.</p>`
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
              <pre class="edits-sql">${e.sql || "-- no changes detected"}</pre>
            </div>
          `,
          )
    }
  `;
}

/** Publish + Edits action buttons — patched when pending count changes */
export function schemaActions(base: string, pendingCount: number) {
  if (pendingCount === 0) {
    return html`<span id="schema-actions" style="display:none"></span>`;
  }
  return html`<div id="schema-actions" class="schema-actions">
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
