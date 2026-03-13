import { css } from "../../tag.ts";

export const toastCss = css`
  #toast-container {
    position: fixed;
    top: 1rem;
    right: 1rem;
    z-index: 200;
    pointer-events: none;
    display: grid;
    width: 320px;
  }

  @keyframes toast-in {
    from {
      opacity: 0;
      transform: translateY(0.5rem);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .toast {
    grid-row: 1;
    grid-column: 1;
    align-self: start;
    width: 100%;
    background: var(--pb-surface, #111113);
    border: 1px solid var(--pb-border, #27272a);
    border-radius: 8px;
    padding: 0.875rem 1rem;
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
    pointer-events: none;
    animation: toast-in 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    transition:
      transform 0.35s cubic-bezier(0.16, 1, 0.3, 1),
      opacity 0.25s ease;
  }

  /* newest — on top, fully interactive */
  .toast:first-child {
    pointer-events: all;
    z-index: 3;
  }
  /* second — peeks below */
  .toast:nth-child(2) {
    z-index: 2;
    transform: translateY(-4px);
  }
  /* third — peeks further */
  .toast:nth-child(3) {
    z-index: 1;
    transform: translateY(-8px);
  }
  /* rest — hidden but still in flow */
  .toast:nth-child(n + 4) {
    z-index: 0;
    transform: translateY(-12px);
    opacity: 0;
    pointer-events: none;
  }

  .toast-content {
    flex: 1;
    min-width: 0;
  }

  .toast-title {
    font-size: 0.875rem;
    font-weight: 600;
    margin-bottom: 0.2rem;
  }

  .toast-body {
    font-size: 0.8rem;
    color: var(--pb-text-muted, #a1a1aa);
    line-height: 1.4;
    white-space: pre-line;
    word-break: break-all;
  }

  .toast-body code {
    font-family: var(--pb-monospace, ui-monospace, monospace);
    font-size: 0.75rem;
    background: rgba(255, 255, 255, 0.07);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 3px;
    padding: 0 3px;
  }

  .toast-dismiss {
    flex-shrink: 0;
    height: 20px;
    width: 20px;
    min-width: 20px;
    padding: 0;
    border-color: transparent;
    color: var(--pb-text-faint, #52525b);
    margin-top: 1px;
    pointer-events: auto;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .toast-dismiss:hover {
    border-color: transparent;
    color: var(--pb-text-muted, #a1a1aa);
  }

  .toast-error {
    border-color: rgba(239, 68, 68, 0.4);
  }
  .toast-error .toast-title {
    color: var(--pb-danger, #f87171);
  }

  #toast-clear-all {
    display: none;
    grid-row: 2;
    grid-column: 1;
    justify-self: end;
    margin-top: 0.4rem;
    font-size: 0.75rem;
    color: var(--pb-text-muted, #a1a1aa);
    border-color: transparent;
    padding: 2px 8px;
    height: auto;
    pointer-events: all;
  }
  #toast-clear-all:hover {
    border-color: transparent;
    color: var(--pb-text, #fafafa);
  }
  #toast-container:has(.toast ~ .toast) #toast-clear-all {
    display: block;
  }
`;
