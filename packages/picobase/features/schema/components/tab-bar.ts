import { html } from "hono/html";

export function tabBar() {
  return html`
    <nav id="table-tabs" class="tab-bar">
      <a href="/schema">Schema</a>
      <a href="/schema/diagram">ER Diagram</a>
    </nav>
  `;
}
