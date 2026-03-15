import { css } from "../../tag.ts";

export const badgeCss = css`
.badge {
  display: inline-block;
  padding: 0.12rem 0.5rem;
  border-radius: 10px;
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  background: var(--pb-badge-bg, #a1a1aa);
  color: var(--pb-badge-fg, #27272a);
  user-select: none;
}
.badge.pk {
  background: var(--pb-badge-pk-bg, #faa087);
  color: var(--pb-badge-pk-fg, #522a09);
}
.badge.fk {
  background: var(--pb-badge-fk-bg, #4ade80);
  color: var(--pb-badge-fk-fg, #052e16);
}
.badge.upload {
  background: var(--pb-badge-pk-bg, #faa087);
  color: var(--pb-badge-pk-fg, #522a09);
}
.badge.original {
  background: var(--pb-badge-original-bg, rgba(139, 92, 246, 0.15));
  color: var(--pb-badge-original-fg, #a78bfa);
}
.badge.active {
  background: var(--pb-badge-active-bg, rgba(34, 197, 94, 0.12));
  color: var(--pb-badge-active-fg, #4ade80);
}
.badge.s3 {
  background: var(--pb-badge-s3-bg, rgba(56, 189, 248, 0.12));
  color: var(--pb-badge-s3-fg, #38bdf8);
}
`;
