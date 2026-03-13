import { html } from "hono/html";

export const kbdExample = {
  description:
    "Styles the native <kbd> element to indicate keyboard shortcuts or key names.",

  preview: html`
    <span style="display:flex;align-items:center;gap:0.25rem;font-size:0.8rem;color:#a1a1aa">
      <kbd>⌘</kbd><kbd>K</kbd>
    </span>`,

  markup: html`<kbd>⌘</kbd><kbd>K</kbd>`,
};
