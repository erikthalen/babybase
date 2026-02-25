import { html, raw } from 'hono/html'

interface LayoutProps {
  title: string
  nav: string
  content: string
}

export function layout({ title, nav: navHtml, content }: LayoutProps): string {
  return String(html`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — Picobase</title>
  <script type="module" src="https://cdn.jsdelivr.net/gh/starfederation/datastar@v1/bundles/datastar.js"></script>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, sans-serif; display: flex; min-height: 100vh; background: #f9f9f9; }
    aside { width: 220px; background: #111827; color: #e5e7eb; padding: 1rem; flex-shrink: 0; display: flex; flex-direction: column; gap: 0.25rem; }
    aside h1 { font-size: 1rem; font-weight: 700; color: #fff; padding: 0.5rem; margin-bottom: 0.5rem; }
    aside a { display: block; padding: 0.4rem 0.75rem; color: #9ca3af; text-decoration: none; border-radius: 6px; font-size: 0.875rem; }
    aside a:hover, aside a.active { background: rgba(255,255,255,0.1); color: #fff; }
    main { flex: 1; padding: 2rem; overflow: auto; }
    h2 { font-size: 1.25rem; font-weight: 600; margin-bottom: 1rem; }
    table { border-collapse: collapse; width: 100%; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    th, td { border-bottom: 1px solid #e5e7eb; padding: 0.5rem 0.75rem; text-align: left; font-size: 0.875rem; }
    th { background: #f3f4f6; font-weight: 600; color: #374151; }
    tr:last-child td { border-bottom: none; }
    button { cursor: pointer; padding: 0.35rem 0.85rem; border: 1px solid #d1d5db; border-radius: 6px; background: white; font-size: 0.8rem; }
    button.primary { background: #111827; color: white; border-color: #111827; }
    button.danger { background: #ef4444; color: white; border-color: #ef4444; }
    input, textarea, select { border: 1px solid #d1d5db; border-radius: 6px; padding: 0.35rem 0.6rem; font-size: 0.875rem; font-family: inherit; width: 100%; }
    .badge { display: inline-block; padding: 0.1rem 0.4rem; border-radius: 4px; font-size: 0.7rem; font-weight: 600; background: #e0e7ff; color: #3730a3; }
    .badge.pk { background: #fef3c7; color: #92400e; }
    .badge.fk { background: #d1fae5; color: #065f46; }
  </style>
</head>
<body>
  <aside>${raw(navHtml)}</aside>
  <main id="main">${raw(content)}</main>
</body>
</html>`)
}

interface NavProps {
  basePath: string
  activeSection: 'tables' | 'schema' | 'migrations' | 'backups'
  tables?: string[]
}

export function nav({ basePath, activeSection, tables = [] }: NavProps): string {
  const base = basePath.replace(/\/$/, '')
  const link = (path: string, label: string, section: string) =>
    `<a href="${base}${path}" data-on:click="@get('${base}${path}')"${activeSection === section ? ' class="active"' : ''}>${label}</a>`

  const tableLinks = tables
    .map((t) => `<a href="${base}/tables/${t}" data-on:click="@get('${base}/tables/${t}')">${t}</a>`)
    .join('\n')

  return String(html`<h1>Picobase</h1>
${raw(link('/tables', 'Tables', 'tables'))}
${raw(link('/schema', 'Schema', 'schema'))}
${raw(link('/migrations', 'Migrations', 'migrations'))}
${raw(link('/backups', 'Backups', 'backups'))}
${tables.length > 0 ? raw(`<hr style="border-color:#374151;margin:0.5rem 0"><small style="padding:0.25rem 0.75rem;color:#6b7280;font-size:0.75rem">Tables</small>${tableLinks}`) : ''}`)
}
