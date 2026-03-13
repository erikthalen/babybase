import { logoMark, logoWordmark } from "../index.ts";

type IconFn = (size?: number) => unknown;

function iconPreview(fn: IconFn): string {
  const sizes = [14, 20, 32, 48];
  const swatches = sizes
    .map(
      (s) => `
      <div class="swatch">
        <div class="swatch-icon">${fn(s)}</div>
        <div class="swatch-label">${s}</div>
      </div>`,
    )
    .join("");
  return `
    <style>
      .icon-preview { display: flex; align-items: flex-end; gap: 2rem; }
      .swatch { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; }
      .swatch-icon { color: var(--text); display: flex; }
      .swatch-label { font-size: 11px; color: var(--text-faint); font-family: var(--font-mono); }
    </style>
    <div class="icon-preview">${swatches}</div>`;
}

export const previews: Record<string, string> = {
  "logo-mark": iconPreview(logoMark),
  "logo-wordmark": iconPreview(logoWordmark),
};
