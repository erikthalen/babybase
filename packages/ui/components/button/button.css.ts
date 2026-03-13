import { css } from "../../tag.ts";

export const buttonCss = css`
  button,
  .button {
    user-select: none;
    cursor: pointer;
    padding: 0.375rem 0.75rem;
    border: 1px solid var(--pb-border-input, rgba(255, 255, 255, 0.12));
    border-radius: 8px;
    background: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5em;
    color: #fafafa;
    font-size: 0.8125rem;
    font-family: inherit;
    font-weight: 500;
    text-decoration: none;
    transition:
      background 0.12s,
      border-color 0.12s,
      color 0.12s;
  }
  button[disabled],
  .button[disabled] {
    cursor: default;
  }
  button:not([disabled]):hover,
  .button:not([disabled]):hover {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.2);
  }
  button.primary,
  .button.primary {
    background: var(--pb-primary, #fafafa);
    color: var(--pb-primary-fg, #09090b);
    border-color: var(--pb-primary, #fafafa);
  }
  button.primary:hover,
  .button.primary:hover {
    background: #e4e4e7;
    border-color: #e4e4e7;
  }
  button.danger,
  .button.danger {
    background: transparent;
    color: var(--pb-danger, #ef4444);
    border-color: rgba(239, 68, 68, 0.3);
  }
  button.danger:hover,
  .button.danger:hover {
    background: rgba(239, 68, 68, 0.08);
    border-color: rgba(239, 68, 68, 0.5);
  }
`;
