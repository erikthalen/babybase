import { html, raw } from "hono/html";
import type { TableSchema } from "./queries.ts";

const header = html`
  <nav id="table-tabs" class="tab-bar">
    <a href="/schema">Schema</a>
    <a href="/schema/diagram">ER Diagram</a>
  </nav>
`;

export function schemaListView(
  schema: TableSchema[],
  basePath: string,
): string {
  const base = basePath.replace(/\/$/, "");
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
    html`${header}
      <div id="schema-content">${raw(tables)}</div>`,
  );
}

/**
 * Orthogonal path router: 10 px stubs + up-to-16 px adaptive corners.
 * Detects fold-back (overlapping boxes on routing side) and uses a
 * right-channel U-shape for same-column or fold cases.
 * Nudges the vertical segment away from any box it would cross.
 */
function routePath(
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  fromColIdx: number,
  toColIdx: number,
  allPositions: Record<string, { x: number; y: number; h: number }>,
  BW: number,
  BH: number,
  RH: number,
): string {
  const ST = 10; // exit/entry stub length
  const R = 16; // max corner radius
  const y1 = fromY + BH + fromColIdx * RH + RH / 2;
  const y2 = toY + BH + toColIdx * RH + RH / 2;
  const sv = y2 >= y1 ? 1 : -1;

  const sh = toX >= fromX ? 1 : -1;
  const px1 = sh > 0 ? fromX + BW : fromX;
  const px2 = sh > 0 ? toX : toX + BW;
  // Switch to U-shape when routing edges are within 25 px — gives stub+corner room
  const FOLD_THRESHOLD = 50;
  const willFold =
    sh > 0 ? px2 < px1 + FOLD_THRESHOLD : px2 > px1 - FOLD_THRESHOLD;

  // Same-column or fold-back → U-shape via right-side channel
  if (Math.abs(fromX - toX) < 2 || willFold) {
    const cx = Math.max(fromX, toX) + BW + ST;
    const vertDist = Math.abs(y2 - y1);
    const r = Math.min(R, vertDist / 2);
    if (r < 0.5) return `M${fromX + BW},${y1} H${cx} H${toX + BW}`;
    let d = `M${fromX + BW},${y1} H${cx - r} Q${cx},${y1} ${cx},${y1 + sv * r}`;
    if (vertDist > 2 * r + 0.5) d += ` V${y2 - sv * r}`;
    d += ` Q${cx},${y2} ${cx - r},${y2} H${toX + BW}`;
    return d;
  }

  const ax = px1 + sh * ST;
  const bx = px2 - sh * ST;

  if (Math.abs(y2 - y1) < 2) return `M${px1},${y1} H${px2}`;

  // Start vx at midpoint then nudge away from any box the vertical would intersect
  let vx = (ax + bx) / 2;
  const yMin = Math.min(y1, y2);
  const yMax = Math.max(y1, y2);

  for (let iter = 0; iter < 4; iter++) {
    for (const p of Object.values(allPositions)) {
      if (vx > p.x + 2 && vx < p.x + BW - 2 && yMax > p.y && yMin < p.y + p.h) {
        const dLeft = vx - p.x;
        const dRight = p.x + BW - vx;
        vx = dLeft <= dRight ? p.x - R : p.x + BW + R;
      }
    }
  }

  // Clamp so corners always have room
  vx =
    sh > 0
      ? Math.max(ax + R, Math.min(bx - R, vx))
      : Math.min(ax - R, Math.max(bx + R, vx));

  // Adaptive corner radius: up to R, smaller when rows are close vertically
  const r = Math.min(R, Math.abs(y2 - y1) / 2);

  const c1x = vx - sh * r;
  const c1y = y1 + sv * r;
  const c2y = y2 - sv * r;
  const c2x = vx + sh * r;

  const s: string[] = [`M${px1},${y1}`, `H${ax}`];
  if (Math.abs(ax - c1x) > 0.5) s.push(`H${c1x}`);
  s.push(`Q${vx},${y1} ${vx},${c1y}`);
  if (Math.abs(c1y - c2y) > 0.5) s.push(`V${c2y}`);
  s.push(`Q${vx},${y2} ${c2x},${y2}`);
  if (Math.abs(c2x - bx) > 0.5) s.push(`H${bx}`);
  s.push(`H${px2}`);
  return s.join(" ");
}

export function erDiagramView(schema: TableSchema[], basePath: string): string {
  const BOX_W = 260;
  const ROW_H = 36;
  const BOX_HEADER_H = 32;
  const COL_GAP = 80;
  const ROW_GAP = 60;
  const COLS = Math.max(1, Math.ceil(Math.sqrt(schema.length)));
  const PAD = 40;
  const DRAG_EXTRA = 400; // extra canvas room for dragging

  const boxes = schema.map((t, i) => {
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    const h = BOX_HEADER_H + t.columns.length * ROW_H;
    return { t, col, row, h };
  });

  const rowYOffsets: number[] = [];
  const numRows = Math.ceil(schema.length / COLS);
  let y = PAD;
  for (let r = 0; r < numRows; r++) {
    rowYOffsets[r] = y;
    const rowBoxes = boxes.filter((b) => b.row === r);
    const maxH = Math.max(...rowBoxes.map((b) => b.h));
    y += maxH + ROW_GAP;
  }

  const positions: Record<string, { x: number; y: number; h: number }> = {};
  boxes.forEach(({ t, col, row, h }) => {
    positions[t.name] = {
      x: PAD + col * (BOX_W + COL_GAP),
      y: rowYOffsets[row] ?? PAD,
      h,
    };
  });

  const svgW = PAD * 2 + COLS * BOX_W + (COLS - 1) * COL_GAP + DRAG_EXTRA;
  const svgH = y + DRAG_EXTRA;

  // Each box is a <g transform="translate(x,y)"> so coordinates are relative —
  // the JS drag handler just updates the transform attribute.
  const svgBoxes = schema.map((t) => {
    const pos = positions[t.name]!;
    const colRows = t.columns.map((c, ci) => {
      const fk = t.foreignKeys.some((f) => f.from === c.name) ? "⤷ " : "";

      const alt =
        ci === t.columns.length - 1
          ? html`<path
              d="M0 ${BOX_HEADER_H + ci * ROW_H} H${BOX_W} V${BOX_HEADER_H +
              ci * ROW_H +
              ROW_H -
              8} A8 8 0 0 1 ${BOX_W - 8} ${BOX_HEADER_H +
              ci * ROW_H +
              ROW_H} H8 A8 8 0 0 1 0 ${BOX_HEADER_H + ci * ROW_H + ROW_H - 8} Z"
              fill="${ci % 2 === 1
                ? "var(--pb-diagram-row-alt)"
                : "var(--pb-bg)"}"
            />`
          : html`<rect
              x="0"
              y="${BOX_HEADER_H + ci * ROW_H}"
              width="${BOX_W}"
              height="${ROW_H}"
              style="fill:${ci % 2 === 1
                ? "var(--pb-diagram-row-alt)"
                : "var(--pb-bg)"}"
            />`;

      return html`${alt}
        ${c.pk
          ? html`<!-- key icon -->
              <g
                transform="translate(10,45) scale(0.45)"
                fill="var(--pb-text-heading)"
                pointer-events="none"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" /><path
                  d="M14.52 2c1.029 0 2.015 .409 2.742 1.136l3.602 3.602a3.877 3.877 0 0 1 0 5.483l-2.643 2.643a3.88 3.88 0 0 1 -4.941 .452l-.105 -.078l-5.882 5.883a3 3 0 0 1 -1.68 .843l-.22 .027l-.221 .009h-1.172c-1.014 0 -1.867 -.759 -1.991 -1.823l-.009 -.177v-1.172c0 -.704 .248 -1.386 .73 -1.96l.149 -.161l.414 -.414a1 1 0 0 1 .707 -.293h1v-1a1 1 0 0 1 .883 -.993l.117 -.007h1v-1a1 1 0 0 1 .206 -.608l.087 -.1l1.468 -1.469l-.076 -.103a3.9 3.9 0 0 1 -.678 -1.963l-.007 -.236c0 -1.029 .409 -2.015 1.136 -2.742l2.643 -2.643a3.88 3.88 0 0 1 2.741 -1.136m.495 5h-.02a2 2 0 1 0 0 4h.02a2 2 0 1 0 0 -4"
                />
              </g>`
          : ""}

        <text
          x="${10 + (c.pk ? 16 : 0)}"
          y="${BOX_HEADER_H + 14 + ci * ROW_H + 8}"
          font-size="11"
          style="fill:var(--pb-text-heading)"
          pointer-events="none"
        >
          ${fk}${c.name}${c.dflt_value ? ` = ${String(c.dflt_value)}` : ""}
        </text>
        <text
          x="${BOX_W - 10}"
          y="${BOX_HEADER_H + 14 + ci * ROW_H + 8}"
          font-size="10"
          style="fill:var(--pb-text-faint);font-family:var(--pb-monospace);letter-spacing: 0.05em;"
          text-anchor="end"
          pointer-events="none"
          >${c.type || "ANY"}</text
        >`;
    });

    return html`<g
      data-table="${t.name}"
      data-h="${pos.h}"
      transform="translate(${pos.x},${pos.y})"
    >
      <rect
        x="0"
        y="0"
        width="${BOX_W}"
        height="${pos.h}"
        rx="8"
        style="fill:var(--pb-surface);stroke:var(--pb-border)"
        stroke-width="1"
      />
      <rect
        x="0"
        y="0"
        width="${BOX_W}"
        height="${BOX_HEADER_H}"
        rx="8"
        data-header="true"
        style="fill:var(--pb-diagram-header);cursor:grab"
      />
      <rect
        x="0"
        y="${BOX_HEADER_H - 6}"
        width="${BOX_W}"
        height="6"
        style="fill:var(--pb-diagram-header)"
        pointer-events="none"
      />
      <line
        x1="0"
        y1="${BOX_HEADER_H}"
        x2="${BOX_W}"
        y2="${BOX_HEADER_H}"
        style="stroke:var(--pb-border)"
        stroke-width="1"
        pointer-events="none"
      />
      <g
        transform="translate(12,10) scale(0.55)"
        stroke="var(--pb-diagram-title)"
        fill="none"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        pointer-events="none"
      >
        <path stroke="none" d="M0 0h24v24H0z" />
        <path
          d="M3 5a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v14
             a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-14"
        />
        <path d="M3 10h18" />
        <path d="M10 3v18" />
      </g>
      <text
        x="30"
        y="21"
        font-size="12"
        font-weight="500"
        style="fill:var(--pb-diagram-title)"
        pointer-events="none"
      >
        ${t.name}
      </text>
      ${colRows}
    </g>`;
  });

  // Paths carry data-* attributes so the drag script can recalculate them live.
  // Rendered before boxes so lines appear behind.
  const svgLines = schema.flatMap((t) =>
    t.foreignKeys.map((fk) => {
      const from = positions[t.name];
      const to = positions[fk.table];
      if (!from || !to) return "";
      const fromColIdx = t.columns.findIndex((c) => c.name === fk.from);
      const targetSchema = schema.find((s) => s.name === fk.table);
      const toColIdx =
        targetSchema?.columns.findIndex((c) => c.name === fk.to) ?? 0;
      if (fromColIdx === -1) return "";
      const safeToCol = toColIdx === -1 ? 0 : toColIdx;
      const d = routePath(
        from.x,
        from.y,
        to.x,
        to.y,
        fromColIdx,
        safeToCol,
        positions,
        BOX_W,
        BOX_HEADER_H,
        ROW_H,
      );
      return html` <path
        data-from="${t.name}"
        data-to="${fk.table}"
        data-from-col="${fromColIdx}"
        data-to-col="${safeToCol}"
        d="${d}"
        fill="none"
        style="stroke:var(--pb-diagram-relation)"
        stroke-width="1.5"
        stroke-dasharray="7,7"
      >
        <animate
          attributeName="stroke-dashoffset"
          from="0"
          to="-14"
          dur="0.75s"
          repeatCount="indefinite"
      /></path>`;
    }),
  );

  // Inline drag script — uses SVG's getScreenCTM() for correct coordinate mapping
  // regardless of scroll position or CSS transforms.
  const dragScript = html` <script>
    (function () {
      var svg = document.currentScript.closest("svg");
      var BW = ${BOX_W},
        BH = ${BOX_HEADER_H},
        RH = ${ROW_H};
      var pos = {};
      svg.querySelectorAll("g[data-table]").forEach(function (g) {
        var m = /translate\\(([-\\d.]+),([-\\d.]+)\\)/.exec(
          g.getAttribute("transform"),
        );
        if (m)
          pos[g.dataset.table] = {
            x: parseFloat(m[1]),
            y: parseFloat(m[2]),
            h: parseFloat(g.dataset.h),
          };
      });

      // Orthogonal path builder — mirrors the server-side routePath function.
      // Uses only > and >= comparisons (no < in script body for SVG safety).
      function bp(f, t, fc, tc) {
        var ST = 10,
          R = 16;
        var y1 = f.y + BH + fc * RH + RH / 2;
        var y2 = t.y + BH + tc * RH + RH / 2;
        var sv = y2 >= y1 ? 1 : -1;
        var adx = t.x > f.x ? t.x - f.x : f.x - t.x;
        var sh = t.x >= f.x ? 1 : -1;
        var px1 = sh > 0 ? f.x + BW : f.x;
        var px2 = sh > 0 ? t.x : t.x + BW;
        var FOLD_THRESHOLD = 50;
        var willFold =
          sh > 0
            ? !(px2 - px1 >= FOLD_THRESHOLD)
            : !(px1 - px2 >= FOLD_THRESHOLD);
        // Same-column or fold-back — U-shape via right-side channel
        if (!(adx >= 2) || willFold) {
          var cx = f.x > t.x ? f.x + BW + ST : t.x + BW + ST;
          var vertDist = y2 > y1 ? y2 - y1 : y1 - y2;
          var r = vertDist / 2 > R ? R : vertDist / 2;
          if (!(r > 0.5))
            return "M" + (f.x + BW) + "," + y1 + " H" + cx + " H" + (t.x + BW);
          var ud =
            "M" +
            (f.x + BW) +
            "," +
            y1 +
            " H" +
            (cx - r) +
            " Q" +
            cx +
            "," +
            y1 +
            " " +
            cx +
            "," +
            (y1 + sv * r);
          var rem = vertDist - 2 * r;
          if (rem > 0.5) ud += " V" + (y2 - sv * r);
          ud +=
            " Q" +
            cx +
            "," +
            y2 +
            " " +
            (cx - r) +
            "," +
            y2 +
            " H" +
            (t.x + BW);
          return ud;
        }
        var ax = px1 + sh * ST,
          bx = px2 - sh * ST;
        var ady = y2 > y1 ? y2 - y1 : y1 - y2;
        if (!(ady >= 2)) return "M" + px1 + "," + y1 + " H" + px2;
        var vx = (ax + bx) / 2;
        var yMax = y1 > y2 ? y1 : y2;
        var yMin = y1 + y2 - yMax;
        for (var k in pos) {
          var bb = pos[k];
          if (
            vx > bb.x + 2 &&
            bb.x + BW - 2 > vx &&
            bb.y + bb.h > yMin &&
            yMax > bb.y
          ) {
            var dl = vx - bb.x,
              dr = bb.x + BW - vx;
            vx = dl > dr ? bb.x + BW + R : bb.x - R;
          }
        }
        if (sh > 0) {
          if (!(vx >= ax + R)) vx = ax + R;
          if (vx > bx - R) vx = bx - R;
        } else {
          if (vx > ax - R) vx = ax - R;
          if (!(vx >= bx + R)) vx = bx + R;
        }
        var r2 = ady / 2 > R ? R : ady / 2;
        var c1x = vx - sh * r2,
          c1y = y1 + sv * r2,
          c2y = y2 - sv * r2,
          c2x = vx + sh * r2;
        var d = "M" + px1 + "," + y1 + " H" + ax;
        var dax = ax > c1x ? ax - c1x : c1x - ax;
        if (dax > 0.5) d += " H" + c1x;
        d += " Q" + vx + "," + y1 + " " + vx + "," + c1y;
        var dv = c1y > c2y ? c1y - c2y : c2y - c1y;
        if (dv > 0.5) d += " V" + c2y;
        d += " Q" + vx + "," + y2 + " " + c2x + "," + y2;
        var dbx = c2x > bx ? c2x - bx : bx - c2x;
        if (dbx > 0.5) d += " H" + bx;
        d += " H" + px2;
        return d;
      }

      var drag = null,
        s0 = null,
        p0 = null;
      svg.addEventListener("mousedown", function (e) {
        if (!e.target.getAttribute || !e.target.getAttribute("data-header"))
          return;
        var g = e.target.closest("g[data-table]");
        if (!g) return;
        drag = g;
        var pt = svg.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;
        s0 = pt.matrixTransform(svg.getScreenCTM().inverse());
        p0 = { x: pos[g.dataset.table].x, y: pos[g.dataset.table].y };
        e.target.style.cursor = "grabbing";
        e.preventDefault();
      });
      window.addEventListener("mousemove", function (e) {
        if (!drag) return;
        var pt = svg.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;
        var sp = pt.matrixTransform(svg.getScreenCTM().inverse());
        var nx = p0.x + sp.x - s0.x,
          ny = p0.y + sp.y - s0.y;
        pos[drag.dataset.table] = {
          x: nx,
          y: ny,
          h: pos[drag.dataset.table].h,
        };
        drag.setAttribute("transform", "translate(" + nx + "," + ny + ")");
        svg.querySelectorAll("path[data-from]").forEach(function (p) {
          var f = pos[p.dataset.from],
            t = pos[p.dataset.to];
          if (!f || !t) return;
          p.setAttribute("d", bp(f, t, +p.dataset.fromCol, +p.dataset.toCol));
        });
      });
      window.addEventListener("mouseup", function () {
        if (drag) {
          drag.querySelector("rect[data-header]").style.cursor = "grab";
          drag = null;
        }
      });
    })();
  </script>`;

  return String(
    html`${header}
      <div id="schema-content" style="overflow:auto">
        <svg
          width="${svgW}"
          height="${svgH}"
          xmlns="http://www.w3.org/2000/svg"
          style="background:var(--pb-diagram-bg);border-radius:8px;display:block;min-width: 100%;"
        >
          ${svgLines} ${svgBoxes} ${raw(dragScript)}
        </svg>
      </div>`,
  );
}
