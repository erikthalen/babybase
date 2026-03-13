import { serve } from "@hono/node-server";
import { Hono } from "hono";
import {
  iconArrowDown,
  iconArrowLeft,
  iconArrowUp,
  iconArrowsUpDown,
  iconBraces,
  iconCalendar,
  iconCheck,
  iconCrosshair,
  iconFile,
  iconFileCode,
  iconHash,
  iconKey,
  iconLetterT,
  iconLink,
  iconMinus,
  iconNavMigrations,
  iconNavSchema,
  iconNavStorage,
  iconPencil,
  iconPlus,
  iconTable,
  iconTableOff,
  iconTablePlus,
  iconToggleLeft,
  iconUpload,
  iconX,
} from "../index.ts";
import { activeDbIndicatorExample } from "../components/active-db-indicator/active-db-indicator.ts";
import { badgeExample } from "../components/badge/badge.ts";
import { confirmDialogExample } from "../components/confirm-dialog/confirm-dialog.ts";
import { buttonGroupExample } from "../components/button-group/button-group.ts";
import { buttonExample } from "../components/button/button.ts";
import { checkboxExample } from "../components/checkbox/checkbox.ts";
import { dropdownExample } from "../components/dropdown/dropdown.ts";
import { emptyStateExample } from "../components/empty-state/empty-state.ts";
import { inputExample } from "../components/input/input.ts";
import { kbdExample } from "../components/kbd/kbd.ts";
import { sqlHighlightExample } from "../components/sql-highlight/sql-highlight.ts";
import { tableTabsExample } from "../components/table-tabs/table-tabs.ts";
import { uploadZoneExample } from "../components/upload-zone/upload-zone.ts";
import { paginationExample } from "../components/pagination/pagination.ts";
import { tableExample } from "../components/table/table.ts";
import { toastExample } from "../components/toast/toast.ts";
import { tooltipExample } from "../components/tooltip/tooltip.ts";
import { gettingStartedPage } from "./getting-started.ts";
import { previews } from "./previews.ts";
import { componentPage, shell } from "./shell.ts";

const ICONS: { name: string; fn: (size?: number) => unknown }[] = [
  { name: "arrow-down", fn: iconArrowDown },
  { name: "arrow-left", fn: iconArrowLeft },
  { name: "arrow-up", fn: iconArrowUp },
  { name: "arrows-up-down", fn: iconArrowsUpDown },
  { name: "braces", fn: iconBraces },
  { name: "calendar", fn: iconCalendar },
  { name: "check", fn: iconCheck },
  { name: "crosshair", fn: iconCrosshair },
  { name: "file", fn: iconFile },
  { name: "file-code", fn: iconFileCode },
  { name: "hash", fn: iconHash },
  { name: "key", fn: iconKey },
  { name: "letter-t", fn: iconLetterT },
  { name: "link", fn: iconLink },
  { name: "minus", fn: iconMinus },
  { name: "nav-migrations", fn: iconNavMigrations },
  { name: "nav-schema", fn: iconNavSchema },
  { name: "nav-storage", fn: iconNavStorage },
  { name: "pencil", fn: iconPencil },
  { name: "plus", fn: iconPlus },
  { name: "table", fn: iconTable },
  { name: "table-off", fn: iconTableOff },
  { name: "table-plus", fn: iconTablePlus },
  { name: "toggle-left", fn: iconToggleLeft },
  { name: "upload", fn: iconUpload },
  { name: "x", fn: iconX },
];

const iconsPage = `
  <style>
    .icons-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
      gap: 1px;
      background: var(--border);
      border: 1px solid var(--border);
      width: 100%;
    }
    .icon-cell {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.6rem;
      padding: 1.25rem 0.5rem;
      background: var(--bg);
      color: var(--text);
    }
    .icon-cell:hover { background: var(--surface); }
    .icon-name {
      font-size: 10px;
      color: var(--text-faint);
      font-family: var(--font-mono);
      text-align: center;
      word-break: break-all;
    }
  </style>
  <div class="icons-grid">
    ${ICONS.map(({ name, fn }) => `
    <div class="icon-cell">
      ${fn(20)}
      <div class="icon-name">${name}</div>
    </div>`).join("")}
  </div>`;

const app = new Hono();

app.get("/", (c) => c.redirect("/getting-started"));
app.get("/getting-started", (c) => c.html(shell("getting started", gettingStartedPage)));

app.get("/icons", (c) => c.html(shell("icons", iconsPage)));

app.get("/components/tooltip", (c) => c.html(componentPage("tooltip", tooltipExample)));
app.get("/components/pagination", (c) => c.html(componentPage("pagination", paginationExample)));
app.get("/components/toast", (c) => c.html(componentPage("toast", toastExample)));
app.get("/components/active-db-indicator", (c) => c.html(componentPage("active-db-indicator", activeDbIndicatorExample)));
app.get("/components/badge", (c) => c.html(componentPage("badge", badgeExample)));
app.get("/components/confirm-dialog", (c) => c.html(componentPage("confirm-dialog", confirmDialogExample)));
app.get("/components/empty-state", (c) => c.html(componentPage("empty-state", emptyStateExample)));
app.get("/components/button", (c) => c.html(componentPage("button", buttonExample)));
app.get("/components/button-group", (c) => c.html(componentPage("button-group", buttonGroupExample)));
app.get("/components/checkbox", (c) => c.html(componentPage("checkbox", checkboxExample)));
app.get("/components/dropdown", (c) => c.html(componentPage("dropdown", dropdownExample)));
app.get("/components/input", (c) => c.html(componentPage("input", inputExample)));
app.get("/components/kbd", (c) => c.html(componentPage("kbd", kbdExample)));
app.get("/components/sql-highlight", (c) => c.html(componentPage("sql-highlight", sqlHighlightExample)));
app.get("/components/table-tabs", (c) => c.html(componentPage("table-tabs", tableTabsExample)));
app.get("/components/upload-zone", (c) => c.html(componentPage("upload-zone", uploadZoneExample)));
app.get("/components/table", (c) => c.html(componentPage("table", tableExample)));

app.get("/components/:name", (c) => {
  const name = c.req.param("name");
  const content =
    previews[name] ??
    `<p style="color: var(--text-muted)">No preview for <code>${name}</code>.</p>`;
  return c.html(shell(name, content));
});

serve({ fetch: app.fetch, port: 3010 }, () => {
  console.log("UI dev server: http://localhost:3010");
});
