import { html } from "hono/html";

export const inputExample = {
  description:
    "Base styles for input, textarea, and select elements. Applied globally to all native form controls.",

  preview: html`
    <div style="display:flex;flex-direction:column;gap:1rem;width:280px;">
      <input type="text" placeholder="Text input" />
      <input type="text" value="Filled input" />
      <select>
        <option>Option one</option>
        <option>Option two</option>
        <option>Option three</option>
      </select>
      <textarea placeholder="Textarea" rows="3"></textarea>
    </div>`,

  markup: html`<input type="text" placeholder="Text input" />
<select>
  <option>Option one</option>
  <option>Option two</option>
</select>
<textarea placeholder="Textarea" rows="3"></textarea>`,
};
