function block(code: string): string {
  return `<pre class="code-block"><code class="language-ts">${code}</code></pre>`;
}

export const gettingStartedPage = `
  <style>
    .gs-page {
      max-width: 640px;
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 2.5rem;
      padding: 3rem 2rem;
    }
    .gs-page h1 {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text);
    }
    .gs-page h2 {
      font-size: 0.8rem;
      font-weight: 600;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--text-faint);
      margin-bottom: 0.75rem;
    }
    .gs-page p {
      color: var(--text-muted);
      line-height: 1.7;
      font-size: 0.9rem;
    }
    .gs-page .step {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
  </style>

  <div class="gs-page">
    <h1>Getting started</h1>

    <div class="step">
      <h2>1. Install</h2>
      ${block(`pnpm add @babybase/ui`)}
    </div>

    <div class="step">
      <h2>2. Add the stylesheet</h2>
      <p>Import the full CSS bundle once at the top level of your project and inject it into your page. All components share this one stylesheet — you don't need to import anything per component.</p>
      ${block(`import { css } from "@babybase/ui";

// In your HTML shell:
// &lt;style&gt;\${css}&lt;/style&gt;`)}
    </div>

    <div class="step">
      <h2>3. Copy the markup</h2>
      <p>Each component page has a <strong style="color:var(--text)">Markup</strong> section with the minimal HTML needed. Copy it into your template and it will pick up the styles automatically.</p>
    </div>
  </div>`;
