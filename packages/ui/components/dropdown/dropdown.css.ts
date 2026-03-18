import { css } from "../../tag.ts";

export const dropdownCss = css`
  .dropdown {
    position: relative;
    flex-shrink: 0;
  }

  .dropdown summary {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.35rem 0.6rem;
    border: 1px solid var(--pb-border, #27272a);
    border-radius: 6px;
    font-size: 0.85rem;
    cursor: pointer;
    user-select: none;
    color: var(--pb-text-muted, #a1a1aa);
    background: var(--pb-surface, #111113);
    list-style: none;
  }

  .dropdown summary::-webkit-details-marker {
    display: none;
  }

  .dropdown summary:hover {
    background: var(--pb-surface-raised, #18181b);
    color: var(--pb-text, #fafafa);
  }

  .dropdown-panel {
    position: absolute;
    top: calc(100% + 4px);
    right: 0;
    background: var(--pb-surface, #111113);
    border: 1px solid var(--pb-border, #27272a);
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
    padding: 0.4rem;
    min-width: 160px;
    z-index: 100;
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
  }

  .dropdown-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.3rem 0.5rem;
    border-radius: 4px;
    font-size: 0.85rem;
    cursor: pointer;
    color: var(--pb-text, #fafafa);
    border: none;
    justify-content: start;
  }

  .dropdown-item:hover {
    background: var(--pb-surface-raised, #18181b);
  }

  .dropdown-item input[type="checkbox"] {
    margin: 0;
    cursor: pointer;
  }
`;
