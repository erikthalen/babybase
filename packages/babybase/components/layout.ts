import { html, raw } from "hono/html";
import {
  css as uiCss,
  iconNavMigrations,
  iconNavSchema,
  iconNavStorage,
  iconX,
  logoMark,
  logoWordmark,
} from "@babybase/ui";
import { type HtmlEscapedString } from "hono/utils/html";

interface LayoutProps {
  title: string;
  nav: HtmlEscapedString | Promise<HtmlEscapedString>;
  content: HtmlEscapedString | Promise<HtmlEscapedString>;
  toasts?: HtmlEscapedString | Promise<HtmlEscapedString>;
}

export function layout({ title, nav: navHtml, content, toasts }: LayoutProps) {
  return html`<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${title} — Babybase</title>
        <link
          rel="icon"
          type="image/svg+xml"
          href="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNzAgMTcwIj48cGF0aCBkPSJNODUgMEMxMDguODM5IDEuMDQyMDJlLTA2IDEzMC4zODUgOS44MTM2MiAxNDUuODIgMjUuNjIxMUMxNDYuMjk1IDI2LjEwNzcgMTQ2Ljc2NSAyNi41OTk4IDE0Ny4yMjkgMjcuMDk3N0MxNjEuMTI2IDQyLjAyNjQgMTY5LjcxNSA2MS45NjI0IDE2OS45OTMgODMuOTAxNEMxNjkuOTk4IDg0LjI2NyAxNzAgODQuNjMzMiAxNzAgODVDMTcwIDEzMS45NDQgMTMxLjk0NCAxNzAgODUgMTcwSDBWODVDMi4wNTJlLTA2IDM4LjA1NTggMzguMDU1OCAtMi4wNTJlLTA2IDg1IDBaIiBmaWxsPSJ3aGl0ZSIvPjwvc3ZnPg=="
          media="(prefers-color-scheme: dark)"
        />
        <link
          rel="icon"
          type="image/svg+xml"
          href="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNzAgMTcwIj48cGF0aCBkPSJNODUgMEMxMDguODM5IDEuMDQyMDJlLTA2IDEzMC4zODUgOS44MTM2MiAxNDUuODIgMjUuNjIxMUMxNDYuMjk1IDI2LjEwNzcgMTQ2Ljc2NSAyNi41OTk4IDE0Ny4yMjkgMjcuMDk3N0MxNjEuMTI2IDQyLjAyNjQgMTY5LjcxNSA2MS45NjI0IDE2OS45OTMgODMuOTAxNEMxNjkuOTk4IDg0LjI2NyAxNzAgODQuNjMzMiAxNzAgODVDMTcwIDEzMS45NDQgMTMxLjk0NCAxNzAgODUgMTcwSDBWODVDMi4wNTJlLTA2IDM4LjA1NTggMzguMDU1OCAtMi4wNTJlLTA2IDg1IDBaIiBmaWxsPSJibGFjayIvPjwvc3ZnPg=="
          media="(prefers-color-scheme: light)"
        />

        <link
          rel="stylesheet"
          href="https://esm.sh/gh/erikthalen/jazz@v0.1.0-beta.18/jazz.css"
        />

        <script
          type="module"
          src="https://cdn.jsdelivr.net/gh/starfederation/datastar@v1.0.0-RC.8/bundles/datastar.js"
        ></script>
        <style>
          ${raw(uiCss)}
        </style>
        <style>
          :root {
            --pb-sans-serif: system-ui, sans-serif;
            --pb-monospace: system-mono, monospace;

            --jazz-primary: light-dark(#111, #fefefe);

            --pb-text-muted: #8a8a93;
            --pb-text-faint: #5e5e5e;
            --pb-text-heading: #e4e4e7;

            --pb-primary: #fafafa;
            --pb-primary-fg: #09090b;

            --pb-danger: #ef4444;
            --pb-danger-fg: white;

            --pb-badge-bg: #a1a1aa;
            --pb-badge-fg: #27272a;
            --pb-badge-pk-bg: #faa087;
            --pb-badge-pk-fg: #522a09;
            --pb-badge-fk-bg: #4ade80;
            --pb-badge-fk-fg: #052e16;

            --pb-diagram-header: #0e0e0e;
            --pb-diagram-title: #dcdcdc;
            --pb-diagram-relation: #535353;
            --pb-diagram-row-alt: #1b1b1b;

            --pb-syntax-bg: #1a1a1f;
            --pb-syntax-keyword: #4ec9b0;
            --pb-syntax-string: #9cdcfe;
            --pb-syntax-comment: #6a9955;
            --pb-syntax-number: #b5cea8;
          }

          @view-transition {
            navigation: auto;
          }

          /* Create a custom animation */
          @keyframes move-out {
            from {
              transform: translateY(0%);
            }

            to {
              opacity: 0;
              transform: translateY(-0px);
            }
          }

          @keyframes move-in {
            from {
              opacity: 0;
              transform: translateY(0px);
            }

            to {
              transform: translateY(0%);
            }
          }

          /* Apply the custom animation to the old and new page states */
          ::view-transition-old(root) {
            animation: 0.15s ease-out both move-out;
          }

          ::view-transition-new(root) {
            animation: 0.15s ease-out both move-in;
          }

          body {
            min-height: 100vh;
            user-select: none;
          }

          .site-logo {
            position: fixed;
            top: 0;
            left: 0;
            z-index: 100;
            padding: 0.75rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            view-transition-name: site-logo;
          }

          .floating-nav {
            position: fixed;
            bottom: 1.5rem;
            left: 50%;
            transform: translateX(-50%);
            z-index: 100;
          }

          .floating-nav a {
            background: var(--jazz-neutral-50);
          }

          .floating-nav a.active {
            background: var(--jazz-neutral-100);
          }

          @keyframes nav-link-in {
            from {
              opacity: 0;
              transform: translateX(20px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          @keyframes nav-link-out {
            from {
              opacity: 1;
              transform: translateX(0);
            }
            to {
              opacity: 0;
              transform: translateX(20px);
            }
          }

          ::view-transition-new(nav-schema),
          ::view-transition-new(nav-migrations) {
            animation: nav-link-in 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          }

          ::view-transition-old(nav-schema),
          ::view-transition-old(nav-migrations) {
            animation: nav-link-out 0.2s ease;
          }

          main {
            width: 100%;
            overflow: auto;
            max-height: 100vh;

            display: flex;
            flex-direction: column;
          }

          dialog:focus {
            outline: none;
          }

          .text-muted {
            color: var(--pb-text-muted);
          }

          .text-faint {
            color: var(--pb-text-faint);
          }

          @keyframes fade-in {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
          @keyframes fade-out {
            from {
              opacity: 1;
            }
            to {
              opacity: 0;
            }
          }

          ::view-transition-old(button-group-1) {
            animation: fade-out 200ms ease;
          }

          ::view-transition-new(button-group-1) {
            animation: fade-in 200ms ease;
          }

          ::view-transition-old(button-group-1),
          ::view-transition-new(button-group-1) {
            width: 100%;
            height: 100%;
            overflow: hidden;
            object-fit: none;
          }
          }
        </style>
      </head>
      <body>
        ${navHtml}

        <main id="main">${content}</main>

        <div id="toast-container">
          <button
            id="toast-clear-all"
            onclick="document.querySelectorAll('#toast-container .toast').forEach(t=>t.remove())"
            aria-label="Clear all notifications"
          >
            Clear all
          </button>
          ${raw(toasts ?? "")}
        </div>
      </body>
    </html>`;
}

interface NavProps {
  basePath: string;
  activeSection: "schema" | "migrations" | "storage";
  tables?: string[];
  hasDatabase?: boolean;
  readonly?: boolean;
}

export function nav({
  basePath,
  activeSection,
  hasDatabase = true,
  readonly = false,
}: NavProps) {
  const base = basePath.replace(/\/$/, "");

  const link = (
    path: string,
    label: string,
    section: string,
    icon: string,
    vtName?: string,
  ) => {
    const active = activeSection === section ? "active" : "";

    return html`<a
      href="${base}${path}"
      class="button ghost ${active ? "active" : ""}"
      ${vtName ? `style="view-transition-name: ${vtName}"` : ""}
    >
      ${icon} ${label}
    </a>`;
  };

  return html`
    <div class="site-logo">${logoMark(12)} ${logoWordmark(14)}</div>

    <nav
      id="floating-nav"
      class="floating-nav"
      style="view-transition-name: floating-nav"
    >
      <fieldset role="group">
        ${hasDatabase
          ? link("/schema", "Schema", "schema", iconNavSchema())
          : ""}
        ${hasDatabase && !readonly
          ? link("/migrations", "Migrations", "migrations", iconNavMigrations())
          : ""}
        ${link("/storage", "Storage", "storage", iconNavStorage())}
      </fieldset>
    </nav>
  `;
}

export function navElement(props: NavProps) {
  // Returns just the <nav id="floating-nav"> element for SSE patching
  const base = props.basePath.replace(/\/$/, "");
  const activeSection = props.activeSection;
  const hasDatabase = props.hasDatabase ?? true;

  const link = (
    path: string,
    label: string,
    section: string,
    icon: string,
    vtName?: string,
  ) => {
    const active = activeSection === section ? "active" : "";

    return html`<a
      href="${base}${path}"
      class="button ${active ? "active" : ""}"
      ${vtName ? ` style="view-transition-name: ${vtName}"` : ""}
    >
      ${icon} ${label}
    </a>`;
  };

  const schemaIcon = iconNavSchema();
  const migrationsIcon = iconNavMigrations();
  const storageIcon = iconNavStorage();

  const readonly = props.readonly ?? false;
  const schemaLink = hasDatabase
    ? link("/schema", "Schema", "schema", schemaIcon, "nav-schema")
    : "";
  const migrationsLink =
    hasDatabase && !readonly
      ? link(
          "/migrations",
          "Migrations",
          "migrations",
          migrationsIcon,
          "nav-migrations",
        )
      : "";
  const storageLink = link("/storage", "Storage", "storage", storageIcon);

  return html`<nav id="floating-nav" class="button-group floating-nav">
    ${schemaLink}${migrationsLink}${storageLink}
  </nav>`;
}

export function toastHtml(
  title: string,
  body: HtmlEscapedString | Promise<HtmlEscapedString>,
  variant?: "error",
) {
  const cls = variant === "error" ? " toast-error" : "";
  return html`<div class="toast${cls}" role="alert">
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-body">${body}</div>
    </div>
    <button
      class="toast-dismiss"
      onclick="this.closest('.toast').remove()"
      aria-label="Dismiss"
    >
      ${iconX(14)}
    </button>
  </div>`;
}
