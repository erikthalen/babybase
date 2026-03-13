import { html } from "hono/html";

export const tableExample = {
  description:
    "CSS grid-based table that auto-detects column count via :has(). Rows and cells use display:contents so the grid spans seamlessly across thead and tbody. Add .even to distribute columns equally.",

  preview: html`
    <div style="width:100%;overflow:auto;">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Nullable</th>
            <th>Default</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>id</td>
            <td>INTEGER</td>
            <td>NO</td>
            <td>—</td>
          </tr>
          <tr>
            <td>email</td>
            <td>TEXT</td>
            <td>NO</td>
            <td>—</td>
          </tr>
          <tr>
            <td>created_at</td>
            <td>TEXT</td>
            <td>YES</td>
            <td>CURRENT_TIMESTAMP</td>
          </tr>
        </tbody>
      </table>
    </div>`,

  markup: html`<table>
  <thead>
    <tr>
      <th>Column</th>
      <th>Type</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>value</td>
      <td>TEXT</td>
    </tr>
  </tbody>
</table>`,
};
