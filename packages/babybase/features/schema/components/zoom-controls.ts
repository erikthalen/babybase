import { html } from "hono/html";
import { iconMinus, iconPlus } from "../../../components/icons.ts";

export function zoomControls() {
  return html`
  <style>
    #zoom-controls {
      align-items: center;

      > * {
        border: none;
      }

      span {
        width: 4ch;
        text-align: center;
      }
    }
  </style>
    <fieldset role="group" id="zoom-controls">
      <button
        class="ghost square"
        id="zoom-out"
        data-tooltip="Zoom out"
        data-placement="bottom"
      >
        ${iconMinus(16)}
      </button>
      <span id="zoom-level">100%</span>
      <button
        class="ghost square"
        id="zoom-in"
        data-tooltip="Zoom in"
        data-placement="bottom"
      >
        ${iconPlus(16)}
      </button>
    </fieldset>
  `;
}
