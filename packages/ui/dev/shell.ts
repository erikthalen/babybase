import { css } from "../index.ts";

// Sidebar nav — individual entries for real components, single entry for icons.
const NAV: { group: string; items: { label: string; href: string }[] }[] = [
  {
    group: "",
    items: [{ label: "getting started", href: "/getting-started" }],
  },
  {
    group: "Components",
    items: [
      { label: "active-db-indicator", href: "/components/active-db-indicator" },
      { label: "badge", href: "/components/badge" },
      { label: "button", href: "/components/button" },
      { label: "confirm-dialog", href: "/components/confirm-dialog" },
      { label: "button-group", href: "/components/button-group" },
      { label: "checkbox", href: "/components/checkbox" },
      { label: "dropdown", href: "/components/dropdown" },
      { label: "empty-state", href: "/components/empty-state" },
      { label: "input", href: "/components/input" },
      { label: "kbd", href: "/components/kbd" },
      { label: "sql-highlight", href: "/components/sql-highlight" },
      { label: "table-tabs", href: "/components/table-tabs" },
      { label: "upload-zone", href: "/components/upload-zone" },
      { label: "pagination", href: "/components/pagination" },
      { label: "table", href: "/components/table" },
      { label: "toast", href: "/components/toast" },
      { label: "tooltip", href: "/components/tooltip" },
    ],
  },
  {
    group: "Logos",
    items: [
      { label: "logo-mark", href: "/components/logo-mark" },
      { label: "logo-wordmark", href: "/components/logo-wordmark" },
    ],
  },
  {
    group: "Primitives",
    items: [{ label: "icons", href: "/icons" }],
  },
];

function navHtml(active: string): string {
  return NAV.map(({ group, items }) => {
    const links = items
      .map(({ label, href }) => {
        const cls = active === label ? " active" : "";
        return `<a href="${href}" class="nav-item${cls}">${label}</a>`;
      })
      .join("");
    return `<div class="nav-group"><div class="nav-group-label">${group}</div>${links}</div>`;
  }).join("");
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function componentPage(
  active: string,
  example: { description?: string; preview: { toString(): string }; markup: { toString(): string }; usage?: string },
): string {
  const markup = String(example.markup).trim();
  const usageBlock = example.usage
    ? `
      <div class="component-block">
        <div class="block-header">
          <span class="block-label">Usage</span>
          <button class="copy-btn" onclick="
            navigator.clipboard.writeText(this.dataset.code);
            this.textContent = 'Copied!';
            setTimeout(() => this.textContent = 'Copy', 1500);
          " data-code="${escapeHtml(example.usage)}">Copy</button>
        </div>
        <pre class="code-block"><code class="language-typescript">${escapeHtml(example.usage)}</code></pre>
      </div>`
    : "";
  const content = `
    <div class="component-page">
      <div class="component-header">
        <h1 class="component-title">${active}</h1>
        ${example.description ? `<p class="component-description">${example.description}</p>` : ""}
      </div>

      <div class="component-block">
        <div class="block-header">
          <span class="block-label">Preview</span>
        </div>
        <div class="component-preview">
          ${example.preview}
        </div>
      </div>

      <div class="component-block">
        <div class="block-header">
          <span class="block-label">Markup</span>
          <button class="copy-btn" onclick="
            navigator.clipboard.writeText(this.dataset.code);
            this.textContent = 'Copied!';
            setTimeout(() => this.textContent = 'Copy', 1500);
          " data-code="${escapeHtml(markup)}">Copy</button>
        </div>
        <pre class="code-block"><code class="language-html">${escapeHtml(markup)}</code></pre>
      </div>
      ${usageBlock}
    </div>`;
  return shell(active, content);
}

export function shell(active: string, content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${active} — UI</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/prism-themes@1/themes/prism-vsc-dark-plus.min.css" />
  <script src="https://cdn.jsdelivr.net/npm/prismjs@1/prism.min.js" defer></script>
  <script src="https://cdn.jsdelivr.net/npm/prismjs@1/components/prism-markup.min.js" defer></script>
  <script src="https://cdn.jsdelivr.net/npm/prismjs@1/components/prism-javascript.min.js" defer></script>
  <script src="https://cdn.jsdelivr.net/npm/prismjs@1/components/prism-typescript.min.js" defer></script>
  <style>${css}</style>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg: #09090b;
      --surface: #111113;
      --surface-raised: #18181b;
      --border: #27272a;
      --border-subtle: #1f1f22;
      --text: #fafafa;
      --text-muted: #a1a1aa;
      --text-faint: #52525b;
      --accent: #a78bfa;
      --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      --font-mono: "Berkeley Mono", "Fira Code", ui-monospace, monospace;
      --radius: 8px;
    }

    body {
      display: grid;
      grid-template-columns: 1fr 220px;
      height: 100vh;
      background: var(--bg);
      color: var(--text);
      font-family: var(--font-sans);
      font-size: 14px;
    }

    /* ── Main content ──────────────────────────────── */
    .preview {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 3rem;
      overflow: auto;
    }

    /* ── Sidebar ───────────────────────────────────── */
    .sidebar {
      border-left: 1px solid var(--border);
      overflow-y: auto;
      padding: 1.5rem 0.75rem;
    }

    .sidebar-title {
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--text-faint);
      padding: 0 0.5rem 1rem;
    }

    .nav-group {
      margin-bottom: 1rem;
    }

    .nav-group-label {
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--text-faint);
      padding: 0 0.5rem 0.35rem;
    }

    .nav-item {
      display: block;
      padding: 0.3rem 0.5rem;
      border-radius: 5px;
      color: var(--text-muted);
      text-decoration: none;
      font-size: 13px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .nav-item:hover { color: var(--text); background: var(--surface-raised); }

    .nav-item.active { color: var(--text); background: var(--surface-raised); }

    /* ── Component page ────────────────────────────── */
    .preview:has(.component-page) {
      align-items: flex-start;
      justify-content: center;
      padding: 3rem;
    }

    .component-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      width: 100%;
      max-width: 860px;
    }

    .component-header {
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    .component-title {
      font-size: 1.75rem;
      font-weight: 600;
      letter-spacing: -0.02em;
      color: var(--text);
    }

    .component-description {
      font-size: 0.875rem;
      color: var(--text-muted);
      line-height: 1.6;
    }

    .component-block {
      border: 1px solid var(--border);
      border-radius: var(--radius);
    }

    .block-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.6rem 1rem;
      border-bottom: 1px solid var(--border);
      background: var(--surface);
    }

    .block-label {
      font-size: 12px;
      font-weight: 500;
      color: var(--text-muted);
    }

    .component-preview {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 4rem 2rem;
      min-height: 180px;
      background-image: radial-gradient(var(--border-subtle) 1px, transparent 1px);
      background-size: 20px 20px;
    }

    .code-block {
      margin: 0 !important;
      border-radius: 0 !important;
      background: var(--surface) !important;
      padding: 1.25rem 1.5rem !important;
      font-size: 13px;
      font-family: var(--font-mono);
      overflow-x: auto;
    }

    .copy-btn {
      font-size: 11px;
      font-family: var(--font-sans);
      padding: 0.2rem 0.6rem;
      border-radius: 5px;
      border: 1px solid var(--border);
      background: transparent;
      color: var(--text-muted);
      cursor: pointer;
      transition: color 0.1s, border-color 0.1s;
    }
    .copy-btn:hover { color: var(--text); border-color: var(--text-faint); }
  </style>
</head>
<body>
  <main class="preview">${content}</main>
  <nav class="sidebar">
    <div class="sidebar-title">UI Library</div>
    ${navHtml(active)}
  </nav>
</body>
</html>`;
}
