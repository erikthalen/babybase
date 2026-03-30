import { css } from "../../tag.ts";

export const activeDbIndicatorCss = css`
  .active-db-indicator {
    color: var(--jazz-neutral-400);
    view-transition-name: active-db-indicator;
  }
  .active-db-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #22c55e;
    flex-shrink: 0;
    view-transition-name: active-db-dot;
  }
  .active-db-dot--none {
    background: var(--pb-text-faint, #52525b);
  }
  .active-db-name {
    font-family: var(--pb-monospace, ui-monospace, monospace);
    view-transition-name: active-db-name;
  }
  ::view-transition-group(active-db-name) {
    overflow: hidden;
  }
  ::view-transition-old(active-db-name) {
    animation: 150ms ease-out both move-out;
  }

  ::view-transition-new(active-db-name) {
    animation: 150ms ease-out both move-in;
  }
`;
