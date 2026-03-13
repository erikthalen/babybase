import { css } from "../../tag.ts";

export const inputCss = css`
  input,
  textarea,
  select {
    border: 1px solid var(--pb-border-input, rgba(255, 255, 255, 0.12));
    border-radius: 6px;
    padding: 0.375rem 0.625rem;
    font-size: 0.8125rem;
    font-family: inherit;
    background: rgba(255, 255, 255, 0.04);
    color: #fafafa;
    outline: none;
    transition: border-color 0.12s;
  }
  input:focus,
  textarea:focus,
  select:focus {
    border-color: rgba(255, 255, 255, 0.25);
  }
  input::placeholder,
  textarea::placeholder {
    color: var(--pb-text-faint, #52525b);
  }
  select option {
    background: #18181b;
  }
`;
