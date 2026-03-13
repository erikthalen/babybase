import { css } from "../../tag.ts";

export const tableTabsCss = css`
  .table-tabs-bar {
    position: fixed;
    top: 1rem;
    left: 50%;
    transform: translateX(-50%);
    z-index: 100;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .table-tabs-bar .button-group {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
    flex-shrink: 0;
  }
  .table-tabs-bar .button-group a {
    width: 28px;
    height: 28px;
    padding: 0;
    justify-content: center;
  }
  .table-tabs-wrap {
    position: relative;
    background: var(--pb-surface, #111113);
    border: 1px solid var(--pb-border, #27272a);
    border-radius: 10px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
    padding: 3px;
    max-width: calc(100vw - 24rem);
  }
  .table-tabs-wrap::before,
  .table-tabs-wrap::after {
    content: "";
    position: absolute;
    top: 3px;
    bottom: 3px;
    width: 2.5rem;
    pointer-events: none;
    z-index: 1;
    opacity: 0;
    transition: opacity 0.15s;
  }
  .table-tabs-wrap::before {
    left: 3px;
    background: linear-gradient(to right, var(--pb-surface, #111113), transparent);
  }
  .table-tabs-wrap::after {
    right: 3px;
    background: linear-gradient(to left, var(--pb-surface, #111113), transparent);
  }
  .table-tabs-wrap.fade-left::before {
    opacity: 1;
  }
  .table-tabs-wrap.fade-right::after {
    opacity: 1;
  }
  .table-tabs {
    display: flex;
    flex-shrink: 0;
    gap: 2px;
    overflow-x: auto;
    scrollbar-width: none;
    flex-wrap: nowrap;
    max-width: none;
    padding: 0;
    background: none;
    border: none;
    border-radius: 0;
    box-shadow: none;
  }
  .table-tabs::-webkit-scrollbar {
    display: none;
  }
  .table-tabs a {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    padding: 0.4rem 0.875rem;
    height: 28px;
    border-radius: 7px;
    font-size: 0.8125rem;
    font-weight: 500;
    text-decoration: none;
    white-space: nowrap;
    cursor: pointer;
    color: var(--pb-text-muted, #a1a1aa);
    transition:
      background 0.12s,
      color 0.12s;
  }
  .table-tabs a:hover {
    background: var(--pb-nav-hover, rgba(255, 255, 255, 0.06));
    color: var(--pb-text-heading, #fafafa);
  }
  .table-tabs a.active {
    background: rgba(255, 255, 255, 0.1);
    color: #fafafa;
  }
`;
