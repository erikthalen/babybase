import { html, raw } from "hono/html";
import type { TableSchema, DesiredColumn } from "./queries.ts";
import { tabBar } from "./components/tab-bar.ts";
import { tableBox } from "./components/table-box.ts";
import { svgRelations } from "./components/svg-relations.ts";
import { cameraScript } from "./components/camera-script.ts";
import { zoomControls } from "./components/zoom-controls.ts";
import { createTableDialog } from "./components/create-table-dialog.ts";
import { editTableDialogShell } from "./components/edit-table-dialog.ts";

export function schemaListView(
  schema: TableSchema[],
  _basePath: string,
): string {
  const tables = schema
    .map((t) => {
      const cols = t.columns
        .map((c) => {
          const fkBadge = t.foreignKeys.some((fk) => fk.from === c.name)
            ? '<span class="badge fk">FK</span> '
            : "";
          const pkBadge = c.pk ? '<span class="badge pk">PK</span> ' : "";
          const nnBadge =
            c.notnull && !c.pk ? '<span class="badge">NN</span> ' : "";
          const dflt =
            c.dflt_value != null
              ? `<span class="text-faint">${String(c.dflt_value)}</span>`
              : "";
          return `<tr><td>${c.name}</td><td class="text-muted" style="font-family: var(--pb-monospace)">${c.type || "ANY"}</td><td>${pkBadge}${fkBadge}${nnBadge}</td><td>${dflt}</td></tr>`;
        })
        .join("\n");
      return `<div style="margin-bottom:2rem;border-bottom: 1px solid var(--pb-border);">
        <h3 style="font-size:1rem;font-weight:500;margin:0.5rem;display:flex;align-items:center;gap:0.25rem">
          <svg
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
        </svg>
        ${t.name}
        </h3>
        <table class="even">
          <thead>
            <tr>
              <th>Column</th>
              <th>Type</th>
              <th>Flags</th>
              <th>Default</th>
            </tr>
          </thead>
          <tbody>
            ${cols}
          </tbody>
        </table>
      </div>`;
		})
		.join("\n");

  return String(
    html`${tabBar()}
      <div id="schema-content">${raw(tables)}</div>`,
	);
}

export function erDiagramView(
  schema: TableSchema[],
  basePath: string,
  pendingColumns: Map<string, DesiredColumn[]> = new Map(),
): string {
  const BOX_W = 260;
  const ROW_H = 36;
  const BOX_HEADER_H = 32;
  const COL_GAP = 80;
  const ROW_GAP = 60;
  const COLS = Math.max(1, Math.ceil(Math.sqrt(schema.length)));
  const PAD = 60;

	const boxes = schema.map((t, i) => {
		const col = i % COLS;
		const row = Math.floor(i / COLS);
		const h = BOX_HEADER_H + t.columns.length * ROW_H;
		return { t, col, row, h };
	});

  const rowYOffsets: number[] = [];
  const numRows = Math.ceil(schema.length / COLS);
  let canvasContentH = PAD;
  for (let r = 0; r < numRows; r++) {
    rowYOffsets[r] = canvasContentH;
    const rowBoxes = boxes.filter((b) => b.row === r);
    const maxH =
      rowBoxes.length > 0 ? Math.max(...rowBoxes.map((b) => b.h)) : 0;
    canvasContentH += maxH + ROW_GAP;
  }

	const positions: Record<string, { x: number; y: number; h: number }> = {};
	boxes.forEach(({ t, col, row, h }) => {
		positions[t.name] = {
			x: PAD / 2 + col * (BOX_W + COL_GAP),
			y: rowYOffsets[row] ?? PAD,
			h,
		};
	});

  const canvasW = Math.max(
    2000,
    PAD * 2 + COLS * BOX_W + (COLS - 1) * COL_GAP + 400,
  );
  const canvasH = Math.max(2000, canvasContentH + 400);
  const base = basePath.replace(/\/$/, "");
  const pendingCount = pendingColumns.size;

  return String(
    html`<style>
        #main {
          overflow: hidden;
          height: 100vh;
        }
      </style>
      <div
        data-signals="{_tableName: ''}"
        style="display:flex;flex-direction:column;height:100%;overflow:hidden"
      >
        ${tabBar()}
        <div style="position:relative;flex:1;min-height:0">
          <div
            style="position:absolute;top:1rem;left:1rem;z-index:10;display:flex;align-items:center;gap:0.5rem"
          >
            ${createTableDialog(base)}
            ${pendingCount > 0
              ? html`<button
                  id="publish-btn"
                  class="primary"
                  data-on:click="@post('${base}/schema/publish')"
                >
                  Publish (${pendingCount})
                </button>`
              : html`<span id="publish-btn" style="display:none"></span>`}
          </div>

          ${editTableDialogShell()} ${zoomControls()}

          <div
            id="diagram-viewport"
            style="width:100%;height:100%;overflow:hidden;background:var(--pb-diagram-bg);"
          >
            <div
              id="canvas-wrap"
              style="transform-origin:0 0;position:relative;width:${canvasW}px;height:${canvasH}px;"
            >
              <svg
                width="${canvasW}"
                height="${canvasH}"
                xmlns="http://www.w3.org/2000/svg"
                style="position:absolute;top:0;left:0;pointer-events:none;overflow:visible"
              >
                ${svgRelations(schema, positions, BOX_W, BOX_HEADER_H, ROW_H)}
              </svg>
              ${schema.map((t) =>
                tableBox(
                  t,
                  positions[t.name]!,
                  BOX_W,
                  BOX_HEADER_H,
                  ROW_H,
                  base,
                  pendingColumns.get(t.name) ?? null,
                ),
              )}
            </div>
          </div>
          ${cameraScript(BOX_W, BOX_HEADER_H, ROW_H)}
        </div>
      </div>`,
	);
}
