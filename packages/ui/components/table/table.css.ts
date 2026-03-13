import { css } from "../../tag.ts";

export const tableCss = css`
table {
  --cols: 1;
  background: var(--pb-surface, #111113);

  display: grid;
  grid-template-columns: repeat(var(--cols), minmax(0, auto));
  min-width: 100%;
  width: max-content;

  border-radius: 12px 12px 0 0;
  user-select: text;
}

table.even {
  grid-template-columns: repeat(var(--cols), minmax(0, 1fr));
}

table:has(th:nth-child(2))  { --cols: 2; }
table:has(th:nth-child(3))  { --cols: 3; }
table:has(th:nth-child(4))  { --cols: 4; }
table:has(th:nth-child(5))  { --cols: 5; }
table:has(th:nth-child(6))  { --cols: 6; }
table:has(th:nth-child(7))  { --cols: 7; }
table:has(th:nth-child(8))  { --cols: 8; }
table:has(th:nth-child(9))  { --cols: 9; }
table:has(th:nth-child(10)) { --cols: 10; }
table:has(th:nth-child(11)) { --cols: 11; }
table:has(th:nth-child(12)) { --cols: 12; }
table:has(th:nth-child(13)) { --cols: 13; }
table:has(th:nth-child(14)) { --cols: 14; }
table:has(th:nth-child(15)) { --cols: 15; }
table:has(th:nth-child(16)) { --cols: 16; }
table:has(th:nth-child(17)) { --cols: 17; }
table:has(th:nth-child(18)) { --cols: 18; }
table:has(th:nth-child(19)) { --cols: 19; }
table:has(th:nth-child(20)) { --cols: 20; }

thead,
tbody,
tr {
  display: contents;
}

th,
td {
  border-bottom: 1px solid var(--pb-border, #27272a);
  padding: 0.625rem 0.875rem;
  text-align: left;
  font-size: 0.8125rem;

  display: flex;
  align-items: center;
}

th {
  background: var(--pb-th-bg, #27272c);
  font-weight: 500;
  color: var(--pb-text-muted, #a1a1aa);
  font-size: 0.6875rem;
  letter-spacing: 0.06em;

  position: sticky;
  top: 0;
  gap: 0.25rem;
}

th:first-child {
  border-radius: 12px 0 0 0;
}

th:last-child {
  border-radius: 0 12px 0 0;
}

tr:last-child td {
  border-bottom: none;
}

tbody tr:hover td {
  background: rgba(255, 255, 255, 0.02);
}
`;
