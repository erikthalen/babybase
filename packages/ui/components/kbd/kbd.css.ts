import { css } from "../../tag.ts";

export const kbdCss = css`
kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--pb-surface, #111113);
  border: 1px solid var(--pb-border, #27272a);
  border-radius: 4px;
  padding: 0.1rem 0.35rem;
  font-size: 0.7rem;
  font-family: inherit;
  color: var(--pb-text-muted, #a1a1aa);
  box-shadow: 0 1px 0 var(--pb-border, #27272a);
  line-height: 1.4;
}
`;
