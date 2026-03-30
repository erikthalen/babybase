import { html, raw } from "hono/html";
import { highlightSql, iconX } from "@babybase/ui";

const css = String.raw;

const shellStyles = css`
  #edits-dialog {
    max-height: 100vh;
    height: 100vh;
    overflow: auto;
    right: 0%;
    left: auto;
    top: 0%;
    border-radius: 0;
  }
`;

const contentStyles = css`
  #edits-dialog-body {
    display: flex;
    flex-direction: column;
    
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;

    }
  }

  .edits-entry {
    border-bottom: 1px solid var(--jazz-neutral-200);
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

    <article>
      <header>
        <h2>Pending Changes</h2>
        <button
          type="button"
          class="ghost square"
          data-on:click="$_editsDialog.close()"
        >
          ${iconX(16)}
        </button>
      </header>

      <div>
        ${entries.length === 0
          ? html`<p
              class="empty-state-body"
              style="padding:2rem;text-align:center;"
            >
              No pending changes.
            </p>`
          : entries.map(
              (e) =>
                html` <div class="edits-entry">
                  <div class="edits-entry-header">
                    <span class="edits-entry-table">${e.tableName}</span>
                    <button
                      type="button"
                      class="destructive"
                      data-on:click="@delete('${base}/schema/tables/${e.tableName}/pending')"
                    >
                      Remove
                    </button>
                  </div>
                  <pre class="edits-sql">
${highlightSql(e.sql || "-- no changes detected")}</pre
                  >
                </div>`,
            )}
      </div>
    </article>
  `;
}

/** Publish + Edits action buttons — patched when pending count changes */
export function schemaActions(base: string, pendingCount: number) {
  if (pendingCount === 0) {
    return html`<span id="schema-actions" style="display:none"></span>`;
  }
  return html` <fieldset role="group" id="schema-actions">
    <button
      class="ghost"
      data-on:click="$_editsDialog.showModal(); @get('${base}/schema/edits-dialog')"
    >
      Edits (${pendingCount})
    </button>
    <button class="primary" data-on:click="@post('${base}/schema/publish')">
      Publish (${pendingCount})
    </button>
  </fieldset>`;
}
