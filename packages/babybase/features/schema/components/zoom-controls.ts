import { html } from "hono/html";
import { iconMinus, iconPlus } from "@babybase/ui";

const css = String.raw;

const styles = css`
  #zoom-controls {
    display: contents;
  }
  .zoom-btn {
    width: 25px;
    height: 25px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: 7px;
  }
  #zoom-level {
    min-width: 3rem;
    text-align: center;
    font-size: 0.75rem;
    color: var(--pb-text-muted);
    font-family: var(--pb-monospace);
    padding: 0 4px;
  }
`;

export function zoomControls() {
  return html`
    <div id="zoom-controls">
      <style>
        ${styles}
      </style>
      <button class="zoom-btn" id="zoom-out" data-tooltip="Zoom out">
        ${iconMinus(12)}
      </button>
      <span id="zoom-level">100%</span>
      <button class="zoom-btn" id="zoom-in" data-tooltip="Zoom in">
        ${iconPlus(12)}
      </button>
    </div>
  `;
}
