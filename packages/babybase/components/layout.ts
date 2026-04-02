import { html, raw } from "hono/html";
import {
  iconNavMigrations,
  iconNavSchema,
  iconNavStorage,
  iconX,
  logoMark,
  logoWordmark,
} from "./icons.ts";
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
          href="https://esm.sh/gh/erikthalen/jazz@v0.1.0-beta.20/jazz.css"
        />

        <script
          type="module"
          src="https://cdn.jsdelivr.net/gh/starfederation/datastar@v1.0.0-RC.8/bundles/datastar.js"
        ></script>
        <style>
          /* active-db-indicator */
          .active-db-indicator {
            color: var(--jazz-neutral-400);
          }
          .active-db-dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: #22c55e;
            flex-shrink: 0;
          }
          .active-db-dot--none {
            background: var(--jazz-neutral-400);
          }
          .active-db-name {
            font-family: var(--pb-monospace, ui-monospace, monospace);
          }

          /* badge variants (base .badge is Jazz) */
          .badge.pk {
            background: #faa087;
            color: #522a09;
          }
          .badge.fk {
            background: var(--jazz-constructive-300);
            color: var(--jazz-constructive-900);
          }
          .badge.upload {
            background: #faa087;
            color: #522a09;
          }
          .badge.original {
            background: rgba(139, 92, 246, 0.15);
            color: #a78bfa;
          }
          .badge.active {
            background: rgba(34, 197, 94, 0.12);
            color: #4ade80;
          }
          .badge.s3 {
            background: rgba(56, 189, 248, 0.12);
            color: #38bdf8;
          }

          /* pagination */
          .pagination {
            user-select: none;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            padding: 0.625rem 1rem;
            position: sticky;
            bottom: 0;
          }
          .pagination-buttons {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            min-width: 272px;
          }
          .pagination-btn {
            cursor: pointer;
            transition:
              background 0.12s,
              color 0.12s,
              border-color 0.12s;
            white-space: nowrap;
          }
          .pagination-btn.active {
            pointer-events: none;
          }
          .pagination-dots {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 2rem;
            height: 2rem;
            color: var(--jazz-neutral-500);
            font-size: 0.875rem;
            letter-spacing: 0.1em;
            user-select: none;
          }

          /* sql syntax highlight */
          .sql-keyword {
            color: #4ec9b0;
          }
          .sql-string {
            color: #9cdcfe;
          }
          .sql-comment {
            color: #6a9955;
            font-style: italic;
          }
          .sql-number {
            color: #b5cea8;
          }

          /* toast */
          #toast-container {
            position: fixed;
            top: 1rem;
            right: 1rem;
            z-index: 200;
            pointer-events: none;
            display: grid;
            width: 320px;
          }
          @keyframes toast-in {
            from {
              opacity: 0;
              transform: translateY(0.5rem);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .toast {
            grid-row: 1;
            grid-column: 1;
            align-self: start;
            width: 100%;
            background: var(--jazz-neutral-0, #111113);
            border: 1px solid var(--jazz-neutral-200, #27272a);
            border-radius: 8px;
            padding: 0.875rem 1rem;
            display: flex;
            align-items: flex-start;
            gap: 0.75rem;
            pointer-events: none;
            animation: toast-in 0.25s cubic-bezier(0.16, 1, 0.3, 1);
            transition:
              transform 0.35s cubic-bezier(0.16, 1, 0.3, 1),
              opacity 0.25s ease;
          }
          .toast:first-child {
            pointer-events: all;
            z-index: 3;
          }
          .toast:nth-child(2) {
            z-index: 2;
            transform: translateY(-4px);
          }
          .toast:nth-child(3) {
            z-index: 1;
            transform: translateY(-8px);
          }
          .toast:nth-child(n + 4) {
            z-index: 0;
            transform: translateY(-12px);
            opacity: 0;
            pointer-events: none;
          }
          .toast-content {
            flex: 1;
            min-width: 0;
          }
          .toast-title {
            font-size: 0.875rem;
            font-weight: 600;
            margin-bottom: 0.2rem;
          }
          .toast-body {
            font-size: 0.8rem;
            color: var(--jazz-neutral-500, #a1a1aa);
            line-height: 1.4;
            white-space: pre-line;
            word-break: break-all;
          }
          .toast-dismiss {
            flex-shrink: 0;
            height: 20px;
            width: 20px;
            min-width: 20px;
            padding: 0;
            border-color: transparent;
            color: var(--jazz-neutral-400, #52525b);
            margin-top: 1px;
            pointer-events: auto;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .toast-dismiss:hover {
            border-color: transparent;
            color: var(--jazz-neutral-600, #a1a1aa);
          }
          .toast-error {
            border-color: var(--jazz-destructive-200);
          }
          .toast-error .toast-title {
            color: var(--jazz-destructive-600, #f87171);
          }
          #toast-clear-all {
            display: none;
            grid-row: 2;
            grid-column: 1;
            justify-self: end;
            margin-top: 0.4rem;
            font-size: 0.75rem;
            color: var(--jazz-neutral-800, #a1a1aa);
            border-color: transparent;
            padding: 2px 8px;
            height: auto;
            pointer-events: all;
          }
          #toast-clear-all:hover {
            border-color: transparent;
          }
          #toast-container:has(.toast ~ .toast) #toast-clear-all {
            display: block;
          }

          :root {
            --jazz-primary: light-dark(#111, #fefefe);
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

            svg {
              width: auto;
            }
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
            color: var(--jazz-neutral-500);
          }

          .text-faint {
            color: var(--jazz-neutral-400);
          }
        </style>
      </head>
      <body>
        ${navHtml}

        <main id="main">${content}</main>

        <div id="toast-container">
          <button
            id="toast-clear-all"
            class="outline"
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
    >
      ${icon} ${label}
    </a>`;
  };

  return html`
    <div class="site-logo">${logoMark(12)} ${logoWordmark(14)}</div>

    <nav id="floating-nav" class="floating-nav">
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

  return html`<nav id="floating-nav" class="floating-nav">
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
      class="ghost square"
      onclick="this.closest('.toast').remove()"
      aria-label="Dismiss"
    >
      ${iconX(14)}
    </button>
  </div>`;
}
