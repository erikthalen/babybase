import { html, raw } from "hono/html";

interface LayoutProps {
  title: string;
  nav: string;
  content: string;
}

export function layout({ title, nav: navHtml, content }: LayoutProps): string {
  return String(
    html`<!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
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
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />

          <link
            href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
            rel="stylesheet"
          />

          <link
            href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible+Mono:ital,wght@0,200..800;1,200..800&display=swap"
            rel="stylesheet"
          />

          <script
            type="module"
            src="https://cdn.jsdelivr.net/gh/starfederation/datastar@v1.0.0-RC.8/bundles/datastar.js"
          ></script>
          <style>
            :root {
              --pb-sans-serif: "Be Vietnam Pro", system-ui, sans-serif;
              --pb-monospace: "Atkinson Hyperlegible Mono", monospace;

              --pb-bg: #09090b;
              --pb-surface: #111113;
              --pb-th-bg: #27272c;
              --pb-diagram-bg: #0d0d0d;
              --pb-nav-hover: rgba(255, 255, 255, 0.05);

              --pb-border: rgb(255 255 255 / 14%);
              --pb-border-subtle: rgba(255, 255, 255, 0.05);
              --pb-border-muted: rgba(255, 255, 255, 0.07);
              --pb-border-input: rgba(255, 255, 255, 0.12);

              --pb-text-muted: #8a8a93;
              --pb-text-faint: #5e5e5e;
              --pb-text-heading: #e4e4e7;

              --pb-shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.5);

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
                transform: translateY(-5px);
              }
            }

            @keyframes move-in {
              from {
                opacity: 0;
                transform: translateY(5px);
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

            *,
            *::before,
            *::after {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
              text-rendering: geometricPrecision;
            }
            html {
              font-size: 14px;
              text-rendering: geometricPrecision;
            }
            body {
              font-family: var(--pb-sans-serif);
              min-height: 100vh;
              background: var(--pb-bg);
              color: #fafafa;
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
              display: flex;
              background: var(--pb-surface);
              border: 1px solid var(--pb-border);
              border-radius: 10px;
              padding: 3px;
              gap: 2px;
              z-index: 100;
              box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
              overflow: hidden;
            }
            .floating-nav a {
              display: flex;
              align-items: center;
              gap: 0.5rem;
              padding: 0.4rem 0.875rem;
              height: 28px;
              border-radius: 7px;
              font-size: 0.8125rem;
              font-weight: 500;
              color: var(--pb-text-muted);
              text-decoration: none;
              white-space: nowrap;
              transition:
                background 0.12s,
                color 0.12s;
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
            .floating-nav a svg {
              flex-shrink: 0;
              opacity: 0.65;
              transition: opacity 0.12s;
            }
            .floating-nav a:hover {
              background: var(--pb-nav-hover);
              color: var(--pb-text-heading);
            }
            .floating-nav a:hover svg {
              opacity: 0.8;
            }
            .floating-nav a.active {
              background: rgba(255, 255, 255, 0.1);
              color: #fafafa;
            }
            .floating-nav a.active svg {
              opacity: 1;
            }
            main {
              width: 100%;
              overflow: auto;
              background: var(--pb-bg);
              max-height: 100vh;

              display: flex;
              flex-direction: column;
            }
            h2 {
              font-size: 1.125rem;
              font-weight: 600;
              letter-spacing: -0.01em;
            }
            a {
              color: inherit;
            }
            table {
              --cols: 1;
              background: var(--pb-surface);

              display: grid;
              grid-template-columns: repeat(var(--cols), minmax(0, auto));
              min-width: 100%;
              width: max-content;

              border-radius: 12px 12px 0 0;
            }

            table.even {
              grid-template-columns: repeat(var(--cols), minmax(0, 1fr));
            }

            table:has(th:nth-child(2)) {
              --cols: 2;
            }

            table:has(th:nth-child(3)) {
              --cols: 3;
            }

            table:has(th:nth-child(4)) {
              --cols: 4;
            }

            table:has(th:nth-child(5)) {
              --cols: 5;
            }

            table:has(th:nth-child(6)) {
              --cols: 6;
            }
            table:has(th:nth-child(7)) {
              --cols: 7;
            }
            table:has(th:nth-child(8)) {
              --cols: 8;
            }
            table:has(th:nth-child(9)) {
              --cols: 9;
            }
            table:has(th:nth-child(10)) {
              --cols: 10;
            }
            table:has(th:nth-child(11)) {
              --cols: 11;
            }
            table:has(th:nth-child(12)) {
              --cols: 12;
            }
            table:has(th:nth-child(13)) {
              --cols: 13;
            }
            table:has(th:nth-child(14)) {
              --cols: 14;
            }
            table:has(th:nth-child(15)) {
              --cols: 15;
            }
            table:has(th:nth-child(16)) {
              --cols: 16;
            }
            table:has(th:nth-child(17)) {
              --cols: 17;
            }
            table:has(th:nth-child(18)) {
              --cols: 18;
            }
            table:has(th:nth-child(19)) {
              --cols: 19;
            }
            table:has(th:nth-child(20)) {
              --cols: 20;
            }

            thead,
            tbody,
            tr {
              display: contents;
            }

            th,
            td {
              border-bottom: 1px solid var(--pb-border);
              padding: 0.625rem 0.875rem;
              text-align: left;
              font-size: 0.8125rem;

              display: flex;
              align-items: center;
              gap: 0.25rem;
            }
            th {
              background: var(--pb-th-bg);
              font-weight: 500;
              color: var(--pb-text-muted);
              font-size: 0.6875rem;
              letter-spacing: 0.06em;

              position: sticky;
              top: 0;
            }

            th:first-child {
              border-radius: 12px 0 0 0;
            }

            th:last-child {
              border-radius: 0 12px 0 0;
            }

            tr:last-child td {
              border-bottom: none;
            }
            tbody tr:hover td {
              background: rgba(255, 255, 255, 0.02);
            }
            button {
              user-select: none;
              cursor: pointer;
              padding: 0.375rem 0.75rem;
              border: 1px solid var(--pb-border-input);
              border-radius: 8px;
              background: transparent;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 0.5em;
              color: #fafafa;
              font-size: 0.8125rem;
              font-family: inherit;
              font-weight: 500;
              transition:
                background 0.12s,
                border-color 0.12s,
                color 0.12s;
            }
            button[disabled] {
              cursor: default;
            }
            button:not([disabled]):hover {
              background: rgba(255, 255, 255, 0.06);
              border-color: rgba(255, 255, 255, 0.2);
            }
            button.primary {
              background: var(--pb-primary);
              color: var(--pb-primary-fg);
              border-color: var(--pb-primary);
            }
            button.primary:hover {
              background: #e4e4e7;
              border-color: #e4e4e7;
            }
            button.danger {
              background: transparent;
              color: var(--pb-danger);
              border-color: rgba(239, 68, 68, 0.3);
            }
            button.danger:hover {
              background: rgba(239, 68, 68, 0.08);
              border-color: rgba(239, 68, 68, 0.5);
            }
            input,
            textarea,
            select {
              border: 1px solid var(--pb-border-input);
              border-radius: 6px;
              padding: 0.375rem 0.625rem;
              font-size: 0.8125rem;
              font-family: inherit;
              background: rgba(255, 255, 255, 0.04);
              color: #fafafa;
              outline: none;
              transition: border-color 0.12s;
            }
            input:focus,
            textarea:focus,
            select:focus {
              border-color: rgba(255, 255, 255, 0.25);
            }
            input::placeholder,
            textarea::placeholder {
              color: var(--pb-text-faint);
            }
            select option {
              background: #18181b;
            }
            .badge {
              display: inline-block;
              padding: 0.12rem 0.5rem;
              border-radius: 10px;
              font-size: 0.65rem;
              font-weight: 600;
              letter-spacing: 0.05em;
              text-transform: uppercase;
              background: var(--pb-badge-bg);
              color: var(--pb-badge-fg);
            }
            .badge.pk {
              background: var(--pb-badge-pk-bg);
              color: var(--pb-badge-pk-fg);
            }
            .badge.fk {
              background: var(--pb-badge-fk-bg);
              color: var(--pb-badge-fk-fg);
            }
            .text-muted {
              color: var(--pb-text-muted);
            }
            .text-faint {
              color: var(--pb-text-faint);
            }
            .tab-bar {
              display: flex;
              gap: 2px;
              overflow-x: auto;
              border-bottom: 1px solid var(--pb-border);
              scrollbar-width: none;
              flex-shrink: 0;

              position: sticky;
              top: 0;
              left: 0;
              background: var(--pb-bg);
              z-index: 1;

              padding-left: 1.25rem;

              @media (width > 600px) {
                padding-left: 0;
              }
            }
            .tab-bar::-webkit-scrollbar {
              display: none;
            }
            .tab-bar a {
              flex-shrink: 0;
              padding: 0.75rem 1.75rem;
              font-size: 0.8125rem;
              font-weight: 500;
              text-decoration: none;
              color: var(--pb-text-muted);
              white-space: nowrap;
              transition:
                background 0.12s,
                color 0.12s;
              cursor: pointer;
            }
            .tab-bar a:hover {
              background: var(--pb-nav-hover);
              color: var(--pb-text-heading);
            }
            .tab-bar a.active {
              background: rgb(51 51 51);
              color: #fafafa;
            }
            .pagination {
              user-select: none;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 0.5rem;
              padding: 0.625rem 1rem;
              position: sticky;
              bottom: 0;
              background: var(--pb-bg);
              border-top: 1px solid var(--pb-border);
            }

            .pagination-buttons {
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 0.5rem;
              min-width: 272px;
            }

            .pagination-btn {
              display: flex;
              align-items: center;
              justify-content: center;
              height: 2rem;
              min-width: 2rem;
              padding: 0 0.625rem;
              border-radius: 8px;
              border: 1px solid transparent;
              background: transparent;
              color: var(--pb-text-muted);
              font-size: 0.8125rem;
              font-family: inherit;
              font-weight: 500;
              cursor: pointer;
              transition:
                background 0.12s,
                color 0.12s,
                border-color 0.12s;
              white-space: nowrap;
            }
            .pagination-btn:not([disabled]):not(.active):hover {
              color: var(--pb-text-heading);
              background: var(--pb-nav-hover);
            }
            .pagination-btn.active {
              border-color: var(--pb-border);
              color: #fafafa;
              pointer-events: none;
            }
            .pagination-btn[disabled] {
              opacity: 0.3;
              pointer-events: none;
            }
            .pagination-dots {
              display: flex;
              align-items: center;
              justify-content: center;
              width: 2rem;
              height: 2rem;
              color: var(--pb-text-muted);
              font-size: 0.875rem;
              letter-spacing: 0.1em;
              user-select: none;
            }
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
              background: var(--pb-surface);
              border: 1px solid var(--pb-border);
              border-radius: 8px;
              padding: 0.875rem 1rem;
              display: flex;
              align-items: flex-start;
              gap: 0.75rem;
              box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
              pointer-events: none;
              animation: toast-in 0.25s cubic-bezier(0.16, 1, 0.3, 1);
              transition:
                transform 0.35s cubic-bezier(0.16, 1, 0.3, 1),
                opacity 0.25s ease;
            }
            /* newest — on top, fully interactive */
            .toast:first-child {
              pointer-events: all;
              z-index: 3;
            }
            /* second — peeks below */
            .toast:nth-child(2) {
              z-index: 2;
              transform: translateY(-4px);
            }
            /* third — peeks further */
            .toast:nth-child(3) {
              z-index: 1;
              transform: translateY(-8px);
            }
            /* rest — hidden but still in flow */
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
              color: var(--pb-text-muted);
              line-height: 1.4;
            }
            .toast-dismiss {
              flex-shrink: 0;
              height: 20px;
              width: 20px;
              min-width: 20px;
              padding: 0;
              border-color: transparent;
              color: var(--pb-text-faint);
              margin-top: 1px;
            }
            .toast-dismiss:hover {
              border-color: transparent;
              color: var(--pb-text-muted);
            }
            .toast-error {
              border-color: rgba(239, 68, 68, 0.4);
            }
            .toast-error .toast-title {
              color: var(--pb-danger);
            }
            #toast-clear-all {
              display: none;
              grid-row: 2;
              grid-column: 1;
              justify-self: end;
              margin-top: 0.4rem;
              font-size: 0.75rem;
              color: var(--pb-text-muted);
              border-color: transparent;
              padding: 2px 8px;
              height: auto;
              pointer-events: all;
            }
            #toast-clear-all:hover {
              border-color: transparent;
              color: var(--pb-text);
            }
            #toast-container:has(.toast ~ .toast) #toast-clear-all {
              display: block;
            }
            [data-tooltip] {
              position: relative;
            }
            [data-tooltip]::before {
              content: attr(data-tooltip);
              position: absolute;
              top: calc(100% + 7px);
              left: 50%;
              transform: translateX(-50%);
              background: #000;
              color: #fff;
              padding: 4px 8px;
              border-radius: 6px;
              font-size: 11px;
              font-weight: 400;
              white-space: nowrap;
              pointer-events: none;
              opacity: 0;
              transition: opacity 0.15s;
              z-index: 100;
            }
            [data-tooltip]::after {
              content: "";
              position: absolute;
              top: calc(100% + 2px);
              left: 50%;
              transform: translateX(-50%);
              border: 4px solid transparent;
              border-bottom-color: #000;
              pointer-events: none;
              opacity: 0;
              transition: opacity 0.15s;
              z-index: 100;
            }
            [data-tooltip]:hover::before,
            [data-tooltip]:hover::after {
              opacity: 1;
            }
          </style>
        </head>
        <body>
          ${raw(navHtml)}
          <main id="main">${raw(content)}</main>
          <div id="toast-container">
            <button
              id="toast-clear-all"
              onclick="document.querySelectorAll('#toast-container .toast').forEach(t=>t.remove())"
              aria-label="Clear all notifications"
            >
              Clear all
            </button>
          </div>
        </body>
      </html>`,
  );
}

interface NavProps {
  basePath: string;
  activeSection: "schema" | "migrations" | "storage";
  tables?: string[];
  hasDatabase?: boolean;
}

export function nav({
  basePath,
  activeSection,
  hasDatabase = true,
}: NavProps): string {
  const base = basePath.replace(/\/$/, "");

  const link = (
    path: string,
    label: string,
    section: string,
    icon: string,
    vtName?: string,
  ) => {
    const cls = activeSection === section ? "active" : "";
    return html`<a
      href="${base}${path}"
      ${raw(cls ? `class="${cls}"` : "")}
      ${raw(vtName ? `style="view-transition-name: ${vtName}"` : "")}
    >
      ${raw(icon)} ${label}
    </a>`;
  };

  return String(html`
    <div class="site-logo">
      <svg
        height="12"
        viewBox="0 0 170 170"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M85 0C108.839 1.04202e-06 130.385 9.81362 145.82 25.6211C146.295 26.1077 146.765 26.5998 147.229 27.0977C141.126 42.0264 169.715 61.9624 169.993 83.9014C169.998 84.267 170 84.6332 170 85C170 131.944 131.944 170 85 170H0V85C2.052e-06 38.0558 38.0558 -2.052e-06 85 0Z"
          fill="currentColor"
        />
      </svg>

      <svg
        height="14"
        viewBox="0 0 2425 489"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M139.264 394.24C122.197 394.24 107.861 391.509 96.256 386.048C84.6507 380.587 75.264 374.101 68.096 366.592C61.2693 359.083 55.808 352.256 51.712 346.112H48.64V389.12H-1.90735e-05V9.15527e-05H48.64V160.768H51.712C55.808 154.283 61.2693 147.285 68.096 139.776C75.264 132.267 84.6507 125.952 96.256 120.832C107.861 115.371 122.197 112.64 139.264 112.64C159.744 112.64 177.664 116.736 193.024 124.928C208.384 132.779 221.184 143.531 231.424 157.184C241.664 170.496 249.344 185.515 254.464 202.24C259.584 218.965 262.144 236.032 262.144 253.44C262.144 270.848 259.584 287.915 254.464 304.64C249.344 321.365 241.664 336.555 231.424 350.208C221.184 363.52 208.384 374.272 193.024 382.464C177.664 390.315 159.744 394.24 139.264 394.24ZM131.072 352.768C149.504 352.768 164.693 347.989 176.64 338.432C188.928 328.533 197.973 316.075 203.776 301.056C209.92 285.696 212.992 269.824 212.992 253.44C212.992 236.715 209.92 220.843 203.776 205.824C197.973 190.805 188.928 178.517 176.64 168.96C164.693 159.061 149.504 154.112 131.072 154.112C112.981 154.112 97.792 159.061 85.504 168.96C73.5573 178.517 64.512 190.805 58.368 205.824C52.5653 220.843 49.664 236.715 49.664 253.44C49.664 269.824 52.5653 285.696 58.368 301.056C64.512 316.075 73.5573 328.533 85.504 338.432C97.792 347.989 112.981 352.768 131.072 352.768ZM444.14 112.64C461.207 112.64 475.543 115.371 487.148 120.832C498.753 126.293 508.14 132.779 515.308 140.288C522.476 147.456 527.937 154.283 531.692 160.768H534.764V117.76H583.404V389.12H534.764V346.112H531.692C527.937 352.597 522.476 359.595 515.308 367.104C508.14 374.613 498.753 381.099 487.148 386.56C475.543 391.68 461.207 394.24 444.14 394.24C423.66 394.24 405.74 390.315 390.38 382.464C375.02 374.272 362.22 363.52 351.98 350.208C341.74 336.555 334.06 321.365 328.94 304.64C323.82 287.915 321.26 270.848 321.26 253.44C321.26 236.032 323.82 218.965 328.94 202.24C334.06 185.515 341.74 170.496 351.98 157.184C362.22 143.531 375.02 132.779 390.38 124.928C405.74 116.736 423.66 112.64 444.14 112.64ZM452.332 154.112C434.241 154.112 419.052 159.061 406.764 168.96C394.476 178.517 385.26 190.805 379.116 205.824C373.313 220.843 370.412 236.715 370.412 253.44C370.412 269.824 373.313 285.696 379.116 301.056C385.26 316.075 394.476 328.533 406.764 338.432C419.052 347.989 434.241 352.768 452.332 352.768C470.423 352.768 485.441 347.989 497.388 338.432C509.676 328.533 518.721 316.075 524.524 301.056C530.668 285.696 533.74 269.824 533.74 253.44C533.74 236.715 530.668 220.843 524.524 205.824C518.721 190.805 509.676 178.517 497.388 168.96C485.441 159.061 470.423 154.112 452.332 154.112ZM799.264 394.24C782.197 394.24 767.861 391.509 756.256 386.048C744.651 380.587 735.264 374.101 728.096 366.592C721.269 359.083 715.808 352.256 711.712 346.112H708.64V389.12H660V9.15527e-05H708.64V160.768H711.712C715.808 154.283 721.269 147.285 728.096 139.776C735.264 132.267 744.651 125.952 756.256 120.832C767.861 115.371 782.197 112.64 799.264 112.64C819.744 112.64 837.664 116.736 853.024 124.928C868.384 132.779 881.184 143.531 891.424 157.184C901.664 170.496 909.344 185.515 914.464 202.24C919.584 218.965 922.144 236.032 922.144 253.44C922.144 270.848 919.584 287.915 914.464 304.64C909.344 321.365 901.664 336.555 891.424 350.208C881.184 363.52 868.384 374.272 853.024 382.464C837.664 390.315 819.744 394.24 799.264 394.24ZM791.072 352.768C809.504 352.768 824.693 347.989 836.64 338.432C848.928 328.533 857.973 316.075 863.776 301.056C869.92 285.696 872.992 269.824 872.992 253.44C872.992 236.715 869.92 220.843 863.776 205.824C857.973 190.805 848.928 178.517 836.64 168.96C824.693 159.061 809.504 154.112 791.072 154.112C772.981 154.112 757.792 159.061 745.504 168.96C733.557 178.517 724.512 190.805 718.368 205.824C712.565 220.843 709.664 236.715 709.664 253.44C709.664 269.824 712.565 285.696 718.368 301.056C724.512 316.075 733.557 328.533 745.504 338.432C757.792 347.989 772.981 352.768 791.072 352.768ZM981.12 488.96C973.269 488.96 966.613 488.619 961.152 487.936C955.691 487.253 952.96 486.912 952.96 486.912V445.44C952.96 445.44 955.691 445.611 961.152 445.952C966.955 446.635 973.099 446.976 979.584 446.976C999.723 446.976 1016.11 442.709 1028.74 434.176C1041.71 425.984 1052.63 412.331 1061.5 393.216L956.544 117.76H1007.23L1085.57 329.728L1164.42 117.76H1215.62L1110.66 389.632C1097.34 423.765 1080.11 448.853 1058.94 464.896C1038.12 480.939 1012.18 488.96 981.12 488.96ZM1413.76 394.24C1396.7 394.24 1382.36 391.509 1370.76 386.048C1359.15 380.587 1349.76 374.101 1342.6 366.592C1335.77 359.083 1330.31 352.256 1326.21 346.112H1323.14V389.12H1274.5V9.15527e-05H1323.14V160.768H1326.21C1330.31 154.283 1335.77 147.285 1342.6 139.776C1349.76 132.267 1359.15 125.952 1370.76 120.832C1382.36 115.371 1396.7 112.64 1413.76 112.64C1434.24 112.64 1452.16 116.736 1467.52 124.928C1482.88 132.779 1495.68 143.531 1505.92 157.184C1516.16 170.496 1523.84 185.515 1528.96 202.24C1534.08 218.965 1536.64 236.032 1536.64 253.44C1536.64 270.848 1534.08 287.915 1528.96 304.64C1523.84 321.365 1516.16 336.555 1505.92 350.208C1495.68 363.52 1482.88 374.272 1467.52 382.464C1452.16 390.315 1434.24 394.24 1413.76 394.24ZM1405.57 352.768C1424 352.768 1439.19 347.989 1451.14 338.432C1463.43 328.533 1472.47 316.075 1478.28 301.056C1484.42 285.696 1487.49 269.824 1487.49 253.44C1487.49 236.715 1484.42 220.843 1478.28 205.824C1472.47 190.805 1463.43 178.517 1451.14 168.96C1439.19 159.061 1424 154.112 1405.57 154.112C1387.48 154.112 1372.29 159.061 1360 168.96C1348.06 178.517 1339.01 190.805 1332.87 205.824C1327.07 220.843 1324.16 236.715 1324.16 253.44C1324.16 269.824 1327.07 285.696 1332.87 301.056C1339.01 316.075 1348.06 328.533 1360 338.432C1372.29 347.989 1387.48 352.768 1405.57 352.768ZM1718.64 112.64C1735.71 112.64 1750.04 115.371 1761.65 120.832C1773.25 126.293 1782.64 132.779 1789.81 140.288C1796.98 147.456 1802.44 154.283 1806.19 160.768H1809.26V117.76H1857.9V389.12H1809.26V346.112H1806.19C1802.44 352.597 1796.98 359.595 1789.81 367.104C1782.64 374.613 1773.25 381.099 1761.65 386.56C1750.04 391.68 1735.71 394.24 1718.64 394.24C1698.16 394.24 1680.24 390.315 1664.88 382.464C1649.52 374.272 1636.72 363.52 1626.48 350.208C1616.24 336.555 1608.56 321.365 1603.44 304.64C1598.32 287.915 1595.76 270.848 1595.76 253.44C1595.76 236.032 1598.32 218.965 1603.44 202.24C1608.56 185.515 1616.24 170.496 1626.48 157.184C1636.72 143.531 1649.52 132.779 1664.88 124.928C1680.24 116.736 1698.16 112.64 1718.64 112.64ZM1726.83 154.112C1708.74 154.112 1693.55 159.061 1681.26 168.96C1668.98 178.517 1659.76 190.805 1653.62 205.824C1647.81 220.843 1644.91 236.715 1644.91 253.44C1644.91 269.824 1647.81 285.696 1653.62 301.056C1659.76 316.075 1668.98 328.533 1681.26 338.432C1693.55 347.989 1708.74 352.768 1726.83 352.768C1744.92 352.768 1759.94 347.989 1771.89 338.432C1784.18 328.533 1793.22 316.075 1799.02 301.056C1805.17 285.696 1808.24 269.824 1808.24 253.44C1808.24 236.715 1805.17 220.843 1799.02 205.824C1793.22 190.805 1784.18 178.517 1771.89 168.96C1759.94 159.061 1744.92 154.112 1726.83 154.112ZM2028.71 394.24C2007.89 394.24 1990.65 391.339 1977 385.536C1963.68 379.733 1953.1 372.565 1945.25 364.032C1937.4 355.157 1931.6 346.453 1927.84 337.92C1924.09 329.045 1921.7 321.707 1920.68 315.904C1919.65 310.101 1919.14 307.2 1919.14 307.2H1968.29C1968.29 307.2 1968.8 309.589 1969.83 314.368C1971.19 318.805 1973.75 324.096 1977.51 330.24C1981.6 336.043 1987.75 341.333 1995.94 346.112C2004.47 350.549 2015.74 352.768 2029.73 352.768C2045.77 352.768 2058.23 349.013 2067.11 341.504C2075.98 333.653 2080.42 324.096 2080.42 312.832C2080.42 302.933 2076.84 295.083 2069.67 289.28C2062.84 283.477 2052.94 279.04 2039.97 275.968L2003.11 267.264C1989.45 263.851 1976.65 259.243 1964.71 253.44C1952.76 247.637 1943.03 239.787 1935.52 229.888C1928.36 219.648 1924.77 207.019 1924.77 192C1924.77 168.789 1933.48 149.845 1950.88 135.168C1968.29 120.149 1990.99 112.64 2018.98 112.64C2037.75 112.64 2053.28 115.371 2065.57 120.832C2077.86 125.952 2087.59 132.437 2094.76 140.288C2102.27 148.139 2107.73 155.989 2111.14 163.84C2114.89 171.691 2117.28 178.347 2118.31 183.808C2119.33 188.928 2119.84 191.488 2119.84 191.488H2072.74C2072.74 191.488 2072.23 189.611 2071.2 185.856C2070.18 181.76 2067.79 177.323 2064.04 172.544C2060.62 167.424 2055.33 162.987 2048.16 159.232C2041 155.136 2031.44 153.088 2019.49 153.088C2003.11 153.088 1991.16 156.843 1983.65 164.352C1976.14 171.861 1972.39 180.053 1972.39 188.928C1972.39 197.461 1975.8 204.459 1982.63 209.92C1989.8 215.04 1999.01 218.965 2010.28 221.696L2047.65 230.4C2070.86 235.861 2089.98 244.907 2105 257.536C2120.36 269.824 2128.04 287.573 2128.04 310.784C2128.04 325.803 2124.11 339.797 2116.26 352.768C2108.41 365.397 2097.15 375.467 2082.47 382.976C2067.79 390.485 2049.87 394.24 2028.71 394.24ZM2307.77 394.24C2285.59 394.24 2266.3 390.315 2249.92 382.464C2233.87 374.272 2220.56 363.349 2209.98 349.696C2199.74 336.043 2192.06 321.024 2186.94 304.64C2181.82 287.915 2179.26 270.848 2179.26 253.44C2179.26 236.373 2181.65 219.477 2186.43 202.752C2191.55 186.027 2199.23 170.837 2209.47 157.184C2220.05 143.531 2233.19 132.779 2248.89 124.928C2264.93 116.736 2283.88 112.64 2305.72 112.64C2328.93 112.64 2349.41 117.931 2367.16 128.512C2384.91 139.093 2398.91 154.795 2409.15 175.616C2419.39 196.437 2424.51 222.549 2424.51 253.952V268.288H2228.41C2229.44 283.648 2233.02 297.813 2239.16 310.784C2245.65 323.413 2254.69 333.653 2266.3 341.504C2277.91 349.013 2291.73 352.768 2307.77 352.768C2321.77 352.768 2333.03 350.549 2341.56 346.112C2350.44 341.333 2357.44 335.872 2362.56 329.728C2367.68 323.584 2371.09 318.293 2372.8 313.856C2374.84 309.077 2375.87 306.688 2375.87 306.688H2421.44C2421.44 306.688 2420.58 309.76 2418.88 315.904C2417.17 321.707 2414.1 328.875 2409.66 337.408C2405.22 345.941 2398.74 354.645 2390.2 363.52C2381.67 372.053 2370.75 379.392 2357.44 385.536C2344.12 391.339 2327.57 394.24 2307.77 394.24ZM2228.92 230.4H2376.89C2376.21 212.651 2372.45 198.315 2365.63 187.392C2358.8 176.128 2350.1 167.765 2339.52 162.304C2328.93 156.843 2317.67 154.112 2305.72 154.112C2284.22 154.112 2266.64 161.109 2252.99 175.104C2239.33 188.757 2231.31 207.189 2228.92 230.4Z"
          fill="currentColor"
        />
      </svg>
    </div>

    <nav
      id="floating-nav"
      class="floating-nav"
      style="view-transition-name: floating-nav"
    >
      ${raw(
        hasDatabase
          ? String(
              link(
                "/schema",
                "Schema",
                "schema",
                html`<svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path
                    d="M3 17a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v2a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2l0 -2"
                  />
                  <path
                    d="M15 17a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v2a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2l0 -2"
                  />
                  <path
                    d="M9 5a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v2a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2l0 -2"
                  />
                  <path d="M6 15v-1a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v1" />
                  <path d="M12 9l0 3" />
                </svg>`.toString(),
              ),
            )
          : "",
      )}
      ${raw(
        hasDatabase
          ? String(
              link(
                "/migrations",
                "Migrations",
                "migrations",
                html`<svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M3 8l4 -4l4 4" />
                  <path d="M7 4l0 9" />
                  <path d="M13 16l4 4l4 -4" />
                  <path d="M17 10l0 10" />
                </svg>`.toString(),
              ),
            )
          : "",
      )}
      ${link(
        "/storage",
        "Storage",
        "storage",
        html`<svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path
            d="M4 6c0 1.657 3.582 3 8 3s8 -1.343 8 -3s-3.582 -3 -8 -3s-8 1.343 -8 3"
          />
          <path d="M4 6v6c0 1.657 3.582 3 8 3c1.118 0 2.183 -.086 3.15 -.241" />
          <path d="M20 12v-6" />
          <path d="M4 12v6c0 1.657 3.582 3 8 3c.157 0 .312 -.002 .466 -.005" />
          <path d="M16 19h6" />
          <path d="M19 16l3 3l-3 3" />
        </svg>`.toString(),
      )}
    </nav>
  `);
}

export function navElement(props: NavProps): string {
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
    const cls = activeSection === section ? "active" : "";
    return `<a href="${base}${path}" ${cls ? ` class="${cls}"` : ""}${vtName ? ` style="view-transition-name: ${vtName}"` : ""}>${icon} ${label}</a>`;
  };

  const schemaIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 17a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v2a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2l0 -2"/><path d="M15 17a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v2a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2l0 -2"/><path d="M9 5a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v2a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2l0 -2"/><path d="M6 15v-1a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v1"/><path d="M12 9l0 3"/></svg>`;
  const migrationsIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 8l4 -4l4 4"/><path d="M7 4l0 9"/><path d="M13 16l4 4l4 -4"/><path d="M17 10l0 10"/></svg>`;
  const storageIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 6c0 1.657 3.582 3 8 3s8 -1.343 8 -3s-3.582 -3 -8 -3s-8 1.343 -8 3"/><path d="M4 6v6c0 1.657 3.582 3 8 3c1.118 0 2.183 -.086 3.15 -.241"/><path d="M20 12v-6"/><path d="M4 12v6c0 1.657 3.582 3 8 3c.157 0 .312 -.002 .466 -.005"/><path d="M16 19h6"/><path d="M19 16l3 3l-3 3"/></svg>`;

  const schemaLink = hasDatabase
    ? link("/schema", "Schema", "schema", schemaIcon, "nav-schema")
    : "";
  const migrationsLink = hasDatabase
    ? link(
        "/migrations",
        "Migrations",
        "migrations",
        migrationsIcon,
        "nav-migrations",
      )
    : "";
  const storageLink = link("/storage", "Storage", "storage", storageIcon);

  return `<nav id="floating-nav" class="floating-nav">${schemaLink}${migrationsLink}${storageLink}</nav>`;
}

export function toastHtml(
  title: string,
  body: string,
  variant?: "error",
): string {
  const cls = variant === "error" ? " toast-error" : "";
  return `<div class="toast${cls}" role="alert">
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-body">${body}</div>
    </div>
    <button class="toast-dismiss" onclick="this.closest('.toast').remove()" aria-label="Dismiss">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M18 6l-12 12" />
        <path d="M6 6l12 12" />
      </svg>
    </button>
  </div>`;
}
