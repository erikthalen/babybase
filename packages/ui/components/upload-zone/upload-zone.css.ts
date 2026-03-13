import { css } from "../../tag.ts";

export const uploadZoneCss = css`
  .upload-zone {
    border: 2px dashed var(--pb-border, #27272a);
    border-radius: 8px;
    padding: 2.5rem 1rem;
    text-align: center;
    width: 100%;
    max-width: 400px;
    cursor: pointer;
    color: var(--pb-text-muted, #a1a1aa);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    margin-inline: auto;
    margin-top: 2rem;
    user-select: none;
    transition:
      border-color 0.15s,
      background-color 0.15s;
  }
  .upload-zone:hover,
  .upload-zone.drag-over {
    border-color: var(--pb-text-muted, #a1a1aa);
    background-color: var(--pb-bg, #09090b);
  }
  .upload-zone.uploading {
    opacity: 0.6;
    cursor: wait;
    pointer-events: none;
  }
  .upload-zone-title {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--pb-text, #fafafa);
  }
  .upload-zone-subtitle {
    font-size: 0.8rem;
  }
`;
