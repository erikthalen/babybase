import { html } from "hono/html";
import { iconMinus, iconPlus } from "../../../components/icons.ts";

export function zoomControls() {
  return html`
    <style>
      #zoom-controls {
        > * {
          outline-left: none;
        }

        span {
          width: 5ch;
          display: flex;
          align-items: center;
          justify-content: center;
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
