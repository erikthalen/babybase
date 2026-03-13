import { html } from "hono/html";

export const activeDbIndicatorExample = {
  description:
    "Displays the currently active database name with a status dot. Uses view-transition-name for smooth cross-page transitions.",

  preview: html`
    <div style="display:flex;flex-direction:column;gap:1rem;">
      <span class="active-db-indicator">
        <span class="active-db-dot"></span>
        <span class="active-db-name">chinook.db</span>
      </span>
      <span class="active-db-indicator">
        <span class="active-db-dot active-db-dot--none"></span>
        <span class="active-db-name">No database</span>
      </span>
    </div>`,

  markup: html`<span class="active-db-indicator">
  <span class="active-db-dot"></span>
  <span class="active-db-name">chinook.db</span>
</span>`,
};
