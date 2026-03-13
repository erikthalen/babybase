import { html, raw } from "hono/html";

// Scroll-fade + popstate script for .table-tabs inside .table-tabs-wrap.
// Adds/removes fade-left and fade-right classes on the wrap as the user scrolls.
export const tableTabsScript = `(function () {
  var nav = document.querySelector(".table-tabs");
  var wrap = nav && nav.parentElement;
  if (!nav || !wrap) return;
  function update() {
    var sl = nav.scrollLeft;
    var max = nav.scrollWidth - nav.clientWidth;
    wrap.classList.toggle("fade-left", sl > 2);
    wrap.classList.toggle("fade-right", max > 2 && sl < max - 2);
  }
  nav.addEventListener("scroll", update);
  setTimeout(update, 50);
  window.addEventListener("popstate", function () {
    location.reload();
  });
})();`;

export const tableTabsExample = {
  description:
    "Scrollable tab bar for switching between tables. Fade indicators appear when tabs overflow. Requires tableTabsScript for scroll behavior.",

  preview: html`
    <style>
      .preview-bar {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 0.5rem;
        background: #09090b;
        border-radius: 12px;
      }
    </style>
    <div class="preview-bar">
      <div class="button-group">
        <a href="#" style="width:28px;height:28px;padding:0;justify-content:center;">←</a>
      </div>
      <div class="table-tabs-wrap" style="max-width:300px;">
        <nav class="table-tabs">
          <a href="#" class="active">users</a>
          <a href="#">orders</a>
          <a href="#">products</a>
          <a href="#">invoices</a>
          <a href="#">categories</a>
          <a href="#">tags</a>
        </nav>
      </div>
    </div>
    <script>${raw(tableTabsScript)}</script>`,

  markup: html`<div class="table-tabs-bar">
  <div class="button-group">
    <a href="/schema" aria-label="Back"><!-- back icon --></a>
  </div>
  <div class="table-tabs-wrap">
    <nav class="table-tabs">
      <a href="/tables/users" class="active">users</a>
      <a href="/tables/orders">orders</a>
    </nav>
  </div>
</div>`,

  usage: `import { tableTabsScript } from "@babybase/ui";
import { html, raw } from "hono/html";

// Inline the script after .table-tabs-bar in your markup:
html\`
  <div class="table-tabs-bar">...</div>
  <script>\${raw(tableTabsScript)}</script>
\``,
};
