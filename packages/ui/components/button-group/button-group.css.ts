import { css } from "../../tag.ts";

export const buttonGroupCss = css`
  .button-group {
    display: flex;
    align-items: center;
    gap: 3px;
    background: var(--pb-surface, #111113);
    border: 1px solid var(--pb-border, #27272a);
    border-radius: 10px;
    padding: 3px;
  }

  .button-group button,
  .button-group a {
    border-color: transparent;
    border-radius: 7px;
    height: 27px;
  }

  .button-group a {
    display: flex;
    align-items: center;
    padding: 0 0.625rem;
    font-size: 0.8125rem;
    font-weight: 500;
    color: var(--pb-text-muted, #a1a1aa);
    text-decoration: none;
    cursor: pointer;
  }

  /* .button-group button:hover,
.button-group a:hover {
  border-color: transparent;
  background: var(--pb-nav-hover, #18181b);
  color: var(--pb-text-heading, #fafafa);
} */

  /* Divider between adjacent items */
  .button-group > *:not(style) + *:not(style) {
    position: relative;
  }
  .button-group > *:not(style) + *:not(style)::before {
    content: "";
    position: absolute;
    left: -3px;
    top: 0;
    bottom: 0;
    width: 1px;
    background: var(--pb-border, #27272a);
  }
`;
