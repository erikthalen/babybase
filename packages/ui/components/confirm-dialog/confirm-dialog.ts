import { html } from "hono/html";

export const confirmDialogExample = {
  description:
    "Modal confirmation dialog with a type-to-confirm input. Use for destructive actions that cannot be undone.",

  preview: html`
    <div style="display:flex;gap:0.75rem;align-items:center;">
      <button onclick="document.getElementById('demo-confirm-dialog').showModal()">Open dialog</button>
      <dialog id="demo-confirm-dialog" class="confirm-dialog" closedby="any">
        <h3 class="confirm-dialog-title">Delete file</h3>
        <p class="confirm-dialog-body">This action cannot be undone. Type the filename to confirm:</p>
        <code class="confirm-dialog-name">my-file.sql</code>
        <span class="confirm-dialog-label">Filename</span>
        <input placeholder="my-file.sql" autocomplete="off" spellcheck="false" />
        <div class="confirm-dialog-actions">
          <form method="dialog">
            <button type="submit">Cancel</button>
          </form>
          <button class="danger" disabled>Delete</button>
        </div>
      </dialog>
    </div>`,

  markup: html`<dialog id="my-confirm-dialog" class="confirm-dialog" closedby="any">
  <h3 class="confirm-dialog-title">Delete file</h3>
  <p class="confirm-dialog-body">This action cannot be undone. Type the filename to confirm:</p>
  <code class="confirm-dialog-name">filename.sql</code>
  <span class="confirm-dialog-label">Filename</span>
  <input placeholder="filename.sql" autocomplete="off" spellcheck="false" />
  <div class="confirm-dialog-actions">
    <form method="dialog">
      <button type="submit">Cancel</button>
    </form>
    <button class="danger">Delete</button>
  </div>
</dialog>`,
};
