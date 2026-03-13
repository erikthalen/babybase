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
  background: var(--pb-bg, #09090b);
  border-top: 1px solid var(--pb-border, #27272a);
}

.pagination-buttons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-width: 272px;
}

.pagination-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 2rem;
  min-width: 2rem;
  padding: 0 0.625rem;
  border-radius: 8px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--pb-text-muted, #a1a1aa);
  font-size: 0.8125rem;
  font-family: inherit;
  font-weight: 500;
  cursor: pointer;
  transition:
    background 0.12s,
    color 0.12s,
    border-color 0.12s;
  white-space: nowrap;
}
.pagination-btn:not([disabled]):not(.active):hover {
  color: var(--pb-text-heading, #fafafa);
  background: var(--pb-nav-hover, #18181b);
}
.pagination-btn.active {
  border-color: var(--pb-border, #27272a);
  color: #fafafa;
  pointer-events: none;
}
.pagination-btn[disabled] {
  opacity: 0.3;
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
