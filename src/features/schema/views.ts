import { html, raw } from 'hono/html'
import type { TableSchema } from './queries.ts'

export function schemaListView(schema: TableSchema[], basePath: string): string {
  const base = basePath.replace(/\/$/, '')
  const tables = schema.map((t) => {
    const cols = t.columns.map((c) => {
      const fkBadge = t.foreignKeys.some((fk) => fk.from === c.name)
        ? '<span class="badge fk">FK</span> '
        : ''
      const pkBadge = c.pk ? '<span class="badge pk">PK</span> ' : ''
      const nnBadge = c.notnull && !c.pk ? '<span class="badge">NN</span> ' : ''
      const dflt = c.dflt_value != null ? `<span style="color:#9ca3af">${String(c.dflt_value)}</span>` : ''
      return `<tr><td>${c.name}</td><td style="color:#6b7280">${c.type || 'ANY'}</td><td>${pkBadge}${fkBadge}${nnBadge}</td><td>${dflt}</td></tr>`
    }).join('\n')
    return `<div style="margin-bottom:2rem">
  <h3 style="font-size:1rem;font-weight:600;margin-bottom:0.5rem">${t.name}</h3>
  <table>
    <thead><tr><th>Column</th><th>Type</th><th>Flags</th><th>Default</th></tr></thead>
    <tbody>${cols}</tbody>
  </table>
</div>`
  }).join('\n')

  return String(html`<div style="display:flex;align-items:center;gap:1rem;margin-bottom:1.5rem">
  <h2>Schema</h2>
  <button data-on:click="@get('${base}/schema/diagram')">ER Diagram →</button>
</div>
<div id="schema-content">${raw(tables)}</div>`)
}

export function erDiagramView(schema: TableSchema[], basePath: string): string {
  const base = basePath.replace(/\/$/, '')
  const BOX_W = 200
  const ROW_H = 22
  const BOX_HEADER_H = 32
  const COL_GAP = 80
  const ROW_GAP = 60
  const COLS = Math.max(1, Math.ceil(Math.sqrt(schema.length)))
  const PAD = 40

  // Compute box heights and positions
  const boxes = schema.map((t, i) => {
    const col = i % COLS
    const row = Math.floor(i / COLS)
    const h = BOX_HEADER_H + t.columns.length * ROW_H + 8
    return { t, col, row, h }
  })

  // Row y offsets: each row starts after tallest box in previous row
  const rowYOffsets: number[] = []
  const numRows = Math.ceil(schema.length / COLS)
  let y = PAD
  for (let r = 0; r < numRows; r++) {
    rowYOffsets[r] = y
    const rowBoxes = boxes.filter((b) => b.row === r)
    const maxH = Math.max(...rowBoxes.map((b) => b.h))
    y += maxH + ROW_GAP
  }

  const positions: Record<string, { x: number; y: number; h: number }> = {}
  boxes.forEach(({ t, col, row, h }) => {
    positions[t.name] = {
      x: PAD + col * (BOX_W + COL_GAP),
      y: rowYOffsets[row] ?? PAD,
      h,
    }
  })

  const svgW = PAD * 2 + COLS * BOX_W + (COLS - 1) * COL_GAP
  const svgH = y

  const svgBoxes = schema.map((t) => {
    const pos = positions[t.name]!
    const colRows = t.columns.map((c, ci) => {
      const pk = c.pk ? '🔑 ' : ''
      const fk = t.foreignKeys.some((fk) => fk.from === c.name) ? '⤷ ' : ''
      return `<text x="${pos.x + 10}" y="${pos.y + BOX_HEADER_H + 14 + ci * ROW_H}" font-size="11" fill="#374151" font-family="monospace">${pk}${fk}${c.name}: ${c.type || 'ANY'}</text>`
    }).join('\n')

    return `<rect x="${pos.x}" y="${pos.y}" width="${BOX_W}" height="${pos.h}" rx="6" fill="white" stroke="#e5e7eb" stroke-width="1.5"/>
<rect x="${pos.x}" y="${pos.y}" width="${BOX_W}" height="${BOX_HEADER_H}" rx="6" fill="#111827"/>
<rect x="${pos.x}" y="${pos.y + BOX_HEADER_H - 6}" width="${BOX_W}" height="6" fill="#111827"/>
<text x="${pos.x + 10}" y="${pos.y + 21}" font-size="13" font-weight="600" fill="white" font-family="system-ui">${t.name}</text>
${colRows}`
  }).join('\n')

  const svgLines = schema.flatMap((t) =>
    t.foreignKeys.map((fk) => {
      const from = positions[t.name]
      const to = positions[fk.table]
      if (!from || !to) return ''
      const x1 = from.x + BOX_W
      const y1 = from.y + BOX_HEADER_H / 2
      const x2 = to.x
      const y2 = to.y + BOX_HEADER_H / 2
      const mx = (x1 + x2) / 2
      return `<path d="M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}" fill="none" stroke="#6366f1" stroke-width="1.5" stroke-dasharray="5,3" marker-end="url(#arrow)"/>`
    })
  ).join('\n')

  const arrowDef = `<defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#6366f1"/></marker></defs>`

  return String(html`<div style="display:flex;align-items:center;gap:1rem;margin-bottom:1.5rem">
  <h2>ER Diagram</h2>
  <button data-on:click="@get('${base}/schema')">← Column List</button>
</div>
<div id="schema-content" style="overflow:auto">
  <svg width="${svgW}" height="${svgH}" xmlns="http://www.w3.org/2000/svg" style="background:#f9fafb;border-radius:8px;display:block">
    ${raw(arrowDef)}
    ${raw(svgLines)}
    ${raw(svgBoxes)}
  </svg>
</div>`)
}
