import { html } from "hono/html";
import { iconTablePlus } from "../../../components/icons.ts";

export function createTableDialog(base: string) {
  return html`
    <button
      class="create-table-button"
      data-on:click="$_editTableDialog.showModal(); @get('${base}/schema/new-table-dialog')"
    >
      <style>
        ${styles}
      </style>
      
      ${iconTablePlus(12)} New Table
    </button>
  `;
}

const css = String.raw;

const styles = css`
  .create-table-dialog {
    left: 50%;
    top: 50%;
    translate: -50% -50%;
    background: var(--jazz-neutral-50);
    border: 1px solid var(--jazz-neutral-200);
    border-radius: 8px;
    padding: 1.5rem;
    color: var(--jazz-neutral-900);
  }
`;
