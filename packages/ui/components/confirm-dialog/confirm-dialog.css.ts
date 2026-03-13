import { css } from "../../tag.ts";

export const confirmDialogCss = css`
  .confirm-dialog {
    background: var(--pb-surface, #111113);
    border: 1px solid var(--pb-border, #27272a);
    border-radius: 8px;
    padding: 1.5rem;
    color: inherit;
    width: 90%;
    max-width: 420px;
    left: 50%;
    top: 50%;
    translate: -50% -50%;
  }
  .confirm-dialog::backdrop {
    background: rgba(0, 0, 0, 0.5);
  }
  .confirm-dialog-title {
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 0.75rem;
  }
  .confirm-dialog-body {
    font-size: 0.875rem;
    color: var(--pb-text-muted, #a1a1aa);
    line-height: 1.5;
    margin-bottom: 0.75rem;
  }
  .confirm-dialog-name {
    font-family: var(--pb-monospace, ui-monospace, monospace);
    font-size: 0.8rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--pb-border, #27272a);
    border-radius: 4px;
    padding: 0.25rem 0.5rem;
    display: block;
    margin-bottom: 1rem;
    word-break: break-all;
  }
  .confirm-dialog-label {
    display: block;
    font-size: 0.8rem;
    color: var(--pb-text-muted, #a1a1aa);
    margin-bottom: 0.35rem;
  }
  .confirm-dialog input {
    width: 100%;
  }
  .confirm-dialog-actions {
    display: flex;
    justify-content: end;
    gap: 0.5rem;
    margin-top: 1.25rem;
  }
`;
