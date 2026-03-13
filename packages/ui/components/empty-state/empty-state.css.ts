import { css } from "../../tag.ts";

export const emptyStateCss = css`
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5rem 2rem;
  text-align: center;
  gap: 0.75rem;
}

.empty-state-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--pb-text-faint, #52525b);
  margin-bottom: 0.5rem;
}

.empty-state-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
}

.empty-state-body {
  font-size: 0.875rem;
  color: var(--pb-text-muted, #a1a1aa);
  max-width: 300px;
  margin: 0 0 0.5rem;
  line-height: 1.5;
}
`;
