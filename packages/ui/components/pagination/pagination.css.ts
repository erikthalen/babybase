import { css } from "../../tag.ts";

export const paginationCss = css`
  .pagination {
    user-select: none;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.625rem 1rem;
    position: sticky;
    bottom: 0;
  }

  .pagination-buttons {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    min-width: 272px;
  }

  .pagination-btn {
    cursor: pointer;
    transition:
      background 0.12s,
      color 0.12s,
      border-color 0.12s;
    white-space: nowrap;
  }
  .pagination-btn:not([disabled]):not(.active):hover {
  }
  .pagination-btn.active {
    pointer-events: none;
  }

  .pagination-dots {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    color: var(--pb-text-muted, #a1a1aa);
    font-size: 0.875rem;
    letter-spacing: 0.1em;
    user-select: none;
  }
`;
