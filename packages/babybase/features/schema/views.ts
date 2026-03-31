import { html, raw } from "hono/html";
import { iconCrosshair, iconPlus, iconTable, iconTableOff } from "../../components/icons.ts";
import type { CameraState } from "../storage/queries.ts";
import { activeDbIndicator } from "../storage/views.ts";
import { cameraScript } from "./components/camera-script.ts";
import { createTableDialog } from "./components/create-table-dialog.ts";
import { editTableDialogShell } from "./components/edit-table-dialog.ts";
import { editsDialogShell, schemaActions } from "./components/edits-dialog.ts";
import { svgRelations } from "./components/svg-relations.ts";
import { tableBox, tableBoxStyles } from "./components/table-box.ts";
import { zoomControls } from "./components/zoom-controls.ts";
import type { DesiredColumn, TableSchema } from "./queries.ts";

const css = String.raw;

const diagramStyles = css`
  #main {
    overflow: hidden;
    height: 100vh;
  }
  .er-diagram {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }
  .er-diagram-body {
    position: relative;
    flex: 1;
    min-height: 0;
  }
  .er-diagram-controls {
    position: absolute;
    top: 1rem;
    left: 0;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100vw;
    gap: 6px;
  }
  #diagram-viewport {
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
  #canvas-wrap {
    transform-origin: 0 0;
    position: relative;
  }
  .canvas-svg {
    position: absolute;
    top: 0;
    left: 0;
    pointer-events: none;
    overflow: visible;
  }
  .er-diagram-empty {
    padding: 5rem 2rem 25vh;
    height: 100%;
  }
`;

export function erDiagramView(
  schema: TableSchema[],
  basePath: string,
  pendingColumns: Map<string, DesiredColumn[]> = new Map(),
  activeDatabase?: string,
  readonly = false,
  initialCamera?: CameraState,
  savedPositions: Record<string, { x: number; y: number }> = {},
) {
  if (schema.length === 0) {
    const base = basePath.replace(/\/$/, "");
    const activeDbName = activeDatabase
      ? (activeDatabase.split("/").pop() ?? activeDatabase)
      : "No database";
    return html`<style>
        ${diagramStyles}
      </style>
      <div data-signals="{_tableName: ''}" class="er-diagram">
        <div class="er-diagram-body">
          <div class="er-diagram-controls">
            <fieldset
              role="group"
                         >
              ${raw(activeDbIndicator(activeDbName, !!activeDatabase))}
            </fieldset>

            ${schemaActions(base, 0)}
          </div>
          ${editTableDialogShell()} ${editsDialogShell()}
          <div id="diagram-viewport">
            <div class="empty er-diagram-empty">
              ${iconTableOff(24)}
              <h3>No tables yet</h3>
              <p>
                Create your first table to start building your schema.
              </p>
              ${!readonly
                ? html`<button
                    data-on:click="$_editTableDialog.showModal(); @get('${base}/schema/new-table-dialog')"
                  >
                    ${iconPlus(12)} New table
                  </button>`
                : ""}
            </div>
          </div>
        </div>
      </div>`;
  }

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
    const saved = savedPositions[t.name];
    positions[t.name] = {
      x: saved?.x ?? PAD / 2 + col * (BOX_W + COL_GAP),
      y: saved?.y ?? rowYOffsets[row] ?? PAD,
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
  const activeDbName = activeDatabase
    ? (activeDatabase.split("/").pop() ?? activeDatabase)
    : "No database";

  const cix = initialCamera?.x ?? 0;
  const ciy = initialCamera?.y ?? 0;
  const ciz = initialCamera?.z ?? 1;
  const canvasTransform = `matrix(${ciz},0,0,${ciz},${ciz * cix},${ciz * ciy})`;

  return html`<style>
      ${diagramStyles}
      ${tableBoxStyles}
    </style>
    <div data-signals="{_tableName: ''}" class="er-diagram">
      <div class="er-diagram-body">
        <div class="er-diagram-controls">
          <fieldset role="group">
            ${raw(activeDbIndicator(activeDbName, !!activeDatabase))}
          </fieldset>

          ${!readonly
            ? html`
                <fieldset
                  role="group"
                                 >
                  ${createTableDialog(base)}
                </fieldset>
              `
            : ""}

          ${zoomControls()}

          <fieldset role="group">
            <button
              id="reset-view"
              data-tooltip="Reset view"
              data-placement="bottom"
              class="ghost square"
            >
              ${iconCrosshair(16)}
            </button>
          </fieldset>

          ${schemaActions(base, readonly ? 0 : pendingCount)}
        </div>

        ${editTableDialogShell()} ${editsDialogShell()}

        <div id="diagram-viewport">
          <div
            id="canvas-wrap"
            style="width:${canvasW}px;height:${canvasH}px;touch-action: none;transform:${canvasTransform};"
          >
            <svg
              width="${canvasW}"
              height="${canvasH}"
              xmlns="http://www.w3.org/2000/svg"
              class="canvas-svg"
            >
              ${svgRelations(schema, positions, BOX_W, BOX_HEADER_H, ROW_H)}
            </svg>
            ${schema.map((t) =>
              tableBox(
                t,
                positions[t.name] ?? { x: 0, y: 0, h: 0 },
                BOX_W,
                BOX_HEADER_H,
                ROW_H,
                base,
                pendingColumns.get(t.name) ?? null,
                readonly,
              ),
            )}
          </div>
        </div>
        ${cameraScript(BOX_W, BOX_HEADER_H, ROW_H, base, initialCamera)}
      </div>
    </div>`;
}
