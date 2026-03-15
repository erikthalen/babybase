import { html } from "hono/html";

export const badgeExample = {
  description:
    "Compact inline label for annotating database column types. Variants: default (plain), pk (primary key), fk (foreign key).",

  preview: html`
    <div style="display:flex;gap:0.75rem;align-items:center;flex-wrap:wrap;">
      <span class="badge">default</span>
      <span class="badge pk">pk</span>
      <span class="badge fk">fk</span>
      <span class="badge upload">upload</span>
      <span class="badge original">original</span>
      <span class="badge active">active</span>
      <span class="badge s3">S3</span>
    </div>`,

  markup: html`<span class="badge">default</span>
<span class="badge pk">pk</span>
<span class="badge fk">fk</span>
<span class="badge upload">upload</span>
<span class="badge original">original</span>
<span class="badge active">active</span>
<span class="badge s3">S3</span>`,
};
