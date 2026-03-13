import { css } from "../../tag.ts";

export const checkboxCss = css`
input[type="checkbox"] {
  appearance: none;
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  min-width: 16px;
  border-radius: 4px;
  border: 1px solid var(--pb-border-input, rgba(255, 255, 255, 0.12));
  background: rgba(255, 255, 255, 0.04);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition:
    background 0.12s,
    border-color 0.12s;
}
input[type="checkbox"]:checked {
  background: var(--pb-primary, #fafafa);
  border-color: var(--pb-primary, #fafafa);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2309090b' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M5 12l5 5L20 7'/%3E%3C/svg%3E");
  background-size: 10px 10px;
  background-repeat: no-repeat;
  background-position: center;
}
input[type="checkbox"]:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.35);
}
`;
