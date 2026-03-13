import { html } from "hono/html";

export const emptyStateExample = {
  description:
    "Centered empty-state layout with an optional icon, title, body text, and action button. Used when a view has no content to display.",

  preview: html`
    <div class="empty-state">
      <div class="empty-state-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
      </div>
      <h3 class="empty-state-title">Nothing here yet</h3>
      <p class="empty-state-body">Create your first item to get started.</p>
      <button class="primary">Get started</button>
    </div>`,

  markup: html`<div class="empty-state">
  <div class="empty-state-icon"><!-- icon --></div>
  <h3 class="empty-state-title">Nothing here yet</h3>
  <p class="empty-state-body">Create your first item to get started.</p>
  <button class="primary">Get started</button>
</div>`,
};
