import { css } from "../../tag.ts";

export const sqlHighlightCss = css`
  .sql-keyword {
    color: var(--pb-syntax-keyword, #4ec9b0);
  }
  .sql-string {
    color: var(--pb-syntax-string, #9cdcfe);
  }
  .sql-comment {
    color: var(--pb-syntax-comment, #6a9955);
    font-style: italic;
  }
  .sql-number {
    color: var(--pb-syntax-number, #b5cea8);
  }
`;
