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
          <title>${title} — Picobase</title>
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
            src="https://cdn.jsdelivr.net/gh/starfederation/datastar@v1.0.0-RC.7/bundles/datastar.js"
          ></script>
          <style>
            :root {
              --pb-sans-serif: "Be Vietnam Pro", system-ui, sans-serif;
              --pb-monospace: "Atkinson Hyperlegible Mono", monospace;

              --pb-bg: #09090b;
              --pb-surface: #111113;
              --pb-th-bg: #27272c;
              --pb-diagram-bg: #1f1f1f;
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
            }
            *,
            *::before,
            *::after {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            html {
              font-size: 14px;
              text-rendering: geometricPrecision;
            }
            body {
              font-family: var(--pb-sans-serif);
              display: flex;
              min-height: 100vh;
              background: var(--pb-bg);
              color: #fafafa;
              user-select: none;
            }

            aside {
              width: 160px;
              padding: 1.25rem 0.5rem;
              flex-shrink: 0;
              display: flex;
              flex-direction: column;
              gap: 2px;
              border-right: 1px solid var(--pb-border);
              background: var(--pb-surface);
              height: 100%;
            }
            aside h1 {
              display: flex;
              padding: 0.375rem 0.625rem;
              margin-bottom: 2rem;
            }
            aside a {
              display: flex;
              gap: 0.625rem;
              align-items: center;
              padding: 0.4375rem 0.625rem;
              text-decoration: none;
              border-radius: 6px;
              font-size: 0.8125rem;
              font-weight: 500;
              color: var(--pb-text-muted);
              transition:
                background 0.12s,
                color 0.12s;
            }
            aside a svg {
              flex-shrink: 0;
              opacity: 0.65;
              transition: opacity 0.12s;
            }
            aside a:hover {
              background: var(--pb-nav-hover);
              color: #e4e4e7;
            }
            aside a:hover svg {
              opacity: 0.8;
            }
            aside a.active {
              background: rgba(255, 255, 255, 0.08);
              color: #fafafa;
            }
            aside a.active svg {
              opacity: 1;
            }
            main {
              flex: 1;
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
              overflow: hidden;

              display: grid;
              grid-template-columns: repeat(var(--cols), minmax(0, auto));
              min-width: 100%;
              width: max-content;
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
              color: #fafafa;
              font-size: 0.8125rem;
              font-family: inherit;
              font-weight: 500;
              transition:
                background 0.12s,
                border-color 0.12s,
                color 0.12s;
            }
            button:hover {
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
          </style>
        </head>
        <body>
          <div class="sidebar">
            <aside>${raw(navHtml)}</aside>
          </div>
          <main id="main">${raw(content)}</main>
        </body>
      </html>`,
  );
}

interface NavProps {
  basePath: string;
  activeSection: "tables" | "schema" | "migrations" | "backups";
  tables?: string[];
}

export function nav({ basePath, activeSection }: NavProps): string {
  const base = basePath.replace(/\/$/, "");
  const link = (
    path: string,
    label: string,
    section: string,
    icon?: string,
  ) => {
    return html`<a
      href="${base}${path}"
      ${activeSection === section ? " class=active" : ""}
    >
      ${raw(icon ?? "")} ${label}
    </a>`;
  };

  return html` <h1
      style="display:flex;align-items:center;gap:0.5rem;font-size:1.25rem"
    >
      <svg
        height="16"
        viewBox="0 0 170 170"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M85 0C108.839 1.04202e-06 130.385 9.81362 145.82 25.6211C146.295 26.1077 146.765 26.5998 147.229 27.0977C161.126 42.0264 169.715 61.9624 169.993 83.9014C169.998 84.267 170 84.6332 170 85C170 131.944 131.944 170 85 170H0V85C2.052e-06 38.0558 38.0558 -2.052e-06 85 0Z"
          fill="currentColor"
        />
      </svg>

      <svg
        height="16"
        viewBox="0 0 2262 490"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M1.14441e-05 489.472V117.76H48.64V160.768H51.712C55.808 154.283 61.2693 147.285 68.096 139.776C75.264 132.267 84.6507 125.952 96.256 120.832C107.861 115.371 122.197 112.64 139.264 112.64C159.744 112.64 177.664 116.736 193.024 124.928C208.384 132.779 221.184 143.531 231.424 157.184C241.664 170.496 249.344 185.515 254.464 202.24C259.584 218.965 262.144 236.032 262.144 253.44C262.144 270.848 259.584 287.915 254.464 304.64C249.344 321.365 241.664 336.555 231.424 350.208C221.184 363.52 208.384 374.272 193.024 382.464C177.664 390.315 159.744 394.24 139.264 394.24C122.197 394.24 107.861 391.509 96.256 386.048C84.6507 380.587 75.264 374.101 68.096 366.592C61.2693 359.083 55.808 352.256 51.712 346.112H48.64V489.472H1.14441e-05ZM49.664 253.44C49.664 269.824 52.5653 285.696 58.368 301.056C64.512 316.075 73.5573 328.533 85.504 338.432C97.792 347.989 112.981 352.768 131.072 352.768C149.504 352.768 164.693 347.989 176.64 338.432C188.928 328.533 197.973 316.075 203.776 301.056C209.92 285.696 212.992 269.824 212.992 253.44C212.992 236.715 209.92 220.843 203.776 205.824C197.973 190.805 188.928 178.517 176.64 168.96C164.693 159.061 149.504 154.112 131.072 154.112C112.981 154.112 97.792 159.061 85.504 168.96C73.5573 178.517 64.512 190.805 58.368 205.824C52.5653 220.843 49.664 236.715 49.664 253.44ZM360.624 66.0481C351.408 66.0481 343.728 62.9761 337.584 56.8321C331.781 50.6881 328.88 43.3494 328.88 34.8161C328.88 25.9414 331.781 18.4321 337.584 12.2881C343.728 6.1441 351.408 3.07211 360.624 3.07211C369.499 3.07211 377.008 6.1441 383.152 12.2881C389.296 18.4321 392.368 25.9414 392.368 34.8161C392.368 43.3494 389.296 50.6881 383.152 56.8321C377.008 62.9761 369.499 66.0481 360.624 66.0481ZM336.56 389.12V117.76H385.2V389.12H336.56ZM592.392 394.24C570.205 394.24 550.749 390.315 534.024 382.464C517.299 374.272 503.304 363.52 492.04 350.208C481.117 336.555 472.755 321.365 466.952 304.64C461.491 287.915 458.76 270.848 458.76 253.44C458.76 236.032 461.491 219.136 466.952 202.752C472.413 186.027 480.605 170.837 491.528 157.184C502.792 143.531 516.787 132.779 533.512 124.928C550.237 116.736 569.864 112.64 592.392 112.64C614.237 112.64 632.328 115.883 646.664 122.368C661 128.853 672.435 137.045 680.968 146.944C689.843 156.501 696.328 166.229 700.424 176.128C704.861 185.685 707.763 193.707 709.128 200.192C710.493 206.677 711.176 209.92 711.176 209.92H664.072C664.072 209.92 663.219 207.189 661.512 201.728C659.805 195.925 656.563 189.44 651.784 182.272C647.005 175.104 639.837 168.789 630.28 163.328C620.723 157.525 608.093 154.624 592.392 154.624C573.619 154.624 557.747 159.403 544.776 168.96C532.147 178.176 522.589 190.293 516.104 205.312C509.96 220.331 506.888 236.373 506.888 253.44C506.888 270.507 509.96 286.549 516.104 301.568C522.589 316.587 532.147 328.875 544.776 338.432C557.747 347.648 573.619 352.256 592.392 352.256C608.093 352.256 620.723 349.525 630.28 344.064C639.837 338.261 647.005 331.776 651.784 324.608C656.563 317.44 659.805 311.125 661.512 305.664C663.219 299.861 664.072 296.96 664.072 296.96H711.176C711.176 296.96 710.493 300.203 709.128 306.688C707.763 313.173 704.861 321.365 700.424 331.264C696.328 340.821 689.843 350.549 680.968 360.448C672.435 370.005 661 378.027 646.664 384.512C632.328 390.997 614.237 394.24 592.392 394.24ZM906.392 394.24C877.379 394.24 852.973 387.584 833.176 374.272C813.379 360.619 798.36 343.04 788.12 321.536C777.88 300.032 772.76 277.333 772.76 253.44C772.76 229.205 777.88 206.507 788.12 185.344C798.36 163.84 813.379 146.432 833.176 133.12C852.973 119.467 877.379 112.64 906.392 112.64C935.405 112.64 959.811 119.467 979.608 133.12C999.405 146.432 1014.42 163.84 1024.66 185.344C1034.9 206.507 1040.02 229.205 1040.02 253.44C1040.02 277.333 1034.9 300.032 1024.66 321.536C1014.42 343.04 999.405 360.619 979.608 374.272C959.811 387.584 935.405 394.24 906.392 394.24ZM906.392 351.744C924.824 351.744 940.184 347.136 952.472 337.92C965.101 328.363 974.488 316.075 980.632 301.056C987.117 286.037 990.36 270.165 990.36 253.44C990.36 236.373 987.117 220.501 980.632 205.824C974.488 190.805 965.101 178.688 952.472 169.472C940.184 159.915 924.824 155.136 906.392 155.136C888.301 155.136 872.941 159.915 860.312 169.472C847.683 178.688 838.125 190.805 831.64 205.824C825.496 220.501 822.424 236.373 822.424 253.44C822.424 270.165 825.496 286.037 831.64 301.056C838.125 316.075 847.683 328.363 860.312 337.92C872.941 347.136 888.301 351.744 906.392 351.744ZM1250.76 394.24C1233.7 394.24 1219.36 391.509 1207.76 386.048C1196.15 380.587 1186.76 374.101 1179.6 366.592C1172.77 359.083 1167.31 352.256 1163.21 346.112H1160.14V389.12H1111.5V9.15527e-05H1160.14V160.768H1163.21C1167.31 154.283 1172.77 147.285 1179.6 139.776C1186.76 132.267 1196.15 125.952 1207.76 120.832C1219.36 115.371 1233.7 112.64 1250.76 112.64C1271.24 112.64 1289.16 116.736 1304.52 124.928C1319.88 132.779 1332.68 143.531 1342.92 157.184C1353.16 170.496 1360.84 185.515 1365.96 202.24C1371.08 218.965 1373.64 236.032 1373.64 253.44C1373.64 270.848 1371.08 287.915 1365.96 304.64C1360.84 321.365 1353.16 336.555 1342.92 350.208C1332.68 363.52 1319.88 374.272 1304.52 382.464C1289.16 390.315 1271.24 394.24 1250.76 394.24ZM1242.57 352.768C1261 352.768 1276.19 347.989 1288.14 338.432C1300.43 328.533 1309.47 316.075 1315.28 301.056C1321.42 285.696 1324.49 269.824 1324.49 253.44C1324.49 236.715 1321.42 220.843 1315.28 205.824C1309.47 190.805 1300.43 178.517 1288.14 168.96C1276.19 159.061 1261 154.112 1242.57 154.112C1224.48 154.112 1209.29 159.061 1197 168.96C1185.06 178.517 1176.01 190.805 1169.87 205.824C1164.07 220.843 1161.16 236.715 1161.16 253.44C1161.16 269.824 1164.07 285.696 1169.87 301.056C1176.01 316.075 1185.06 328.533 1197 338.432C1209.29 347.989 1224.48 352.768 1242.57 352.768ZM1555.64 112.64C1572.71 112.64 1587.04 115.371 1598.65 120.832C1610.25 126.293 1619.64 132.779 1626.81 140.288C1633.98 147.456 1639.44 154.283 1643.19 160.768H1646.26V117.76H1694.9V389.12H1646.26V346.112H1643.19C1639.44 352.597 1633.98 359.595 1626.81 367.104C1619.64 374.613 1610.25 381.099 1598.65 386.56C1587.04 391.68 1572.71 394.24 1555.64 394.24C1535.16 394.24 1517.24 390.315 1501.88 382.464C1486.52 374.272 1473.72 363.52 1463.48 350.208C1453.24 336.555 1445.56 321.365 1440.44 304.64C1435.32 287.915 1432.76 270.848 1432.76 253.44C1432.76 236.032 1435.32 218.965 1440.44 202.24C1445.56 185.515 1453.24 170.496 1463.48 157.184C1473.72 143.531 1486.52 132.779 1501.88 124.928C1517.24 116.736 1535.16 112.64 1555.64 112.64ZM1563.83 154.112C1545.74 154.112 1530.55 159.061 1518.26 168.96C1505.98 178.517 1496.76 190.805 1490.62 205.824C1484.81 220.843 1481.91 236.715 1481.91 253.44C1481.91 269.824 1484.81 285.696 1490.62 301.056C1496.76 316.075 1505.98 328.533 1518.26 338.432C1530.55 347.989 1545.74 352.768 1563.83 352.768C1581.92 352.768 1596.94 347.989 1608.89 338.432C1621.18 328.533 1630.22 316.075 1636.02 301.056C1642.17 285.696 1645.24 269.824 1645.24 253.44C1645.24 236.715 1642.17 220.843 1636.02 205.824C1630.22 190.805 1621.18 178.517 1608.89 168.96C1596.94 159.061 1581.92 154.112 1563.83 154.112ZM1865.71 394.24C1844.89 394.24 1827.65 391.339 1814 385.536C1800.68 379.733 1790.1 372.565 1782.25 364.032C1774.4 355.157 1768.6 346.453 1764.84 337.92C1761.09 329.045 1758.7 321.707 1757.68 315.904C1756.65 310.101 1756.14 307.2 1756.14 307.2H1805.29C1805.29 307.2 1805.8 309.589 1806.83 314.368C1808.19 318.805 1810.75 324.096 1814.51 330.24C1818.6 336.043 1824.75 341.333 1832.94 346.112C1841.47 350.549 1852.74 352.768 1866.73 352.768C1882.77 352.768 1895.23 349.013 1904.11 341.504C1912.98 333.653 1917.42 324.096 1917.42 312.832C1917.42 302.933 1913.84 295.083 1906.67 289.28C1899.84 283.477 1889.94 279.04 1876.97 275.968L1840.11 267.264C1826.45 263.851 1813.65 259.243 1801.71 253.44C1789.76 247.637 1780.03 239.787 1772.52 229.888C1765.36 219.648 1761.77 207.019 1761.77 192C1761.77 168.789 1770.48 149.845 1787.88 135.168C1805.29 120.149 1827.99 112.64 1855.98 112.64C1874.75 112.64 1890.28 115.371 1902.57 120.832C1914.86 125.952 1924.59 132.437 1931.76 140.288C1939.27 148.139 1944.73 155.989 1948.14 163.84C1951.89 171.691 1954.28 178.347 1955.31 183.808C1956.33 188.928 1956.84 191.488 1956.84 191.488H1909.74C1909.74 191.488 1909.23 189.611 1908.2 185.856C1907.18 181.76 1904.79 177.323 1901.04 172.544C1897.62 167.424 1892.33 162.987 1885.16 159.232C1878 155.136 1868.44 153.088 1856.49 153.088C1840.11 153.088 1828.16 156.843 1820.65 164.352C1813.14 171.861 1809.39 180.053 1809.39 188.928C1809.39 197.461 1812.8 204.459 1819.63 209.92C1826.8 215.04 1836.01 218.965 1847.28 221.696L1884.65 230.4C1907.86 235.861 1926.98 244.907 1942 257.536C1957.36 269.824 1965.04 287.573 1965.04 310.784C1965.04 325.803 1961.11 339.797 1953.26 352.768C1945.41 365.397 1934.15 375.467 1919.47 382.976C1904.79 390.485 1886.87 394.24 1865.71 394.24ZM2144.77 394.24C2122.59 394.24 2103.3 390.315 2086.92 382.464C2070.87 374.272 2057.56 363.349 2046.98 349.696C2036.74 336.043 2029.06 321.024 2023.94 304.64C2018.82 287.915 2016.26 270.848 2016.26 253.44C2016.26 236.373 2018.65 219.477 2023.43 202.752C2028.55 186.027 2036.23 170.837 2046.47 157.184C2057.05 143.531 2070.19 132.779 2085.89 124.928C2101.93 116.736 2120.88 112.64 2142.72 112.64C2165.93 112.64 2186.41 117.931 2204.16 128.512C2221.91 139.093 2235.91 154.795 2246.15 175.616C2256.39 196.437 2261.51 222.549 2261.51 253.952V268.288H2065.41C2066.44 283.648 2070.02 297.813 2076.16 310.784C2082.65 323.413 2091.69 333.653 2103.3 341.504C2114.91 349.013 2128.73 352.768 2144.77 352.768C2158.77 352.768 2170.03 350.549 2178.56 346.112C2187.44 341.333 2194.44 335.872 2199.56 329.728C2204.68 323.584 2208.09 318.293 2209.8 313.856C2211.84 309.077 2212.87 306.688 2212.87 306.688H2258.44C2258.44 306.688 2257.58 309.76 2255.88 315.904C2254.17 321.707 2251.1 328.875 2246.66 337.408C2242.22 345.941 2235.74 354.645 2227.2 363.52C2218.67 372.053 2207.75 379.392 2194.44 385.536C2181.12 391.339 2164.57 394.24 2144.77 394.24ZM2065.92 230.4H2213.89C2213.21 212.651 2209.45 198.315 2202.63 187.392C2195.8 176.128 2187.1 167.765 2176.52 162.304C2165.93 156.843 2154.67 154.112 2142.72 154.112C2121.22 154.112 2103.64 161.109 2089.99 175.104C2076.33 188.757 2068.31 207.189 2065.92 230.4Z"
          fill="currentColor"
        />
      </svg>
    </h1>
    ${raw(
      link(
        "/tables",
        "Tables",
        "tables",
        html`<svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="icon icon-tabler icons-tabler-outline icon-tabler-table"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path
            d="M3 5a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-14"
          />
          <path d="M3 10h18" />
          <path d="M10 3v18" />
        </svg>`.toString(),
      ),
    )}
    ${raw(
      link(
        "/schema/diagram",
        "Schema",
        "schema",
        html`<svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="icon icon-tabler icons-tabler-outline icon-tabler-sitemap"
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
    )}
    ${raw(
      link(
        "/migrations",
        "Migrations",
        "migrations",
        html`<svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="icon icon-tabler icons-tabler-outline icon-tabler-switch-vertical"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M3 8l4 -4l4 4" />
          <path d="M7 4l0 9" />
          <path d="M13 16l4 4l4 -4" />
          <path d="M17 10l0 10" />
        </svg>`.toString(),
      ),
    )}
    ${raw(
      link(
        "/backups",
        "Backups",
        "backups",
        html`<svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="icon icon-tabler icons-tabler-outline icon-tabler-database-export"
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
      ),
    )}`.toString();
}
