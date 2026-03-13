import { html } from "hono/html";

export const checkboxExample = {
  description:
    "Fully custom checkbox via appearance:none. The checked state renders an inline SVG checkmark via background-image.",

  preview: html`
    <div style="display:flex;gap:1.5rem;align-items:center;">
      <input type="checkbox" />
      <input type="checkbox" checked />
      <input type="checkbox" disabled />
      <input type="checkbox" checked disabled />
    </div>`,

  markup: html`<input type="checkbox" />
<input type="checkbox" checked />`,
};
