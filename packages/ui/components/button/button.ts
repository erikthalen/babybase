import { html } from "hono/html";

export const buttonExample = {
  description:
    "Base button styles applied directly to the <button> element. Variants: default, primary, danger, disabled.",

  preview: html`
    <div style="display:flex;gap:0.75rem;align-items:center;flex-wrap:wrap;">
      <button>Default</button>
      <button class="primary">Primary</button>
      <button class="danger">Danger</button>
      <button disabled>Disabled</button>
    </div>`,

  markup: html`<button>Default</button>
<button class="primary">Primary</button>
<button class="danger">Danger</button>
<button disabled>Disabled</button>`,
};
