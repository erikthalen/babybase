import { html } from "hono/html";

export const buttonGroupExample = {
  description:
    "A pill-shaped container that groups related buttons or links with automatic dividers between items.",

  preview: html` <div
    style="display:flex;flex-direction:column;gap:1.5rem;align-items:flex-start;"
  >
    <div class="button-group">
      <button>Edit</button>
      <a href="#" class="button">View</a>
      <button class="danger">Delete</button>
    </div>
    <div class="button-group">
      <button disabled>Mounted</button>
      <a href="#" class="button">Download</a>
    </div>
  </div>`,

  markup: html`<div class="button-group">
    <button>Edit</button>
    <a href="#">View</a>
    <button class="danger">Delete</button>
  </div>`,
};
