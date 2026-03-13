import { css } from "../../tag.ts";

export const tooltipCss = css`
  [data-tooltip] {
    position: relative;
  }
  [data-tooltip]::before {
    content: attr(data-tooltip);
    position: absolute;
    top: calc(100% + 7px);
    left: 50%;
    transform: translateX(-50%);
    background: #000;
    color: #fff;
    padding: 4px 8px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 400;
    white-space: nowrap;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.15s;
    z-index: 100;
  }
  /* [data-tooltip]::after {
  content: "";
  position: absolute;
  top: calc(100% + 2px);
  left: 50%;
  transform: translateX(-50%);
  border: 4px solid transparent;
  border-bottom-color: #000;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.15s;
  z-index: 100;
} */
  [data-tooltip]:hover::before {
    opacity: 1;
  }
`;
