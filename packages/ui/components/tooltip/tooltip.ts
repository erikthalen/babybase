import { html } from "hono/html";

export const tooltipExample = {
  description: "A pure-CSS tooltip triggered on hover. Add a data-tooltip attribute to any element — no JavaScript required.",

  preview: html`
    <div style="display:flex;gap:2rem;align-items:center;">
      <button data-tooltip="Save changes">Save</button>
      <button data-tooltip="Delete permanently">Delete</button>
      <span data-tooltip="Longer tooltip explaining something in detail" style="cursor:default;text-decoration:underline dotted;">hover me</span>
    </div>`,

  markup: html`<button data-tooltip="Your tooltip text">Button</button>`,
};
