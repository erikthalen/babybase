import { html } from "hono/html";

export function createTableDialog(base: string) {
  return html`
    <button
      style="background:var(--pb-bg);display:flex;align-items:center;gap:0.25rem;"
      data-on:click="$_createTableDialog.showModal()"
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
      New Table
    </button>

    <dialog
      data-ref="_createTableDialog"
      closedby="any"
      style="left:50%;top:50%;translate:-50% -50%;background:var(--pb-surface);border:1px solid var(--pb-border);border-radius:8px;padding:1.5rem;color:var(--pb-text);"
    >
      <form>
        <label>
          Table name
          <input
            type="text"
            data-bind:_tableName
            placeholder="e.g. orders"
            autofocus
          />
        </label>
        <div>
          <button
            type="button"
            data-on:click="@post('${base}/schema/tables'); $_createTableDialog.close(); _tableName = ''"
          >
            Create
          </button>
          <button
            type="button"
            data-on:click="$_createTableDialog.close(); _tableName = ''"
          >
            Cancel
          </button>
        </div>
      </form>
    </dialog>
  `;
}
