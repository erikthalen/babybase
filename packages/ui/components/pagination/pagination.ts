import { html } from "hono/html";

export const paginationExample = {
  description:
    "Sticky bottom pagination bar with smart page number truncation. Themeable via --pb-* CSS custom properties.",

  preview: html`
    <div style="width:100%">
      <nav class="pagination">
        <button class="pagination-btn" disabled>&#8249; Previous</button>
        <span class="pagination-buttons">
          <button class="pagination-btn active">1</button>
          <button class="pagination-btn">2</button>
          <button class="pagination-btn">3</button>
          <span class="pagination-dots">···</span>
          <button class="pagination-btn">12</button>
        </span>
        <button class="pagination-btn">Next &#8250;</button>
      </nav>
    </div>
  `,

  markup: html`<nav class="pagination">
  <button class="pagination-btn" disabled>&#8249; Previous</button>
  <span class="pagination-buttons">
    <button class="pagination-btn active">1</button>
    <button class="pagination-btn">2</button>
    <button class="pagination-dots">···</span>
    <button class="pagination-btn">12</button>
  </span>
  <button class="pagination-btn">Next &#8250;</button>
</nav>`,
};
