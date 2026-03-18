import { html } from "hono/html";

export const dropdownExample = {
  description:
    "A disclosure-based dropdown using <details>/<summary>. Panels anchor to the trigger and close when clicking outside.",

  preview: html` <details
    class="dropdown"
    data-ref="mydropdown"
    data-on:click__outside="$mydropdown.open = false"
  >
    <summary>Options</summary>
    <div class="dropdown-panel">
      <label class="dropdown-item">
        <input type="checkbox" checked /> Show column A
      </label>
      <label class="dropdown-item">
        <input type="checkbox" /> Show column B
      </label>
      <label class="dropdown-item">
        <input type="checkbox" checked /> Show column C
      </label>
    </div>
  </details>`,

  markup: html`<details
    class="dropdown"
    data-ref="mydropdown"
    data-on:click__outside="$mydropdown.open = false"
  >
    <summary>Options</summary>
    <div class="dropdown-panel">
      <label class="dropdown-item">
        <input type="checkbox" checked /> Item one
      </label>
      <label class="dropdown-item"> <input type="checkbox" /> Item two </label>
    </div>
  </details>`,
};
