import { html } from "hono/html";
import type { TableSchema } from "../queries.ts";

type Pos = Record<string, { x: number; y: number; h: number }>;

function buildCornerPath(
  pts: Array<{ x: number; y: number }>,
  R: number,
): string {
  let d = `M${pts[0].x},${pts[0].y}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const prev = pts[i - 1],
      curr = pts[i],
      next = pts[i + 1];
    const dx1 = curr.x - prev.x,
      dy1 = curr.y - prev.y;
    const dx2 = next.x - curr.x,
      dy2 = next.y - curr.y;
    const len1 = Math.hypot(dx1, dy1),
      len2 = Math.hypot(dx2, dy2);
    if (len1 < 0.5 || len2 < 0.5) continue;
    const r = Math.min(R, len1 / 2, len2 / 2);
    d += ` L${curr.x - (dx1 / len1) * r},${curr.y - (dy1 / len1) * r}`;
    d += ` Q${curr.x},${curr.y} ${curr.x + (dx2 / len2) * r},${curr.y + (dy2 / len2) * r}`;
  }
  d += ` L${pts[pts.length - 1].x},${pts[pts.length - 1].y}`;
  return d;
}

function isHBlocked(
  x1: number,
  x2: number,
  y: number,
  pos: Pos,
  BW: number,
): boolean {
  const xl = Math.min(x1, x2),
    xr = Math.max(x1, x2);
  return Object.values(pos).some(
    (p) =>
      xl < p.x + BW - 2 && xr > p.x + 2 && y > p.y + 2 && y < p.y + p.h - 2,
  );
}

function isVBlocked(
  x: number,
  ya: number,
  yb: number,
  pos: Pos,
  BW: number,
): boolean {
  const yt = Math.min(ya, yb),
    ybot = Math.max(ya, yb);
  return Object.values(pos).some(
    (p) =>
      x > p.x + 2 && x < p.x + BW - 2 && yt < p.y + p.h - 2 && ybot > p.y + 2,
  );
}

/** Returns the x of the primary vertical routing segment (vx for direct, cx for fold). */
function computeVx(
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  fromColIdx: number,
  toColIdx: number,
  pos: Pos,
  BW: number,
  BH: number,
  RH: number,
): number {
  const ST = 10,
    R = 16;
  const y1 = fromY + BH + fromColIdx * RH + RH / 2;
  const y2 = toY + BH + toColIdx * RH + RH / 2;
  const sh = toX >= fromX ? 1 : -1;
  const px1 = sh > 0 ? fromX + BW : fromX;
  const px2 = sh > 0 ? toX : toX + BW;
  const willFold = sh > 0 ? px2 < px1 + 50 : px2 > px1 - 50;
  if (Math.abs(fromX - toX) < 2 || willFold) {
    let cx = Math.max(fromX, toX) + BW + ST;
    for (let i = 0; i < 20 && isVBlocked(cx, y1, y2, pos, BW); i++) cx += R * 2;
    return cx;
  }
  const ax = px1 + sh * ST,
    bx = px2 - sh * ST;
  const yMin = Math.min(y1, y2),
    yMax = Math.max(y1, y2);
  let vx = (ax + bx) / 2;
  for (let iter = 0; iter < 8; iter++) {
    for (const p of Object.values(pos)) {
      if (vx > p.x + 2 && vx < p.x + BW - 2 && yMax > p.y && yMin < p.y + p.h) {
        vx = vx - p.x <= p.x + BW - vx ? p.x - R : p.x + BW + R;
      }
    }
  }
  return sh > 0
    ? Math.max(ax + R, Math.min(bx - R, vx))
    : Math.min(ax - R, Math.max(bx + R, vx));
}

function routePath(
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  fromColIdx: number,
  toColIdx: number,
  allPositions: Pos,
  BW: number,
  BH: number,
  RH: number,
  laneOffset: number,
): string {
  const ST = 10,
    R = 16,
    MARGIN = 24;
  const y1 = fromY + BH + fromColIdx * RH + RH / 2;
  const y2 = toY + BH + toColIdx * RH + RH / 2;
  const sv = y2 >= y1 ? 1 : -1;
  const sh = toX >= fromX ? 1 : -1;
  const px1 = sh > 0 ? fromX + BW : fromX;
  const px2 = sh > 0 ? toX : toX + BW;
  const willFold = sh > 0 ? px2 < px1 + 50 : px2 > px1 - 50;

  if (Math.abs(fromX - toX) < 2 || willFold) {
    let cx = Math.max(fromX, toX) + BW + ST;
    for (let i = 0; i < 20 && isVBlocked(cx, y1, y2, allPositions, BW); i++)
      cx += R * 2;
    cx += laneOffset;
    const vertDist = Math.abs(y2 - y1);
    const r = Math.min(R, vertDist / 2);
    if (r < 0.5) return `M${fromX + BW},${y1} H${cx} H${toX + BW}`;
    let d = `M${fromX + BW},${y1} H${cx - r} Q${cx},${y1} ${cx},${y1 + sv * r}`;
    if (vertDist > 2 * r + 0.5) d += ` V${y2 - sv * r}`;
    d += ` Q${cx},${y2} ${cx - r},${y2} H${toX + BW}`;
    return d;
  }

  const ax = px1 + sh * ST,
    bx = px2 - sh * ST;
  const yMin = Math.min(y1, y2),
    yMax = Math.max(y1, y2);

  if (Math.abs(y2 - y1) < 2 && !isHBlocked(ax, bx, y1, allPositions, BW)) {
    return `M${px1},${y1} H${px2}`;
  }

  let vx = (ax + bx) / 2;
  for (let iter = 0; iter < 8; iter++) {
    for (const p of Object.values(allPositions)) {
      if (vx > p.x + 2 && vx < p.x + BW - 2 && yMax > p.y && yMin < p.y + p.h) {
        vx = vx - p.x <= p.x + BW - vx ? p.x - R : p.x + BW + R;
      }
    }
  }
  vx =
    sh > 0
      ? Math.max(ax + R, Math.min(bx - R, vx))
      : Math.min(ax - R, Math.max(bx + R, vx));
  vx += laneOffset;

  if (
    !isHBlocked(ax, vx, y1, allPositions, BW) &&
    !isVBlocked(vx, y1, y2, allPositions, BW) &&
    !isHBlocked(vx, bx, y2, allPositions, BW)
  ) {
    const r = Math.min(R, Math.abs(y2 - y1) / 2);
    const c1x = vx - sh * r,
      c1y = y1 + sv * r,
      c2y = y2 - sv * r,
      c2x = vx + sh * r;
    const s: string[] = [`M${px1},${y1}`, `H${ax}`];
    if (Math.abs(ax - c1x) > 0.5) s.push(`H${c1x}`);
    s.push(`Q${vx},${y1} ${vx},${c1y}`);
    if (Math.abs(c1y - c2y) > 0.5) s.push(`V${c2y}`);
    s.push(`Q${vx},${y2} ${c2x},${y2}`);
    if (Math.abs(c2x - bx) > 0.5) s.push(`H${bx}`);
    s.push(`H${px2}`);
    return s.join(" ");
  }

  const xLeft = Math.min(ax, bx) - R,
    xRight = Math.max(ax, bx) + R;
  let topY = Infinity,
    botY = -Infinity;
  for (const p of Object.values(allPositions)) {
    if (p.x + BW > xLeft && p.x < xRight) {
      if (p.y < topY) topY = p.y;
      if (p.y + p.h > botY) botY = p.y + p.h;
    }
  }
  const safeYAbove = (topY === Infinity ? y1 : topY) - MARGIN;
  const safeYBelow = (botY === -Infinity ? y1 : botY) + MARGIN;
  let safeY =
    Math.abs(y1 - safeYAbove) + Math.abs(y2 - safeYAbove) <=
    Math.abs(y1 - safeYBelow) + Math.abs(y2 - safeYBelow)
      ? safeYAbove
      : safeYBelow;
  safeY += laneOffset;

  return buildCornerPath(
    [
      { x: px1, y: y1 },
      { x: ax, y: y1 },
      { x: ax, y: safeY },
      { x: bx, y: safeY },
      { x: bx, y: y2 },
      { x: px2, y: y2 },
    ],
    R,
  );
}

export function svgRelations(
  schema: TableSchema[],
  positions: Record<string, { x: number; y: number; h: number }>,
  BOX_W: number,
  BOX_HEADER_H: number,
  ROW_H: number,
) {
  // Collect all connections with their computed vx
  type ConnInfo = {
    t: TableSchema;
    fkIdx: number;
    fromColIdx: number;
    safeToCol: number;
    vx: number;
    y1: number;
    y2: number;
    laneOffset: number;
  };

  const conns: ConnInfo[] = [];

  schema.forEach((t) => {
    t.foreignKeys.forEach((fk, fkIdx) => {
      const from = positions[t.name];
      const to = positions[fk.table];
      if (!from || !to) return;
      const fromColIdx = t.columns.findIndex((c) => c.name === fk.from);
      if (fromColIdx === -1) return;
      const targetSchema = schema.find((s) => s.name === fk.table);
      const toColIdx =
        targetSchema?.columns.findIndex((c) => c.name === fk.to) ?? 0;
      const safeToCol = toColIdx === -1 ? 0 : toColIdx;
      const vx = computeVx(
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
      const y1 = from.y + BOX_HEADER_H + fromColIdx * ROW_H + ROW_H / 2;
      const y2 = to.y + BOX_HEADER_H + safeToCol * ROW_H + ROW_H / 2;
      conns.push({
        t,
        fkIdx,
        fromColIdx,
        safeToCol,
        vx,
        y1,
        y2,
        laneOffset: 0,
      });
    });
  });

  // Detect overlapping vertical segments and assign lane offsets
  // Group indices that overlap: same vx (within 2px) and overlapping y range
  const grouped: number[][] = [];
  const assigned = new Set<number>();

  for (let i = 0; i < conns.length; i++) {
    if (assigned.has(i)) continue;
    const group = [i];
    assigned.add(i);
    for (let j = i + 1; j < conns.length; j++) {
      if (assigned.has(j)) continue;
      const a = conns[i],
        b = conns[j];
      const yOverlap =
        Math.min(Math.max(a.y1, a.y2), Math.max(b.y1, b.y2)) >
        Math.max(Math.min(a.y1, a.y2), Math.min(b.y1, b.y2));
      if (Math.abs(a.vx - b.vx) < 2 && yOverlap) {
        group.push(j);
        assigned.add(j);
      }
    }
    grouped.push(group);
  }

  // Assign lane offsets within each group (step = 10 so each line is ±5 from centre)
  for (const group of grouped) {
    const n = group.length;
    group.forEach((idx, rank) => {
      conns[idx].laneOffset = n > 1 ? (rank - (n - 1) / 2) * 10 : 0;
    });
  }

  // Build paths
  const paths = conns.map(({ t, fkIdx, fromColIdx, safeToCol, laneOffset }) => {
    const fk = t.foreignKeys[fkIdx];
    const from = positions[t.name] ?? { x: 0, y: 0, h: 0 };
    const to = positions[fk.table] ?? { x: 0, y: 0, h: 0 };
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
      laneOffset,
    );
    return html`<path
      data-from="${t.name}"
      data-to="${fk.table}"
      data-from-col="${fromColIdx}"
      data-to-col="${safeToCol}"
      data-lane-offset="${laneOffset}"
      d="${d}"
      fill="none"
      style="stroke:var(--pb-diagram-relation);stroke-width:calc(1.5 / var(--pb-zoom, 1));stroke-dasharray:calc(7 / var(--pb-zoom, 1)) calc(7 / var(--pb-zoom, 1))"
    />`;
  });

  return html`${paths}`;
}
