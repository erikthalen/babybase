import { html } from "hono/html";
import { iconX } from "../../index.ts";

export function toastHtml(
  title: string,
  body: string,
  variant?: "error",
) {
  const cls = variant === "error" ? " toast-error" : "";
  return html`<div class="toast${cls}" role="alert">
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-body">${body}</div>
    </div>
    <button class="toast-dismiss" onclick="this.closest('.toast').remove()" aria-label="Dismiss">
      ${iconX(14)}
    </button>
  </div>`;
}

export const toastExample = {
  description:
    "Fixed-position toast notifications that stack in the corner. Supports a default and an error variant. Dismiss on click or clear all when multiple are present.",

  preview: html`
    <style>
      /* Static preview: reset stacking so all toasts are visible */
      .toast-preview .toast {
        position: static;
        pointer-events: all;
        animation: none;
        transform: none !important;
        opacity: 1 !important;
        margin-bottom: 0.5rem;
      }
    </style>
    <div class="toast-preview" style="width:320px">
      ${toastHtml("Row inserted", "New record added to users.")}
      ${toastHtml("Query failed", "no such column: emal", "error")}
    </div>`,

  markup: html`<div id="toast-container">
  <div class="toast" role="alert">
    <div class="toast-content">
      <div class="toast-title">Title</div>
      <div class="toast-body">Message body.</div>
    </div>
    <button class="toast-dismiss" onclick="this.closest('.toast').remove()" aria-label="Dismiss">
      <!-- iconX -->
    </button>
  </div>
  <button id="toast-clear-all">Clear all</button>
</div>`,
};
