// Halle 3: the factory hall, drawn as one SVG string from plain state.
// Pure: no DOM, no clock. Motion is SMIL inside the SVG (the pane draws it
// with isInteractive, which runs SMIL). Eleven designs share one layout:
// the belt leaves the chat at the front, runs right, turns left (back),
// runs up the right side, turns left again and returns to the chat.

const S = 68, OX = 80, OY = 906, KX = 0.18, KD = 0.58, VW = 900, VH = 1000
// A portrait scene for a tall side pane: the hall runs deep, a wall with the
// progress board closes it at the back, a header carries the texts.
const VX = 0
// The floor in world units (x across, d deep) and the back wall's height.
const FX0 = -0.6, FX1 = 9.6, FD0 = -1.6, FD1 = 11, WALL = 4.6
let SNAP = 0

function P(x, d, z = 0) {
  let sx = OX + x * S + d * S * KX, sy = OY - d * S * KD - z * S
  if (SNAP) { sx = Math.round(sx / SNAP) * SNAP; sy = Math.round(sy / SNAP) * SNAP }
  return [sx, sy]
}
const r1 = n => Math.round(n * 10) / 10
const pts = a => a.map(p => r1(p[0]) + ',' + r1(p[1])).join(' ')
const esc = s => String(s).replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\ufffe\uffff]/g, '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const cut = (s, n) => (s.length > n ? s.slice(0, n - 1) + '…' : s)
function attrs(o) {
  let s = ''
  if (o.stroke) s += ` stroke="${o.stroke}" stroke-width="${o.sw || 1}" stroke-linejoin="round"`
  if (o.op != null) s += ` opacity="${o.op}"`
  if (o.filter) s += ` filter="url(#${o.filter})"`
  return s
}
const poly = (a, fill, o = {}) => `<polygon points="${pts(a)}" fill="${fill}"${attrs(o)}/>`
const line = (a, b, c, w = 1, extra = '') =>
  `<line x1="${r1(a[0])}" y1="${r1(a[1])}" x2="${r1(b[0])}" y2="${r1(b[1])}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"${extra}/>`
function rgb(h) { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join(''); const n = parseInt(h.slice(0, 6), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255] }
function shade(h, f) {
  if (!h || h[0] !== '#') return h
  const m = v => Math.max(0, Math.min(255, Math.round(f >= 0 ? v + (255 - v) * f : v * (1 + f))))
  return '#' + rgb(h).map(m).map(v => v.toString(16).padStart(2, '0')).join('')
}
function box(x, d, z, w, dd, h, c, o = {}) {
  const col = typeof c === 'string' ? { top: shade(c, 0.14), front: shade(c, -0.1), side: shade(c, -0.3) } : c
  const A = P(x, d, z), B = P(x + w, d, z), C = P(x + w, d + dd, z)
  const At = P(x, d, z + h), Bt = P(x + w, d, z + h), Ct = P(x + w, d + dd, z + h), Dt = P(x, d + dd, z + h)
  return poly([A, B, Bt, At], col.front, o) + poly([B, C, Ct, Bt], col.side, o) + poly([At, Bt, Ct, Dt], col.top, o)
}
const cbox = (x, d, z, w, dd, h, c, o) => box(x - w / 2, d - dd / 2, z, w, dd, h, c, o)
const bob = (svg, amp = 4) =>
  `<g>${svg}<animateTransform attributeName="transform" type="translate" values="0 0;0 ${-amp};0 0" dur="0.7s" repeatCount="indefinite"/></g>`

// ---------- belt path (x = right, d = depth, larger d further back) ----------
const XS = 0.42, Y0 = 0.9, Y1 = 9.4, XR = 7.5, RR = 0.9, HW = 0.45, ZT = 0.55
const PATH = (() => {
  const p = []
  const seg = (a, b) => { const n = Math.max(2, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 0.1)); for (let i = 0; i < n; i++) { const t = i / n; p.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]) } }
  const arc = (cx, cy, a0, a1) => { for (let i = 0; i < 14; i++) { const a = a0 + (a1 - a0) * i / 14; p.push([cx + RR * Math.cos(a), cy + RR * Math.sin(a)]) } }
  seg([XS, Y0], [XR - RR, Y0]); arc(XR - RR, Y0 + RR, -Math.PI / 2, 0)
  seg([XR, Y0 + RR], [XR, Y1 - RR]); arc(XR - RR, Y1 - RR, 0, Math.PI / 2)
  seg([XR - RR, Y1], [XS, Y1]); p.push([XS, Y1])
  const s = [0]; for (let i = 1; i < p.length; i++) s.push(s[i - 1] + Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]))
  const tan = p.map((q, i) => { const a = p[Math.max(0, i - 1)], b = p[Math.min(p.length - 1, i + 1)]; const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1; return [(b[0] - a[0]) / l, (b[1] - a[1]) / l] })
  const inner = p.map((q, i) => [q[0] - tan[i][1] * HW, q[1] + tan[i][0] * HW])
  const outer = p.map((q, i) => [q[0] + tan[i][1] * HW, q[1] - tan[i][0] * HW])
  return { p, s, tan, inner, outer, L: s[s.length - 1] }
})()
function at(s) {
  s = Math.max(0, Math.min(PATH.L, s))
  let i = 0; while (i < PATH.s.length - 2 && PATH.s[i + 1] < s) i++
  const u = (s - PATH.s[i]) / ((PATH.s[i + 1] - PATH.s[i]) || 1)
  const a = PATH.p[i], b = PATH.p[i + 1]
  return { x: a[0] + (b[0] - a[0]) * u, d: a[1] + (b[1] - a[1]) * u, i }
}
function nearestS(x, d) { let best = 1e9, bs = 0; PATH.p.forEach((q, i) => { const v = (q[0] - x) ** 2 + (q[1] - d) ** 2; if (v < best) { best = v; bs = PATH.s[i] } }); return bs }

// ---------- fixed stations ----------
export const STATIONS = [
  { m: 'fable', name: 'Fable', role: 'plant den Auftrag', x: 2.6, d: -0.6, hat: 'crown', hold: 'book' },
  { m: 'opus', name: 'Opus', role: 'plant mit', x: 4.8, d: -0.6, hat: 'beret', hold: 'palette' },
  { m: 'haiku', name: 'Haiku', role: 'einfache Aufgaben', x: 8.75, d: 2.3, hat: 'cap', hold: 'paper' },
  { m: 'sonnet', name: 'Sonnet', role: 'erster Entwurf', x: 8.75, d: 5.1, hat: 'shades', hold: 'clip' },
  { m: 'opus', name: 'Opus', role: 'überarbeitet', x: 8.75, d: 7.9, hat: 'beret', hold: 'pen' },
  { m: 'fable', name: 'Fable', role: 'Sicherheit + Abnahme', x: 5.4, d: 10.25, hat: 'crown', hold: 'glass' },
]
const ST = STATIONS
const ORCH = { m: 'orch', name: 'Orchestrator', role: 'verteilt', x: 3.9, d: 5.0, scale: 1.3, orch: true, hat: 'tophat', hold: 'clapper', bx: 3.9, bd: 0.9 }
ST.forEach(F => { F.s = nearestS(F.x, F.d); const q = at(F.s); F.bx = q.x; F.bd = q.d })
const MC = { fable: '#e2a93b', opus: '#d9683f', sonnet: '#4f7be0', haiku: '#3fae7c', orch: '#8f74d6' }
const sAt = i => (i < 0 ? 0 : i > 5 ? PATH.L : ST[i].s)

// ---------- belt ----------
function beltItems(st) {
  const b = st.belt, zb = b.zb ?? 0.2, items = [], N = PATH.p.length, step = 4
  const o = { stroke: b.stroke, sw: b.sw, filter: b.filter ? st.k + '-' + b.filter : null }
  for (let i = 0; i < N - 1; i += step) {
    const j = Math.min(i + step, N - 1), tn = PATH.tan[(i + j) >> 1]
    let s = ''
    for (const [E, sign] of [[PATH.outer, 1], [PATH.inner, -1]]) {
      const nx = tn[1] * sign, nd = -tn[0] * sign
      if (nx * 0.6 - nd > 0.05) {
        const e = E.slice(i, j + 1)
        s += poly([...e.map(q => P(q[0], q[1], zb)), ...e.slice().reverse().map(q => P(q[0], q[1], ZT))], b.side, o)
      }
    }
    s += poly([...PATH.outer.slice(i, j + 1).map(q => P(q[0], q[1], ZT)), ...PATH.inner.slice(i, j + 1).reverse().map(q => P(q[0], q[1], ZT))], b.top, o)
    if (b.stripe) {
      const gap = b.gap || 0.3
      for (let ss = Math.ceil(PATH.s[i] / gap) * gap; ss <= PATH.s[j]; ss += gap) {
        const q = at(ss), a = PATH.inner[q.i], c = PATH.outer[q.i]
        s += line(P(a[0], a[1], ZT), P(c[0], c[1], ZT), b.stripe, b.stripeW || 1.2)
      }
    }
    if (b.rail) for (const E of [PATH.outer, PATH.inner]) s += `<polyline points="${pts(E.slice(i, j + 1).map(q => P(q[0], q[1], ZT)))}" fill="none" stroke="${b.rail}" stroke-width="${b.railW || 1.5}"${b.railFilter ? ` filter="url(#${st.k}-${b.railFilter})"` : ''}/>`
    if (b.center) s += `<polyline points="${pts(PATH.p.slice(i, j + 1).map(q => P(q[0], q[1], ZT)))}" fill="none" stroke="${b.center}" stroke-width="1" stroke-dasharray="7 4"/>`
    const avg = PATH.p.slice(i, j + 1).reduce((a, q) => [a[0] + q[0], a[1] + q[1]], [0, 0])
    items.push({ d: avg[1] / (j - i + 1), x: avg[0] / (j - i + 1), svg: s })
  }
  if (b.legs) for (let s = 0.6; s < PATH.L; s += 1.6) {
    const q = at(s)
    for (const E of [PATH.inner, PATH.outer]) { const e = E[q.i]; items.push({ d: e[1] + 0.05, x: e[0], svg: cbox(e[0], e[1], 0, 0.1, 0.1, zb, b.legs) }) }
  }
  return items
}

// ---------- figures ----------
function headTop(st, F) {
  const sc = F.scale || 1, k = st.fig.kind
  if (k === 'robot') return F.orch ? 1.9 : 2.0
  if (k === 'capsule' || k === 'holo') return 1.62 * sc
  if (k === 'peg') return 1.42 * sc
  if (k === 'paper') return 1.38 * sc
  if (k === 'clawd') return 1.15 * sc
  return 1.22 * sc
}
function figure(st, F, col, act) {
  const fn = { block, robot, capsule, holo: capsule, voxel, paper, peg, clawd }[st.fig.kind]
  let s = ''
  const B = P(F.x, F.d, 0), sc = F.scale || 1
  if (st.shadow) s += `<ellipse cx="${r1(B[0])}" cy="${r1(B[1])}" rx="${r1(0.46 * S * sc)}" ry="${r1(0.17 * S * sc)}" fill="${st.shadow}" filter="url(#${st.k}-blur)"/>`
  if (act && st.activeUnder) s += st.activeUnder(st.k, F, B, col)
  if (F.orch && st.fig.kind !== 'robot') s += cbox(F.x, F.d - 0.8, 0, 1.2, 0.3, 0.55, st.console || '#55585f', st.consoleO || {})
  const body = fn(st, F, col, act)
  return s + (act && st.fig.kind !== 'robot' ? bob(body, st.fig.kind === 'capsule' ? 7 : 4) : body)
}
function block(st, F, col, act) {
  const sc = F.scale || 1, f = st.fig, lit = act && f.lit
  const o = { stroke: f.stroke === 'model' ? col : f.stroke, sw: f.sw, filter: f.filter ? st.k + '-' + f.filter : null }
  const body = f.body === 'model' ? col : (lit ? shade(f.body, 0.35) : f.body), skin = lit ? shade(f.skin, 0.35) : f.skin
  return cbox(F.x, F.d, 0, 0.46 * sc, 0.3 * sc, 0.74 * sc, body, o) +
    cbox(F.x, F.d, 0.76 * sc, 0.32 * sc, 0.32 * sc, 0.32 * sc, skin, o) +
    cbox(F.x, F.d, 1.08 * sc, 0.4 * sc, 0.4 * sc, 0.1 * sc, lit ? shade(col, 0.2) : col, { ...o, stroke: f.hatStroke ?? o.stroke })
}
function robot(st, F, col, act) {
  const k = st.k
  if (F.orch) {
    let s = box(F.x - 0.8, F.d - 0.55, 0, 1.6, 1.1, 1.2, '#3a3e45')
    s += poly([P(F.x - 0.7, F.d - 0.551, 0.55), P(F.x + 0.7, F.d - 0.551, 0.55), P(F.x + 0.7, F.d - 0.551, 1.1), P(F.x - 0.7, F.d - 0.551, 1.1)], '#9fd3ff', { op: 0.55 })
    s += poly([P(F.x - 0.7, F.d - 0.552, 0.55), P(F.x - 0.2, F.d - 0.552, 0.55), P(F.x - 0.45, F.d - 0.552, 1.1), P(F.x - 0.7, F.d - 0.552, 1.1)], '#ffffff', { op: 0.25 })
    const L = P(F.x, F.d, 1.35); s += line(P(F.x, F.d, 1.2), L, '#6d737b', 3)
    s += `<circle cx="${r1(L[0])}" cy="${r1(L[1])}" r="5" fill="${act ? '#ffb547' : '#8a6a3a'}"${act ? ` filter="url(#${k}-glow)"` : ''}>${act ? '<animate attributeName="opacity" values="1;.3;1" dur="0.8s" repeatCount="indefinite"/>' : ''}</circle>`
    return s
  }
  const B = P(F.x, F.d, 0), rx = 0.34 * S, ry = rx * 0.45, hB = 0.22 * S
  let s = `<path d="M${r1(B[0] - rx)},${r1(B[1])} a${r1(rx)},${r1(ry)} 0 0 0 ${r1(2 * rx)},0 v${r1(-hB)} a${r1(rx)},${r1(ry)} 0 0 0 ${r1(-2 * rx)},0 z" fill="#454a52"/>`
  s += `<ellipse cx="${r1(B[0])}" cy="${r1(B[1] - hB)}" rx="${r1(rx)}" ry="${r1(ry)}" fill="#8f96a0"/>`
  s += `<ellipse cx="${r1(B[0])}" cy="${r1(B[1] - hB)}" rx="${r1(rx * 0.78)}" ry="${r1(ry * 0.78)}" fill="none" stroke="${col}" stroke-width="3.5"/>`
  const sh = P(F.x, F.d, 0.95)
  const tg = act ? P(F.bx, F.bd, 1.18) : P(F.x + (F.bx - F.x) * 0.5, F.d + (F.bd - F.d) * 0.5, 1.6)
  const el = [(sh[0] + tg[0]) / 2 + (F.d < 0 ? -10 : 12), Math.min(sh[1], tg[1]) - 0.5 * S]
  s += line([B[0], B[1] - hB], sh, '#9aa1ab', 13) + line(sh, el, '#c4cad1', 10) + line(el, tg, '#c4cad1', 8) + line(sh, el, col, 3)
  for (const j of [sh, el]) s += `<circle cx="${r1(j[0])}" cy="${r1(j[1])}" r="7" fill="#2c3036" stroke="#cfd4da" stroke-width="2"/>`
  let grip = line(tg, [tg[0] - 6, tg[1] + 10], '#2c3036', 3.5) + line(tg, [tg[0] + 6, tg[1] + 10], '#2c3036', 3.5)
  if (act) grip = bob(grip, 5)
  s += grip
  if (act) s += `<circle cx="${r1(sh[0])}" cy="${r1(sh[1] - 12)}" r="4.5" fill="#ffb547" filter="url(#${k}-glow)"><animate attributeName="opacity" values="1;.25;1" dur="0.7s" repeatCount="indefinite"/></circle>`
  return s
}
function capsule(st, F, col) {
  const sc = F.scale || 1, holo = st.fig.kind === 'holo'
  const B = P(F.x, F.d, 0), bw = 0.3 * S * sc, bh = 0.5 * S * sc, hr = 0.27 * S * sc
  const cx = r1(B[0]), cy = r1(B[1] - bh), hy = r1(B[1] - 2 * bh - hr * 0.75)
  let s = ''
  if (holo) {
    s += `<ellipse cx="${cx}" cy="${cy}" rx="${r1(bw)}" ry="${r1(bh)}" fill="${col}" fill-opacity=".18" stroke="${col}" stroke-width="1.4"/>`
    s += `<circle cx="${cx}" cy="${hy}" r="${r1(hr)}" fill="${col}" fill-opacity=".14" stroke="${col}" stroke-width="1.4"/>`
    s += `<ellipse cx="${cx}" cy="${cy}" rx="${r1(bw * 0.55)}" ry="${r1(bh * 0.8)}" fill="none" stroke="${col}" stroke-opacity=".45" stroke-dasharray="2 3"/>`
    s += `<line x1="${r1(B[0] - hr * 0.45)}" y1="${hy}" x2="${r1(B[0] + hr * 0.45)}" y2="${hy}" stroke="${col}" stroke-width="2.4" stroke-linecap="round"/>`
    return `<g filter="url(#${st.k}-glow)">${s}</g>`
  }
  s += `<ellipse cx="${cx}" cy="${cy}" rx="${r1(bw)}" ry="${r1(bh)}" fill="${col}"/>`
  s += `<ellipse cx="${cx}" cy="${cy}" rx="${r1(bw)}" ry="${r1(bh)}" fill="url(#${st.k}-shine)"/>`
  s += `<circle cx="${cx}" cy="${hy}" r="${r1(hr)}" fill="${st.fig.skin}"/>`
  s += `<circle cx="${cx}" cy="${hy}" r="${r1(hr)}" fill="url(#${st.k}-shine)"/>`
  s += `<path d="M${r1(B[0] - hr * 1.02)},${r1(hy - hr * 0.2)} a${r1(hr * 1.02)},${r1(hr * 0.95)} 0 0 1 ${r1(hr * 2.04)},0 z" fill="${shade(col, -0.08)}"/>`
  s += `<ellipse cx="${r1(B[0] - hr * 0.36)}" cy="${r1(hy + hr * 0.22)}" rx="2.2" ry="2.4" fill="#4a2f28"/><ellipse cx="${r1(B[0] + hr * 0.36)}" cy="${r1(hy + hr * 0.22)}" rx="2.2" ry="2.4" fill="#4a2f28"/>`
  s += `<ellipse cx="${r1(B[0] - hr * 0.6)}" cy="${r1(hy + hr * 0.55)}" rx="4" ry="2.4" fill="#ff8f8f" opacity=".45"/><ellipse cx="${r1(B[0] + hr * 0.6)}" cy="${r1(hy + hr * 0.55)}" rx="4" ry="2.4" fill="#ff8f8f" opacity=".45"/>`
  return s
}
function voxel(st, F, col, act) {
  const sc = F.scale || 1, f = st.fig, o = { stroke: f.stroke, sw: f.sw }, x = F.x, d = F.d, up = act ? 0.22 : 0
  let s = ''
  s += cbox(x - 0.09 * sc, d, 0, 0.13 * sc, 0.15 * sc, 0.36 * sc, f.legs || '#3b4a7a', o) + cbox(x + 0.09 * sc, d, 0, 0.13 * sc, 0.15 * sc, 0.36 * sc, f.legs || '#3b4a7a', o)
  s += cbox(x - 0.27 * sc, d, 0.38 * sc, 0.12 * sc, 0.14 * sc, 0.42 * sc, f.skin, o)
  s += cbox(x, d, 0.36 * sc, 0.4 * sc, 0.24 * sc, 0.46 * sc, col, o)
  s += cbox(x + 0.27 * sc, d, (0.38 + up) * sc, 0.12 * sc, 0.14 * sc, 0.42 * sc, f.skin, o)
  s += cbox(x, d, 0.84 * sc, 0.34 * sc, 0.34 * sc, 0.34 * sc, f.skin, o)
  for (const ex of [-0.08, 0.08]) { const e = P(x + ex * sc, d - 0.171 * sc, 1.02 * sc); s += `<rect x="${r1(e[0] - 2.5)}" y="${r1(e[1] - 2.5)}" width="5" height="5" fill="#1d1b26"/>` }
  s += cbox(x, d, 1.18 * sc, 0.38 * sc, 0.38 * sc, 0.1 * sc, shade(col, -0.2), o)
  return s
}
function paper(st, F, col) {
  const sc = F.scale || 1, B = P(F.x, F.d, 0), w = 0.52 * S * sc, h = 0.8 * S * sc, hr = 0.21 * S * sc
  const X = r1(B[0]), Y = r1(B[1])
  let s = `<ellipse cx="${X}" cy="${Y}" rx="${r1(w * 0.62)}" ry="${r1(w * 0.16)}" fill="#6d5a40" opacity=".22"/>`
  let g = `<path d="M${r1(B[0] - w / 2)},${Y} L${r1(B[0] + w / 2)},${Y} L${r1(B[0] + w * 0.3)},${r1(B[1] - h)} L${r1(B[0] - w * 0.3)},${r1(B[1] - h)} Z" fill="${col}"/>`
  g += `<path d="M${X},${Y} L${r1(B[0] + w * 0.3)},${r1(B[1] - h)} L${r1(B[0] + w / 2)},${Y} Z" fill="#000" opacity=".08"/>`
  g += `<circle cx="${X}" cy="${r1(B[1] - h - hr * 0.95)}" r="${r1(hr)}" fill="${st.fig.skin}"/>`
  g += `<path d="M${r1(B[0] - hr * 1.15)},${r1(B[1] - h - hr * 1.3)} L${r1(B[0] + hr * 1.15)},${r1(B[1] - h - hr * 1.3)} L${X},${r1(B[1] - h - hr * 2.7)} Z" fill="${shade(col, -0.25)}"/>`
  return s + `<g filter="url(#${st.k}-drop)">${g}</g>`
}
function peg(st, F, col) {
  const sc = F.scale || 1, B = P(F.x, F.d, 0), rw = 0.22 * S * sc, h = 0.78 * S * sc, hr = 0.21 * S * sc, k = st.k
  const X = r1(B[0])
  let g = `<ellipse cx="${X}" cy="${r1(B[1])}" rx="${r1(rw)}" ry="${r1(rw * 0.38)}" fill="#a87a49"/>`
  g += `<rect x="${r1(B[0] - rw)}" y="${r1(B[1] - h)}" width="${r1(2 * rw)}" height="${r1(h)}" fill="url(#${k}-woodv)"/>`
  g += `<rect x="${r1(B[0] - rw)}" y="${r1(B[1] - h * 0.62)}" width="${r1(2 * rw)}" height="${r1(h * 0.34)}" fill="${col}"/>`
  g += `<ellipse cx="${X}" cy="${r1(B[1] - h * 0.28)}" rx="${r1(rw)}" ry="${r1(rw * 0.38)}" fill="${shade(col, -0.2)}"/>`
  g += `<ellipse cx="${X}" cy="${r1(B[1] - h)}" rx="${r1(rw)}" ry="${r1(rw * 0.38)}" fill="#ecc994"/>`
  const hy = B[1] - h - hr * 0.8
  g += `<circle cx="${X}" cy="${r1(hy)}" r="${r1(hr)}" fill="url(#${k}-ball)"/>`
  g += `<ellipse cx="${X}" cy="${r1(hy - hr * 0.7)}" rx="${r1(hr * 0.95)}" ry="${r1(hr * 0.38)}" fill="${col}"/><rect x="${r1(B[0] - hr * 0.5)}" y="${r1(hy - hr * 1.35)}" width="${r1(hr)}" height="${r1(hr * 0.6)}" fill="${col}"/><ellipse cx="${X}" cy="${r1(hy - hr * 1.35)}" rx="${r1(hr * 0.5)}" ry="${r1(hr * 0.2)}" fill="${shade(col, 0.2)}"/>`
  g += `<circle cx="${r1(B[0] - hr * 0.33)}" cy="${r1(hy + hr * 0.1)}" r="1.8" fill="#3b2a1c"/><circle cx="${r1(B[0] + hr * 0.33)}" cy="${r1(hy + hr * 0.1)}" r="1.8" fill="#3b2a1c"/><path d="M${r1(B[0] - hr * 0.3)},${r1(hy + hr * 0.4)} q${r1(hr * 0.3)},${r1(hr * 0.3)} ${r1(hr * 0.6)},0" stroke="#3b2a1c" stroke-width="1.4" fill="none"/>`
  return g
}

// Claude's own little block creature: orange body, ">  <" eyes, four legs,
// stub arms, and a prop per role (hat on top, item in the right hand).
const CL = { top: '#e8906f', front: '#d97757', side: '#b85f44' }
const CL_LEG = { top: '#e08a6b', front: '#c9654a', side: '#a9523b' }
function clawd(st, F) {
  const sc = F.scale || 1, x = F.x, d = F.d, fz = d - 0.21 * sc
  const Q = (dx, z) => P(x + dx * sc, fz, z * sc)
  let s = ''
  for (const lx of [-0.23, -0.08, 0.08, 0.23]) s += cbox(x + lx * sc, d - 0.08 * sc, 0, 0.09 * sc, 0.12 * sc, 0.3 * sc, CL_LEG)
  s += cbox(x - 0.37 * sc, d, 0.46 * sc, 0.1 * sc, 0.16 * sc, 0.13 * sc, CL)
  s += cbox(x, d, 0.3 * sc, 0.64 * sc, 0.42 * sc, 0.44 * sc, CL)
  s += cbox(x + 0.37 * sc, d, 0.46 * sc, 0.1 * sc, 0.16 * sc, 0.13 * sc, CL)
  const eye = a => `<polyline points="${pts(a)}" fill="none" stroke="#2a170f" stroke-width="${r1(2.6 * sc)}" stroke-linecap="round" stroke-linejoin="round"/>`
  if (F.hat === 'shades') {
    s += poly([Q(-0.24, 0.6), Q(-0.03, 0.6), Q(-0.05, 0.49), Q(-0.22, 0.49)], '#16110e') + poly([Q(0.03, 0.6), Q(0.24, 0.6), Q(0.22, 0.49), Q(0.05, 0.49)], '#16110e') + line(Q(-0.03, 0.58), Q(0.03, 0.58), '#16110e', 2)
  } else {
    s += eye([Q(-0.17, 0.61), Q(-0.09, 0.545), Q(-0.17, 0.48)]) + eye([Q(0.17, 0.61), Q(0.09, 0.545), Q(0.17, 0.48)])
  }
  const tz = 0.74
  const T = (dx, z) => P(x + dx * sc, d, z * sc)
  if (F.hat === 'crown') s += poly([T(-0.2, tz), T(0.2, tz), T(0.22, tz + 0.2), T(0.11, tz + 0.1), T(0, tz + 0.23), T(-0.11, tz + 0.1), T(-0.22, tz + 0.2)], '#f2c14e', { stroke: '#b88a1e', sw: 1 })
  if (F.hat === 'beret') { const c = T(0.02, tz + 0.04); s += `<ellipse cx="${r1(c[0])}" cy="${r1(c[1])}" rx="${r1(0.3 * S * sc)}" ry="${r1(0.1 * S * sc)}" fill="#c84b5a"/><circle cx="${r1(c[0])}" cy="${r1(c[1] - 0.09 * S * sc)}" r="${r1(2.4 * sc)}" fill="#a83a48"/>` }
  if (F.hat === 'cap') { const c = T(0, tz); s += `<path d="M${r1(c[0] - 0.24 * S * sc)},${r1(c[1])} a${r1(0.24 * S * sc)},${r1(0.18 * S * sc)} 0 0 1 ${r1(0.48 * S * sc)},0 z" fill="#f2cf3f"/>` + poly([T(0.18, tz), T(0.46, tz - 0.02), T(0.4, tz + 0.04), T(0.16, tz + 0.05)], '#e0b92c') + `<circle cx="${r1(c[0])}" cy="${r1(c[1] - 0.18 * S * sc)}" r="${r1(2.2 * sc)}" fill="#e0b92c"/>` }
  if (F.hat === 'tophat') s += cbox(x, d, tz * sc, 0.48 * sc, 0.4 * sc, 0.04 * sc, '#1f1a18') + cbox(x, d, (tz + 0.04) * sc, 0.32 * sc, 0.28 * sc, 0.3 * sc, '#1f1a18') + cbox(x, d, (tz + 0.06) * sc, 0.33 * sc, 0.29 * sc, 0.06 * sc, '#c84b5a')
  if (F.hat === 'shades') s += cbox(x, d, tz * sc, 0.5 * sc, 0.36 * sc, 0.05 * sc, '#3a2c25')
  const H = P(x + 0.5 * sc, d - 0.05, 0.56 * sc), hx = r1(H[0]), hy = r1(H[1])
  const item = {
    book: `<rect x="${hx - 6}" y="${hy - 10}" width="14" height="17" rx="1.5" fill="#6b4fa8"/><rect x="${hx - 4}" y="${hy - 8}" width="10" height="13" fill="#efe6ff" opacity=".25"/>`,
    palette: `<ellipse cx="${hx}" cy="${hy}" rx="11" ry="8" fill="#f1e3c8"/><circle cx="${hx - 5}" cy="${hy - 2}" r="2" fill="#e25555"/><circle cx="${hx}" cy="${hy - 4}" r="2" fill="#4f7be0"/><circle cx="${hx + 5}" cy="${hy - 1}" r="2" fill="#3fae7c"/><circle cx="${hx + 1}" cy="${hy + 3}" r="2" fill="#f2c14e"/>`,
    paper: `<rect x="${hx - 6}" y="${hy - 11}" width="13" height="16" fill="#f6f1e7" transform="rotate(10 ${hx} ${hy})"/><line x1="${hx - 3}" y1="${hy - 6}" x2="${hx + 4}" y2="${hy - 5}" stroke="#b9ad99"/><line x1="${hx - 3}" y1="${hy - 2}" x2="${hx + 4}" y2="${hy - 1}" stroke="#b9ad99"/>`,
    clip: `<rect x="${hx - 7}" y="${hy - 11}" width="15" height="19" rx="1.5" fill="#a77a4a"/><rect x="${hx - 5}" y="${hy - 8}" width="11" height="14" fill="#f6f1e7"/><rect x="${hx - 3}" y="${hy - 13}" width="7" height="4" rx="1" fill="#8a8f96"/>`,
    pen: `<rect x="${hx - 6}" y="${hy - 11}" width="13" height="16" fill="#f6f1e7"/><line x1="${hx - 3}" y1="${hy - 5}" x2="${hx + 4}" y2="${hy - 5}" stroke="#d9534f" stroke-width="1.5"/><line x1="${hx + 2}" y1="${hy + 6}" x2="${hx + 11}" y2="${hy - 9}" stroke="#d9534f" stroke-width="2.5" stroke-linecap="round"/>`,
    glass: `<circle cx="${hx}" cy="${hy - 3}" r="7" fill="#bfe3ff" fill-opacity=".5" stroke="#5a5f66" stroke-width="2"/><line x1="${hx + 5}" y1="${hy + 2}" x2="${hx + 10}" y2="${hy + 8}" stroke="#5a5f66" stroke-width="3" stroke-linecap="round"/>`,
    clapper: `<rect x="${hx - 8}" y="${hy - 6}" width="17" height="12" fill="#1f1a18"/><path d="M${hx - 8},${hy - 6} l17,-5 l0,4 l-17,5 z" fill="#f6f1e7"/><line x1="${hx - 4}" y1="${hy - 8}" x2="${hx - 1}" y2="${hy - 4}" stroke="#1f1a18" stroke-width="2"/><line x1="${hx + 2}" y1="${hy - 10}" x2="${hx + 5}" y2="${hy - 6}" stroke="#1f1a18" stroke-width="2"/>`,
  }[F.hold] || ''
  return s + `<g transform="translate(${hx} ${hy}) scale(1.35) translate(${-hx} ${-hy})">${item}</g>`
}

// ---------- package ----------
function pkgSvg(st, pk, stamps, col) {
  const p = st.pkg, w = 0.5, h = 0.4, z = ZT, x0 = pk.x - w / 2, d0 = pk.d - w / 2
  const o = { stroke: p.stroke, sw: p.sw }
  let s = box(x0, d0, z, w, w, h, { top: p.top, front: p.front, side: p.side }, o)
  if (p.tape) {
    s += poly([P(x0, pk.d - 0.06, z + h), P(x0 + w, pk.d - 0.06, z + h), P(x0 + w, pk.d + 0.06, z + h), P(x0, pk.d + 0.06, z + h)], p.tape)
    s += poly([P(pk.x - 0.06, d0, z), P(pk.x + 0.06, d0, z), P(pk.x + 0.06, d0, z + h), P(pk.x - 0.06, d0, z + h)], p.tape)
  }
  if (p.cross) s += line(P(x0, d0, z), P(x0 + w, d0, z + h), p.cross, 2) + line(P(x0, d0, z + h), P(x0 + w, d0, z), p.cross, 2)
  if (p.letter) { const c = P(pk.x, d0, z + h * 0.5); s += `<text x="${r1(c[0])}" y="${r1(c[1] + 6)}" text-anchor="middle" font-size="16" font-weight="800" fill="${p.letter}" font-family="${st.font}">A</text>` }
  if (p.seal) { const c = P(pk.x, pk.d, z + h); s += `<ellipse cx="${r1(c[0])}" cy="${r1(c[1])}" rx="6" ry="4" fill="${p.seal}"/>` }
  stamps.forEach((i, n) => { const c = P(x0 + 0.1 + n * 0.07, d0 + 0.12, z + h); s += `<circle cx="${r1(c[0])}" cy="${r1(c[1])}" r="2.6" fill="${col[ST[i].m]}" stroke="${p.stampStroke || 'none'}" stroke-width=".8"/>` })
  return s
}
// The trip from one station to the next, as an animateMotion path relative to
// the end point (the package is drawn where it ends).
function trip(from, to) {
  const s0 = sAt(from), s1 = sAt(to)
  if (s1 <= s0) return { svg: '', dur: 0 }
  const e = at(s1), end = P(e.x, e.d), list = []
  if (from < 0) { const a = P(XS - 0.5, Y0); list.push([a[0] - end[0], a[1] - end[1]]) }
  for (let s = s0; s < s1; s += 0.4) { const q = at(s), a = P(q.x, q.d); list.push([a[0] - end[0], a[1] - end[1]]) }
  list.push([0, 0])
  const dur = Math.max(0.8, Math.min(3, (s1 - s0) / 3.2))
  return { dur, svg: `<animateMotion dur="${dur.toFixed(2)}s" fill="freeze" calcMode="paced" path="M${list.map(q => r1(q[0]) + ' ' + r1(q[1])).join(' L')}"/>` }
}

// ---------- chat terminal ----------
function chatSvg(st, state) {
  const c = st.chat, X = 0.352, o = { stroke: c.stroke, sw: c.sw }
  const face = (d0, d1, z0, z1) => [P(X, d0, z0), P(X, d1, z0), P(X, d1, z1), P(X, d0, z1)]
  // The screen is seen edge-on: bars stand in for the messages, the header has the words.
  const T = () => ''
  let s = box(0, 0.1, 0, 0.35, 10.0, 3.0, c.frame, o)
  s += poly(face(0.25, 9.95, 0.18, 2.85), c.screen, o)
  s += poly(face(0.25, 9.95, 2.52, 2.85), c.head || shade(c.screen, 0.08))
  s += T(0.45, 2.6, 'Chat', 13, c.text, 700)
  const task = state.task ? cut(state.task, 26) : 'Noch kein Auftrag'
  s += poly(face(4.2, 9.7, 2.0, 2.42), c.user); s += T(2.55, 2.1, task, 12.5, c.userText || '#fff', 600)
  const done = state.phase === 'done'
  s += poly(face(0.45, 6.0, 1.48, 1.9), done ? c.accent : c.ai, done ? {} : { stroke: c.aiStroke, sw: 1 })
  s += T(0.6, 1.58, done ? 'Fertig: Ergebnis geprüft' : state.phase === 'stopped' ? 'Abgebrochen' : state.phase === 'work' ? 'arbeitet …' : 'wartet', 12.5, done ? (c.accentText || '#111') : c.text, 600)
  const send = state.moving && state.from < 0
  s += poly(face(0.45, 9.7, 0.95, 1.32), c.input || shade(c.screen, 0.1), { stroke: send ? c.accent : (c.inputStroke || c.stroke), sw: send ? 2.5 : (c.sw || 1) })
  s += T(0.6, 1.05, send ? 'Auftrag gesendet' : 'Nachricht an Claude', 11.5, c.muted || c.text, 500)
  s += poly(face(0.45, 1.35, 0.24, 0.78), c.slot || '#000') + poly(face(8.95, 9.85, 0.24, 0.78), c.slot || '#000')
  return s
}

// ---------- labels and speech bubbles ----------
function labelSvg(st, said, col, counts) {
  const L = st.label, B = st.bubble
  let s = ''
  for (const [idx, F] of [...ST.map((F, i) => [i, F]), [-1, ORCH]]) {
    const p = P(F.x, F.d, headTop(st, F) + 0.24)
    const n = counts.get(idx) || 0
    const name = (L.upper ? F.name.toUpperCase() : F.name) + (n > 1 ? ` ×${n}` : '')
    const say = said.get(idx)
    // One plate per figure: its name, and while it works what it does, so
    // close stations never stack two rows over each other.
    const on = say !== undefined
    const txt = on ? `${name} · ${cut(say || F.role, 20)}` : name
    const size = Math.round((L.size || 11) * 1.3), w = txt.length * size * (L.wf || 0.62) + 18 + (L.dot ? 10 : 0)
    const bg = on ? B.bg : L.bg, fg = on ? B.fg : L.fill
    if (bg) s += `<rect x="${r1(p[0] - w / 2)}" y="${r1(p[1] - size - 3)}" width="${r1(w)}" height="${size + 8}" rx="${on ? (B.rx ?? 11) : (L.rx ?? 6)}" fill="${bg}"${!on && L.stroke ? ` stroke="${L.stroke}"` : on && B.stroke ? ` stroke="${B.stroke}"` : ''}/>`
    if (on) s += `<path d="M${r1(p[0] - 4)},${r1(p[1] + 5)} l4,5 l4,-5 z" fill="${B.bg}"/>`
    if (L.dot) s += `<circle cx="${r1(p[0] - w / 2 + 9)}" cy="${r1(p[1] - size / 2 + 1)}" r="3" fill="${col[F.m]}"/>`
    s += `<text x="${r1(p[0] + (L.dot ? 5 : 0))}" y="${r1(p[1])}" text-anchor="middle" font-size="${size}" font-weight="${on ? 700 : (L.weight || 600)}" fill="${fg}" font-family="${L.font || st.font}" letter-spacing="${L.ls || 0}"${L.italic ? ' font-style="italic"' : ''}>${esc(txt)}</text>`
  }
  return s
}

// The header across the top: the hall's name, what was asked, and how far it
// is. Its top left corner stays free for the pane's design picker.
function headerSvg(st, state) {
  const c = st.chat, font = `font-family="${st.font}"`
  const status = { idle: 'wartet auf Auftrag', work: 'arbeitet …', done: 'Fertig: Ergebnis geprüft', stopped: 'Abgebrochen' }[state.phase]
  const on = state.phase === 'done' || state.phase === 'work'
  const sw = status.length * 8.2 + 26
  let s = `<rect x="16" y="12" width="${VW - 32}" height="88" rx="12" fill="${c.screen}" stroke="${c.stroke || 'none'}" stroke-width="1"/>`
  s += `<text x="${r1(VW - 32 - sw - 16)}" y="46" text-anchor="end" font-size="24" font-weight="700" fill="${c.text}" ${font}>Halle 3</text>`
  s += `<rect x="${r1(VW - 32 - sw)}" y="24" width="${r1(sw)}" height="30" rx="15" fill="${on ? c.accent : c.ai}"${on ? '' : ` stroke="${c.aiStroke || c.stroke || 'none'}"`}/>`
  s += `<text x="${r1(VW - 32 - sw / 2)}" y="44" text-anchor="middle" font-size="14.5" font-weight="650" fill="${on ? (c.accentText || '#111') : c.text}" ${font}>${status}</text>`
  s += `<text x="32" y="84" font-size="15.5" font-weight="500" fill="${c.muted || c.text}" ${font}>${esc(state.task ? 'Auftrag: ' + cut(state.task, 84) : 'Noch kein Auftrag. Schreib eine Nachricht, dann rollt das Paket los.')}</text>`
  return s
}
const wallSvg = st => box(FX0, FD1, 0, FX1 - FX0, 0.2, WALL, st.wall || st.chat.frame, { stroke: st.chat.stroke, sw: st.chat.sw })

// The progress board on the back wall: every step of the job, done, at work
// or still to come. Its front face is flat to the viewer, so plain text fits.
const STEPS = [
  { name: 'Auftrag', at: [] },
  { name: 'Planung', at: [0, 1] },
  { name: 'Haiku: einfach', at: [2] },
  { name: 'Sonnet: Entwurf', at: [3] },
  { name: 'Opus: Überarbeitung', at: [4] },
  { name: 'Fable: Abnahme', at: [5] },
  { name: 'Ergebnis im Chat', at: [] },
]
function boardSvg(st, state, active) {
  const c = st.chat, X0 = 1.5, X1 = 8.9, D = FD1 - 0.06, Z0 = 1.95, Z1 = 4.35
  const tl = P(X0, D, Z1), br = P(X1, D, Z0), W = br[0] - tl[0], H = br[1] - tl[1]
  let s = ''
  s += box(X0 - 0.1, D - 0.06, Z0 - 0.1, X1 - X0 + 0.2, 0.12, Z1 - Z0 + 0.2, shade(c.frame, 0.12), { stroke: c.stroke, sw: c.sw })
  s += `<rect x="${r1(tl[0])}" y="${r1(tl[1])}" width="${r1(W)}" height="${r1(H)}" fill="${c.screen}"/>`
  const font = `font-family="${st.font}"`
  s += `<text x="${r1(tl[0] + 18)}" y="${r1(tl[1] + 32)}" font-size="21" font-weight="700" fill="${c.text}" ${font}>Fortschritt</text>`
  const done = state.phase === 'done', stopped = state.phase === 'stopped'
  const passed = i => state.stamps.includes(i) || (state.pkg > i && state.pkg <= 6)
  const status = (step, n) => {
    if (state.phase === 'idle') return 'wait'
    if (n === 0) return 'done'
    if (n === STEPS.length - 1) return done ? 'done' : stopped ? 'stop' : 'wait'
    if (step.at.some(i => active.has(i))) return 'run'
    if (step.at.some(passed)) return 'done'
    return 'wait'
  }
  const finished = STEPS.filter((step, n) => status(step, n) === 'done').length
  s += `<text x="${r1(tl[0] + W - 18)}" y="${r1(tl[1] + 32)}" text-anchor="end" font-size="17" fill="${c.muted || c.text}" ${font}>${finished}/${STEPS.length}</text>`
  const colW = (W - 36) / 2, rowH = (H - 58) / 4
  STEPS.forEach((step, n) => {
    const x = tl[0] + 18 + (n < 4 ? 0 : colW), y = tl[1] + 48 + (n % 4) * rowH + rowH / 2
    const st8 = status(step, n)
    const mark = { done: '✓', run: '●', stop: '✕', wait: '○' }[st8]
    const mc = st8 === 'done' ? c.accent : st8 === 'run' ? st.bubble.bg : st8 === 'stop' ? '#e05555' : (c.muted || c.text)
    let m = `<text x="${r1(x + 8)}" y="${r1(y + 6)}" text-anchor="middle" font-size="17" font-weight="700" fill="${mc}" ${font}>${mark}</text>`
    if (st8 === 'run') m = `<g>${m}<animate attributeName="opacity" values="1;.3;1" dur="1s" repeatCount="indefinite"/></g>`
    s += m + `<text x="${r1(x + 26)}" y="${r1(y + 5)}" font-size="15" font-weight="${st8 === 'run' ? 700 : 500}" fill="${st8 === 'wait' ? (c.muted || c.text) : c.text}" ${font}>${esc(step.name)}</text>`
  })
  return s
}

// ---------- shared pieces ----------
function baseDefs(k) {
  return `<filter id="${k}-blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4"/></filter>` +
    `<filter id="${k}-glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>` +
    `<filter id="${k}-drop" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="3" dy="4" stdDeviation="2.5" flood-color="#5b4630" flood-opacity=".35"/></filter>` +
    `<radialGradient id="${k}-shine" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#fff" stop-opacity=".5"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#3a1d10" stop-opacity=".28"/></radialGradient>`
}
const FLOOR = [P(FX0, FD0), P(FX1, FD0), P(FX1, FD1), P(FX0, FD1)]
const slab = (c, o) => box(FX0, FD0, -0.3, FX1 - FX0, FD1 - FD0, 0.3, c, o)
function grid(step, c, w = 1, op = 1) {
  let s = ''
  for (let x = FX0; x <= FX1 + 0.01; x += step) s += line(P(x, FD0), P(x, FD1), c, w, ` opacity="${op}"`)
  for (let d = FD0; d <= FD1 + 0.01; d += step) s += line(P(FX0, d), P(FX1, d), c, w, ` opacity="${op}"`)
  return s
}
const checker = b => { let s = ''; for (let x = FX0, i = 0; x < FX1 - 0.01; x += 1, i++) for (let d = FD0, j = 0; d < FD1 - 0.01; d += 1, j++) if ((i + j) % 2) s += poly([P(x, d), P(Math.min(FX1, x + 1), d), P(Math.min(FX1, x + 1), Math.min(FD1, d + 1)), P(x, Math.min(FD1, d + 1))], b); return s }
const scan = (step, op) => { let s = ''; for (let y = 0; y < VH; y += step) s += `<rect y="${y}" width="${VW}" height="1" fill="#000" opacity="${op}"/>`; return s }

// ---------- the eleven designs ----------
export const DESIGNS = [
{
  k: 'claude', name: 'Claude', font: "'Segoe UI', system-ui, sans-serif",
  col: { fable: '#f2c14e', opus: '#c84b5a', sonnet: '#4f7be0', haiku: '#f2cf3f', orch: '#d97757' },
  defs: k => `<radialGradient id="${k}-bg" cx="50%" cy="45%" r="75%"><stop offset="0" stop-color="#2a1a12"/><stop offset="1" stop-color="#140c08"/></radialGradient>` +
    `<pattern id="${k}-grid" width="44" height="44" patternUnits="userSpaceOnUse"><path d="M44 0H0V44" fill="none" stroke="#3a2619" stroke-width="1"/></pattern>` +
    `<pattern id="${k}-rain" width="130" height="90" patternUnits="userSpaceOnUse"><line x1="12" y1="6" x2="12" y2="18" stroke="#8a7060" stroke-opacity=".5" stroke-width="1.4"/><line x1="70" y1="44" x2="70" y2="54" stroke="#8a7060" stroke-opacity=".4" stroke-width="1.2"/><line x1="104" y1="20" x2="104" y2="32" stroke="#8a7060" stroke-opacity=".45" stroke-width="1.4"/><line x1="40" y1="70" x2="40" y2="80" stroke="#8a7060" stroke-opacity=".35" stroke-width="1.2"/><animateTransform attributeName="patternTransform" type="translate" from="0 0" to="0 90" dur="1.1s" repeatCount="indefinite"/></pattern>` +
    `<radialGradient id="${k}-vig" cx="50%" cy="50%" r="70%"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#0b0604" stop-opacity=".65"/></radialGradient>`,
  bg: k => `<rect width="${VW}" height="${VH}" fill="url(#${k}-bg)"/><rect width="${VW}" height="${VH}" fill="url(#${k}-grid)"/>`,
  floor: () => slab({ top: '#2b1b12', front: '#1c110b', side: '#160d08' }) + grid(1, '#3e2a1d', 1, 0.7),
  beltShadow: '#0a050399',
  belt: { top: '#3a281d', side: '#271a12', stripe: '#4a3527', gap: 0.3, rail: '#d97757', railW: 1.3 },
  fig: { kind: 'clawd' },
  shadow: '#0a0503',
  console: '#3a281d',
  pkg: { top: '#f3e7d6', front: '#e6d6bf', side: '#cdbb9f', tape: '#d97757', stroke: '#a08a6b', sw: 0.6, stampStroke: '#fff' },
  chat: { frame: '#2e1f16', screen: '#170e09', head: '#22160f', text: '#f3e7dc', muted: '#a8907f', user: '#d97757', ai: '#2a1c14', aiStroke: '#4a3527', accent: '#d97757', accentText: '#1a0e08', input: '#1f140e', inputStroke: '#4a3527', slot: '#000', stroke: '#3a281d', sw: 1 },
  activeUnder: (k, F, B) => `<ellipse cx="${r1(B[0])}" cy="${r1(B[1])}" rx="${r1(0.6 * S)}" ry="${r1(0.22 * S)}" fill="#d97757" opacity=".28"><animate attributeName="opacity" values=".35;.1;.35" dur="1.2s" repeatCount="indefinite"/></ellipse>`,
  label: { fill: '#f3e7dc', bg: '#0c060399', size: 11, rx: 8 },
  bubble: { bg: '#f3e7dc', fg: '#2a170f' },
  link: '#d97757',
  overlay: k => `<rect width="${VW}" height="${VH}" fill="url(#${k}-rain)"/><rect width="${VW}" height="${VH}" fill="url(#${k}-vig)"/>`,
},
{
  k: 'werk', name: 'Werkhalle', font: "'Segoe UI', system-ui, sans-serif",
  defs: k => `<linearGradient id="${k}-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b2926"/><stop offset="1" stop-color="#151413"/></linearGradient>` +
    `<linearGradient id="${k}-fl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6a6660"/><stop offset=".55" stop-color="#57544f"/><stop offset="1" stop-color="#4a4743"/></linearGradient>` +
    `<linearGradient id="${k}-cone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe2b0" stop-opacity=".32"/><stop offset="1" stop-color="#ffe2b0" stop-opacity="0"/></linearGradient>` +
    `<radialGradient id="${k}-vig" cx="50%" cy="55%" r="70%"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#0b0a09" stop-opacity=".7"/></radialGradient>`,
  bg: k => `<rect width="${VW}" height="${VH}" fill="url(#${k}-bg)"/>`,
  floor: k => {
    const inset = [P(FX0 + 0.3, FD0 + 0.3), P(FX1 - 0.3, FD0 + 0.3), P(FX1 - 0.3, FD1 - 0.3), P(FX0 + 0.3, FD1 - 0.3)]
    return slab({ top: `url(#${k}-fl)`, front: '#3b3936', side: '#2f2d2a' }) + grid(2, '#2e2c29', 1, 0.55) +
      `<polygon points="${pts(inset)}" fill="none" stroke="#e8b31e" stroke-width="5"/><polygon points="${pts(inset)}" fill="none" stroke="#1d1b19" stroke-width="5" stroke-dasharray="9 9"/>`
  },
  beltShadow: '#0e0d0c99',
  belt: { top: '#232427', side: '#8e959e', stripe: '#38393d', gap: 0.2, rail: '#c8cdd3', railW: 1.2, legs: '#5d636b' },
  fig: { kind: 'robot' },
  shadow: '#0f0e0d',
  pkg: { top: '#d3a468', front: '#b9884f', side: '#9b6e3d', tape: '#e8d3a2', stroke: '#7a5530', sw: 0.6, stampStroke: '#5b3e20' },
  chat: { frame: '#3b3e44', screen: '#101216', head: '#1a1d23', text: '#e8e6e1', muted: '#8f949c', user: '#d9683f', ai: '#22262d', accent: '#ffb547', input: '#171a1f', slot: '#050506', stroke: '#2a2d33', sw: 1 },
  activeUnder: (k, F, B) => `<ellipse cx="${r1(B[0])}" cy="${r1(B[1])}" rx="${r1(0.6 * S)}" ry="${r1(0.24 * S)}" fill="none" stroke="#ffb547" stroke-width="2" stroke-dasharray="6 5"><animate attributeName="stroke-dashoffset" from="0" to="-22" dur="1s" repeatCount="indefinite"/></ellipse>`,
  label: { fill: '#f2efe8', bg: '#1b1c1fd9', stroke: '#3a3b40', dot: true },
  bubble: { bg: '#ffb547', fg: '#231507' },
  link: '#ffb547',
  overlay: k => {
    let s = ''
    for (const x of [190, 450, 720]) s += `<polygon points="${x - 16},0 ${x + 16},0 ${x + 170},${VH} ${x - 170},${VH}" fill="url(#${k}-cone)"/><rect x="${x - 26}" y="0" width="52" height="8" rx="2" fill="#2d2c2a"/><rect x="${x - 20}" y="8" width="40" height="3" fill="#ffe9c2"/>`
    return s + `<rect width="${VW}" height="${VH}" fill="url(#${k}-vig)"/>`
  },
},
{
  k: 'neon', name: 'Mitternachts-Neon', font: "'Cascadia Code', 'JetBrains Mono', ui-monospace, monospace",
  col: { fable: '#ffd84a', opus: '#ff9d3c', sonnet: '#38c8ff', haiku: '#3dffa0', orch: '#c58bff' },
  defs: k => `<linearGradient id="${k}-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b0c22"/><stop offset=".6" stop-color="#14163a"/><stop offset="1" stop-color="#1d1f52"/></linearGradient>` +
    `<linearGradient id="${k}-hz" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff4fd8" stop-opacity="0"/><stop offset="1" stop-color="#ff4fd8" stop-opacity=".18"/></linearGradient>`,
  bg: k => { let s = `<rect width="${VW}" height="${VH}" fill="url(#${k}-bg)"/>`; for (let i = 0; i < 40; i++) s += `<circle cx="${(i * 137) % VW}" cy="${(i * 59) % 420}" r="${i % 3 ? 0.8 : 1.4}" fill="#cfd3ff" opacity="${(0.25 + (i % 4) * 0.15).toFixed(2)}"/>`; return s + `<rect y="120" width="${VW}" height="140" fill="url(#${k}-hz)"/>` },
  floor: k => slab({ top: '#11132e', front: '#0b0c22', side: '#08091a' }) + grid(1, '#ff4fd8', 1, 0.28) + `<polygon points="${pts(FLOOR)}" fill="none" stroke="#38f6ff" stroke-width="1.5" filter="url(#${k}-glow)"/>`,
  belt: { top: '#0a0b1d', side: '#151842', stripe: '#38f6ff33', gap: 0.3, rail: '#38f6ff', railW: 1.6, railFilter: 'glow' },
  fig: { kind: 'block', body: '#15173a', skin: '#1f2252', stroke: 'model', sw: 1.4, filter: 'glow' },
  console: '#15173a', consoleO: { stroke: '#38f6ff', sw: 1 },
  pkg: { top: '#ffb15c', front: '#ff8f2a', side: '#d96d10', stroke: '#ffe0bf', sw: 0.8, filter: 'glow' },
  chat: { frame: '#1b1d48', screen: '#080918', head: '#12143a', text: '#eceeff', muted: '#8d92c9', user: '#ff4fd8', ai: '#161944', aiStroke: '#38f6ff55', accent: '#3dffa0', input: '#0e1030', inputStroke: '#38f6ff66', slot: '#000', stroke: '#38f6ff55', sw: 1 },
  activeUnder: (k, F, B, col) => `<ellipse cx="${r1(B[0])}" cy="${r1(B[1])}" rx="${r1(0.55 * S)}" ry="${r1(0.22 * S)}" fill="none" stroke="${col}" stroke-width="2.5" filter="url(#${k}-glow)"><animate attributeName="opacity" values="1;.4;1" dur="0.9s" repeatCount="indefinite"/></ellipse><rect x="${r1(B[0] - 10)}" y="${r1(B[1] - 120)}" width="20" height="120" fill="${col}" opacity=".12"/>`,
  label: { fill: '#eceeff', bg: '#0b0c22cc', stroke: '#38f6ff55', size: 10.5, wf: 0.66 },
  bubble: { bg: '#38f6ff', fg: '#07081a', rx: 3 },
  link: '#c58bff',
  overlay: () => scan(4, 0.12),
},
{
  k: 'blau', name: 'Blaupause', font: 'Consolas, ui-monospace, monospace',
  col: { fable: '#ffe9a8', opus: '#ffc2a8', sonnet: '#bcd6ff', haiku: '#b8f2d2', orch: '#dccbff' },
  defs: k => `<pattern id="${k}-g" width="12" height="12" patternUnits="userSpaceOnUse"><path d="M12 0H0V12" fill="none" stroke="#ffffff" stroke-opacity=".08"/></pattern><pattern id="${k}-G" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M60 0H0V60" fill="none" stroke="#ffffff" stroke-opacity=".16"/></pattern>`,
  bg: k => `<rect width="${VW}" height="${VH}" fill="#1b4a8a"/><rect width="${VW}" height="${VH}" fill="url(#${k}-g)"/><rect width="${VW}" height="${VH}" fill="url(#${k}-G)"/>`,
  floor: () => slab('#1d4f93', { stroke: '#e8f1ff', sw: 1.2 }),
  belt: { top: '#1d4f93', side: '#1b4a8a', stroke: '#e8f1ff', sw: 0.9, center: '#e8f1ffaa' },
  fig: { kind: 'block', body: '#1d4f93', skin: '#1d4f93', stroke: '#e8f1ff', sw: 1, hatStroke: '#e8f1ff' },
  console: '#1d4f93', consoleO: { stroke: '#e8f1ff', sw: 1 },
  pkg: { top: '#1d4f93', front: '#1b4a8a', side: '#184480', stroke: '#ffffff', sw: 1.2, letter: '#ffffff', stampStroke: '#fff' },
  chat: { frame: '#1d4f93', screen: '#1b4a8a', head: '#1d4f93', text: '#e8f1ff', muted: '#bcd0ee', user: '#2a5da3', ai: '#1b4a8a', aiStroke: '#e8f1ff', accent: '#e8f1ff', accentText: '#1b4a8a', input: '#1b4a8a', slot: '#123a6e', stroke: '#e8f1ff', sw: 1 },
  activeUnder: (k, F, B) => `<circle cx="${r1(B[0])}" cy="${r1(B[1] - 22)}" r="36" fill="none" stroke="#ffffff" stroke-width="1.2" stroke-dasharray="4 4"><animate attributeName="r" values="34;38;34" dur="1.4s" repeatCount="indefinite"/></circle>`,
  label: { fill: '#e8f1ff', size: 10.5, upper: true, ls: 1.2, weight: 500 },
  bubble: { bg: '#e8f1ff', fg: '#1b4a8a', rx: 0 },
  link: '#e8f1ff',
  overlay: (k, state) => {
    const a = P(XS, -1.25), b = P(XR + HW, -1.25)
    let s = line(a, b, '#e8f1ff', 1) + line(P(XS, -1.1), P(XS, -1.4), '#e8f1ff', 1) + line(P(XR + HW, -1.1), P(XR + HW, -1.4), '#e8f1ff', 1)
    s += `<text x="${r1((a[0] + b[0]) / 2)}" y="${r1(a[1] - 5)}" text-anchor="middle" font-size="10" fill="#e8f1ff" font-family="Consolas, monospace">BANDLÄNGE ${PATH.L.toFixed(1).replace('.', ',')} m</text>`
    s += `<g font-family="Consolas, monospace" fill="#e8f1ff" font-size="10"><rect x="652" y="${VH - 86}" width="236" height="64" fill="#1b4a8a" stroke="#e8f1ff"/><line x1="652" y1="${VH - 62}" x2="888" y2="${VH - 62}" stroke="#e8f1ff"/><line x1="772" y1="${VH - 62}" x2="772" y2="${VH - 22}" stroke="#e8f1ff"/><text x="662" y="${VH - 70}" font-size="12" font-weight="700">HALLE 3  FÖRDERSTRECKE</text><text x="662" y="${VH - 46}">MASSSTAB 1:50</text><text x="662" y="${VH - 30}">BLATT 1/1</text><text x="782" y="${VH - 46}">FERTIG ${String(state.counts.done).padStart(3, '0')}</text><text x="782" y="${VH - 30}">GEPRÜFT: FABLE</text></g>`
    return s
  },
},
{
  k: 'knete', name: 'Knetfiguren', font: "'Segoe UI Rounded', Nunito, ui-rounded, system-ui, sans-serif",
  col: { fable: '#ffc857', opus: '#ff8a65', sonnet: '#7aa7ff', haiku: '#6fd3a1', orch: '#b79cff' },
  defs: k => `<radialGradient id="${k}-bg" cx="50%" cy="35%" r="80%"><stop offset="0" stop-color="#fff1e6"/><stop offset="1" stop-color="#f4c9b8"/></radialGradient>`,
  bg: k => `<rect width="${VW}" height="${VH}" fill="url(#${k}-bg)"/>`,
  floor: k => `<ellipse cx="450" cy="880" rx="430" ry="100" fill="#c98f7a" opacity=".35" filter="url(#${k}-blur)"/>` + slab({ top: '#fff6ee', front: '#f2d2c2', side: '#e6bba8' }, { stroke: '#fff6ee', sw: 14 }),
  beltShadow: '#d8a28f88',
  belt: { top: '#9cc3e4', side: '#77a2c9', stroke: '#9cc3e4', sw: 6, stripe: '#b4d4ef', gap: 0.45, stripeW: 3 },
  fig: { kind: 'capsule', skin: '#ffe3cc' },
  shadow: '#c9917c',
  console: '#f7e1d3', consoleO: { stroke: '#f7e1d3', sw: 8 },
  pkg: { top: '#ffb3d1', front: '#ff9ec4', side: '#f283b0', stroke: '#ff9ec4', sw: 6, stampStroke: '#fff' },
  chat: { frame: '#ffffff', screen: '#fdf6f0', head: '#f7e9df', text: '#5a3e36', muted: '#a6877d', user: '#ff8a65', ai: '#f2e4da', accent: '#6fd3a1', accentText: '#1f3d2e', input: '#ffffff', inputStroke: '#efd8cb', slot: '#e9cfc2', stroke: '#ffffff', sw: 6 },
  activeUnder: (k, F, B, col) => `<g><path d="M0,-7 L2,-2 L7,0 L2,2 L0,7 L-2,2 L-7,0 L-2,-2 Z" fill="${col}" transform="translate(${r1(B[0] + 30)} ${r1(B[1] - 64)})"/><path d="M0,-5 L1.5,-1.5 L5,0 L1.5,1.5 L0,5 L-1.5,1.5 L-5,0 L-1.5,-1.5 Z" fill="${col}" transform="translate(${r1(B[0] - 32)} ${r1(B[1] - 50)})"/><animateTransform attributeName="transform" type="translate" values="0 0;0 -6;0 0" dur="0.9s" repeatCount="indefinite"/></g>`,
  label: { fill: '#5a3e36', bg: '#ffffff', size: 11, weight: 800, rx: 11 },
  bubble: { bg: '#5a3e36', fg: '#fff6ee' },
  link: '#b79cff',
},
{
  k: 'voxel', name: 'Blockwelt', font: "'Cascadia Mono', ui-monospace, monospace",
  col: { fable: '#f2b632', opus: '#d4542c', sonnet: '#3c78d8', haiku: '#46b04a', orch: '#9b59d0' },
  defs: k => `<linearGradient id="${k}-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6fbcf7"/><stop offset="1" stop-color="#cdeeff"/></linearGradient>`,
  bg: k => { let s = `<rect width="${VW}" height="${VH}" fill="url(#${k}-bg)"/><rect x="20" y="130" width="56" height="56" fill="#fff3a6"/>`; for (const [x, y, w] of [[110, 150, 110], [30, 250, 90], [40, 420, 70]]) s += `<g><rect x="${x}" y="${y}" width="${w}" height="22" fill="#ffffff"/><rect x="${x + 20}" y="${y - 14}" width="${w * 0.5}" height="14" fill="#ffffff"/><animateTransform attributeName="transform" type="translate" values="0 0;40 0;0 0" dur="30s" repeatCount="indefinite"/></g>`; return s },
  floor: () => slab({ top: '#5fb34a', front: '#8a5a35', side: '#6e4528' }) + checker('#56a743'),
  belt: { top: '#8f8f8f', side: '#6b6b6b', stroke: '#454545', sw: 0.7, stripe: '#707070', gap: 0.5, stripeW: 1.5 },
  fig: { kind: 'voxel', skin: '#e0ac7e', stroke: '#00000055', sw: 0.6, legs: '#33497d' },
  shadow: '#2f6b28',
  console: '#8f8f8f',
  pkg: { top: '#c08a4a', front: '#a8743a', side: '#8c5e2c', stroke: '#5e3d1a', sw: 1.2, cross: '#6b4520' },
  chat: { frame: '#8f8f8f', screen: '#1e1e1e', head: '#2c2c2c', text: '#ffffff', muted: '#a0a0a0', user: '#3c78d8', ai: '#333333', accent: '#46b04a', accentText: '#fff', input: '#2a2a2a', slot: '#000', stroke: '#454545', sw: 1 },
  activeUnder: (k, F, B, col) => { let s = ''; for (let i = 0; i < 5; i++) s += `<rect x="${r1(B[0] - 20 + i * 10)}" y="${r1(B[1] - 30)}" width="5" height="5" fill="${col}"><animate attributeName="y" from="${r1(B[1] - 30)}" to="${r1(B[1] - 110)}" dur="1.4s" begin="${(i * 0.25).toFixed(2)}s" repeatCount="indefinite"/><animate attributeName="opacity" from="1" to="0" dur="1.4s" begin="${(i * 0.25).toFixed(2)}s" repeatCount="indefinite"/></rect>`; return s },
  label: { fill: '#ffffff', bg: '#00000080', size: 11, rx: 0, weight: 700, wf: 0.64 },
  bubble: { bg: '#ffffff', fg: '#222222', rx: 0, stroke: '#222' },
  link: '#ffffff',
},
{
  k: 'papier', name: 'Papierschnitt', font: "Georgia, 'Iowan Old Style', serif",
  col: { fable: '#d9a441', opus: '#c8553d', sonnet: '#3e6fa8', haiku: '#5c9a6b', orch: '#7a5ea8' },
  defs: k => `<filter id="${k}-grain"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 .35  0 0 0 0 .28  0 0 0 0 .2  0 0 0 .5 0"/></filter>`,
  bg: () => `<rect width="${VW}" height="${VH}" fill="#ece1cc"/>`,
  floor: k => `<g filter="url(#${k}-drop)">${slab({ top: '#dccdae', front: '#c7b48f', side: '#b8a37c' })}</g>` + poly([P(FX0 + 0.7, FD0 + 0.6), P(FX1 - 0.6, FD0 + 0.6), P(FX1 - 0.6, FD1 - 0.5), P(FX0 + 0.7, FD1 - 0.5)], '#e6d9bd'),
  belt: { top: '#8c6f4e', side: '#6f573c', filter: 'drop' },
  fig: { kind: 'paper', skin: '#f6ecdb' },
  console: '#cdbb98',
  pkg: { top: '#fbf6ec', front: '#efe5d2', side: '#e0d3ba', seal: '#a8322a', filter: 'drop', stampStroke: '#fff' },
  chat: { frame: '#fbf6ec', screen: '#fffdf8', head: '#f1e8d6', text: '#3b3026', muted: '#8a7b68', user: '#c8553d', ai: '#efe5d2', accent: '#5c9a6b', accentText: '#fff', input: '#fbf6ec', inputStroke: '#d6c6a8', slot: '#6f573c', stroke: '#d6c6a8', sw: 1 },
  activeUnder: (k, F, B, col) => { const c = [B[0], B[1] - 30], p = []; for (let i = 0; i < 16; i++) { const r = i % 2 ? 22 : 46, a = i * Math.PI / 8; p.push([c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r * 0.8]) } const cc = `${r1(c[0])} ${r1(c[1])}`; return `<g opacity=".3">${poly(p, col)}<animateTransform attributeName="transform" type="rotate" values="0 ${cc};8 ${cc};0 ${cc}" dur="2s" repeatCount="indefinite"/></g>` },
  label: { fill: '#3b3026', bg: '#fbf6ec', size: 12, italic: true, weight: 500, font: 'Georgia, serif', rx: 2, wf: 0.55 },
  bubble: { bg: '#3b3026', fg: '#fbf6ec', rx: 2 },
  link: '#7a5ea8',
  overlay: k => `<rect width="${VW}" height="${VH}" filter="url(#${k}-grain)" opacity=".22"/>`,
},
{
  k: 'arcade', name: 'Arcade', font: "'Lucida Console', ui-monospace, monospace", snap: 4,
  col: { fable: '#ffa300', opus: '#ff004d', sonnet: '#29adff', haiku: '#00e436', orch: '#ff77a8' },
  bg: () => `<rect width="${VW}" height="${VH}" fill="#1d2b53"/>`,
  floor: () => slab({ top: '#5f574f', front: '#000000', side: '#111111' }) + checker('#544d46'),
  belt: { top: '#000000', side: '#5f574f', stripe: '#ffec27', gap: 0.35, stripeW: 4, rail: '#c2c3c7', railW: 2 },
  fig: { kind: 'voxel', skin: '#ffccaa', stroke: '#000000', sw: 1.2, legs: '#1d2b53' },
  console: '#83769c',
  pkg: { top: '#c0683a', front: '#ab5236', side: '#7e2553', stroke: '#000', sw: 1.5, stampStroke: '#000' },
  chat: { frame: '#c2c3c7', screen: '#000000', head: '#1d2b53', text: '#00e436', muted: '#008751', user: '#7e2553', userText: '#fff1e8', ai: '#111111', accent: '#ffec27', input: '#000', inputStroke: '#00e436', slot: '#1d2b53', stroke: '#000', sw: 2 },
  activeUnder: (k, F, B) => `<rect x="${r1(B[0] - 30)}" y="${r1(B[1] - 6)}" width="60" height="12" fill="none" stroke="#ffec27" stroke-width="4"><animate attributeName="opacity" values="1;0" dur="0.5s" calcMode="discrete" repeatCount="indefinite"/></rect>`,
  label: { fill: '#fff1e8', bg: '#000000', size: 10, upper: true, rx: 0, wf: 0.7, weight: 700 },
  bubble: { bg: '#ffec27', fg: '#000000', rx: 0 },
  link: '#ff77a8',
  overlay: (k, state) => scan(3, 0.22) + `<text x="${VW - 14}" y="${VH - 16}" text-anchor="end" font-family="Lucida Console, monospace" font-size="16" font-weight="700" fill="#ffec27">GELIEFERT ${String(state.counts.done).padStart(4, '0')}</text>`,
},
{
  k: 'holo', name: 'Holo-Labor', font: "'Segoe UI', system-ui, sans-serif",
  col: { fable: '#ffd166', opus: '#ff8fab', sonnet: '#5ec8ff', haiku: '#3ff2a8', orch: '#c3a6ff' },
  defs: k => `<radialGradient id="${k}-bg" cx="50%" cy="60%" r="75%"><stop offset="0" stop-color="#083238"/><stop offset="1" stop-color="#020a0c"/></radialGradient><linearGradient id="${k}-scan" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3ff2e0" stop-opacity="0"/><stop offset=".5" stop-color="#3ff2e0" stop-opacity=".16"/><stop offset="1" stop-color="#3ff2e0" stop-opacity="0"/></linearGradient>`,
  bg: k => `<rect width="${VW}" height="${VH}" fill="url(#${k}-bg)"/>`,
  floor: k => poly(FLOOR, '#0b3a40', { op: 0.45 }) + grid(0.5, '#3ff2e0', 0.6, 0.14) + grid(2, '#3ff2e0', 1, 0.3) + `<polygon points="${pts(FLOOR)}" fill="none" stroke="#3ff2e0" stroke-width="1.4" filter="url(#${k}-glow)"/>`,
  belt: { top: '#3ff2e01c', side: '#3ff2e00d', stroke: '#3ff2e0aa', sw: 0.8, stripe: '#3ff2e055', gap: 0.25 },
  fig: { kind: 'holo' },
  console: '#0d4d55', consoleO: { stroke: '#3ff2e0', sw: 0.8 },
  pkg: { top: '#ffd16633', front: '#ffd16622', side: '#ffd16618', stroke: '#ffd166', sw: 1.4, filter: 'glow' },
  chat: { frame: '#0a3a40', screen: '#021316', head: '#06262b', text: '#bff9f3', muted: '#5fa8a1', user: '#0f5a61', ai: '#04201f', aiStroke: '#3ff2e0', accent: '#3ff2e0', accentText: '#021316', input: '#021a1d', inputStroke: '#3ff2e077', slot: '#000', stroke: '#3ff2e0', sw: 0.8 },
  activeUnder: (k, F, B, col) => { let s = ''; for (let i = 0; i < 3; i++) s += `<ellipse cx="${r1(B[0])}" cy="${r1(B[1])}" rx="${r1(0.55 * S)}" ry="${r1(0.2 * S)}" fill="none" stroke="${col}" stroke-width="1.6"><animate attributeName="cy" from="${r1(B[1])}" to="${r1(B[1] - 70)}" dur="1.2s" begin="${(i * 0.4).toFixed(1)}s" repeatCount="indefinite"/><animate attributeName="opacity" from="1" to="0" dur="1.2s" begin="${(i * 0.4).toFixed(1)}s" repeatCount="indefinite"/></ellipse>`; return s },
  label: { fill: '#bff9f3', size: 10, upper: true, ls: 2, weight: 400, wf: 0.72 },
  bubble: { bg: '#3ff2e0', fg: '#021316', rx: 2 },
  link: '#3ff2e0',
  overlay: k => `<rect y="-120" width="${VW}" height="120" fill="url(#${k}-scan)"><animate attributeName="y" from="-120" to="${VH}" dur="5s" repeatCount="indefinite"/></rect>`,
},
{
  k: 'holz', name: 'Holzspielzeug', font: "'Segoe UI', system-ui, sans-serif",
  col: { fable: '#e8a628', opus: '#d6452f', sonnet: '#2f6fd6', haiku: '#2e9e5b', orch: '#8a4fc7' },
  defs: k => `<linearGradient id="${k}-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e9eef2"/><stop offset="1" stop-color="#cfd8df"/></linearGradient>` +
    `<linearGradient id="${k}-woodv" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#c9955c"/><stop offset=".45" stop-color="#f0cc98"/><stop offset="1" stop-color="#b9824a"/></linearGradient>` +
    `<radialGradient id="${k}-ball" cx="38%" cy="32%" r="70%"><stop offset="0" stop-color="#fbe3bf"/><stop offset="1" stop-color="#d49a5e"/></radialGradient>` +
    `<linearGradient id="${k}-board" x1="0" y1="0" x2="1" y2=".2"><stop offset="0" stop-color="#e7c18b"/><stop offset="1" stop-color="#d8ab70"/></linearGradient>`,
  bg: k => `<rect width="${VW}" height="${VH}" fill="url(#${k}-bg)"/>`,
  floor: k => { let s = slab({ top: `url(#${k}-board)`, front: '#b98a58', side: '#a3774a' }); for (let d = FD0 + 0.2; d < FD1; d += 0.42) s += line(P(FX0, d), P(FX1, d + Math.sin(d * 3) * 0.08), '#b98a58', 1, ' opacity=".35"'); return s },
  beltShadow: '#8a623b55',
  belt: { top: '#4f7d5a', side: '#c49a68', stripe: '#5d8c67', gap: 0.5, stripeW: 2, legs: '#b07f4c' },
  fig: { kind: 'peg' },
  shadow: '#8a623b',
  console: '#c49a68',
  pkg: { top: '#f0cf8c', front: '#e8c07a', side: '#d4a85e', stroke: '#b5874a', sw: 0.8, letter: '#d6452f' },
  chat: { frame: '#c49a68', screen: '#fbf7ef', head: '#efe4d1', text: '#4a3524', muted: '#9a836b', user: '#2f6fd6', ai: '#efe4d1', accent: '#2e9e5b', accentText: '#fff', input: '#ffffff', inputStroke: '#dcc7a6', slot: '#5a3f26', stroke: '#a3774a', sw: 1 },
  activeUnder: (k, F, B, col) => `<ellipse cx="${r1(B[0])}" cy="${r1(B[1])}" rx="${r1(0.6 * S)}" ry="${r1(0.24 * S)}" fill="${col}" opacity=".25"/>`,
  label: { fill: '#4a3524', bg: '#fbf7ef', stroke: '#c49a68', size: 11, weight: 700, rx: 10 },
  bubble: { bg: '#4a3524', fg: '#fbf7ef' },
  link: '#8a4fc7',
  overlay: () => `<polygon points="560,0 700,0 420,${VH} 280,${VH}" fill="#ffffff" opacity=".13"/><polygon points="730,0 790,0 510,${VH} 450,${VH}" fill="#ffffff" opacity=".09"/>`,
},
{
  k: 'kino', name: 'Nachtschicht', font: "Bahnschrift, 'Arial Narrow', sans-serif",
  col: { fable: '#c9a24a', opus: '#b8583a', sonnet: '#4f6fae', haiku: '#4f9070', orch: '#7f6aa8' },
  defs: k => `<radialGradient id="${k}-fl" cx="50%" cy="50%" r="60%"><stop offset="0" stop-color="#23262b"/><stop offset="1" stop-color="#0f1012"/></radialGradient>` +
    `<linearGradient id="${k}-cone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff4dc" stop-opacity=".05"/><stop offset="1" stop-color="#fff4dc" stop-opacity=".3"/></linearGradient>` +
    `<radialGradient id="${k}-pool" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#fff4dc" stop-opacity=".45"/><stop offset="1" stop-color="#fff4dc" stop-opacity="0"/></radialGradient>` +
    `<radialGradient id="${k}-vig" cx="50%" cy="55%" r="65%"><stop offset=".45" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#030304" stop-opacity=".85"/></radialGradient>`,
  bg: () => `<rect width="${VW}" height="${VH}" fill="#08090b"/>`,
  floor: k => slab({ top: `url(#${k}-fl)`, front: '#0b0c0e', side: '#08090a' }),
  belt: { top: '#111215', side: '#1b1d21', stripe: '#1e2024', gap: 0.22, rail: '#3e424a', railW: 1 },
  fig: { kind: 'block', body: '#1c1e23', skin: '#26292f', stroke: '#3a3e46', sw: 0.6, lit: true },
  console: '#16181c',
  pkg: { top: '#ffc777', front: '#ffb347', side: '#e08f22', stroke: '#fff0d0', sw: 0.5, filter: 'glow' },
  chat: { frame: '#121418', screen: '#0b0d10', head: '#14171b', text: '#d9d4c7', muted: '#6c6a64', user: '#3b3f48', ai: '#15181c', accent: '#ffb347', accentText: '#1b1205', input: '#101216', slot: '#000', stroke: '#22252b', sw: 1 },
  label: { fill: '#d9d4c7', size: 11, upper: true, ls: 1.6, weight: 600, font: "Bahnschrift, 'Arial Narrow', sans-serif", wf: 0.66 },
  bubble: { bg: '#ffb347', fg: '#1b1205', rx: 2 },
  link: '#ffb347',
  overlayMid: (k, active) => {
    let s = ''
    for (const idx of active.keys()) {
      const B = P(ST[idx].x, ST[idx].d, 0)
      s += `<polygon points="${r1(B[0] - 12)},0 ${r1(B[0] + 12)},0 ${r1(B[0] + 75)},${r1(B[1] + 12)} ${r1(B[0] - 75)},${r1(B[1] + 12)}" fill="url(#${k}-cone)"/><ellipse cx="${r1(B[0])}" cy="${r1(B[1])}" rx="80" ry="26" fill="url(#${k}-pool)"/>`
    }
    return s
  },
  overlay: k => `<rect width="${VW}" height="${VH}" fill="url(#${k}-vig)"/><rect width="${VW}" height="8" fill="#000"/><rect y="${VH - 22}" width="${VW}" height="22" fill="#000"/>`,
},
]
export const DEFAULT_DESIGN = 'claude'
// Width over height of the drawing.
export const ASPECT = VW / VH

// The last log lines, drawn into the hall's bottom left corner.
function logSvg(st, log) {
  const L = st.label, lines = log.slice(-3)
  let s = ''
  lines.forEach((entry, i) => {
    const txt = cut(entry, 44), y = VH - 14 - (lines.length - 1 - i) * 24, w = txt.length * 7.3 + 18
    s += `<rect x="${VX + 8}" y="${y - 16}" width="${r1(w)}" height="22" rx="${L.rx ?? 6}" fill="${L.bg || '#00000088'}"${L.stroke ? ` stroke="${L.stroke}"` : ''} opacity="${(0.55 + 0.15 * i).toFixed(2)}"/>`
    s += `<text x="${VX + 16}" y="${y}" font-size="13" font-weight="500" fill="${L.fill}" font-family="${L.font || st.font}" opacity="${(0.7 + 0.15 * i).toFixed(2)}">${esc(txt)}</text>`
  })
  return s
}

// Which stations work right now, and what each one says.
function activity(state) {
  const active = new Map(), counts = new Map()
  for (const w of state.workers) {
    if (w.status !== 'run') continue
    counts.set(w.station, (counts.get(w.station) || 0) + 1)
    if (!active.has(w.station) || w.tool) active.set(w.station, w.tool)
  }
  if (state.phase === 'work' && active.size === 0 && state.pkg >= 0 && state.pkg <= 5) active.set(state.pkg, '')
  return { active, counts }
}

export function renderScene(state, design, note = '') {
  const st = DESIGNS.find(d => d.k === design) || DESIGNS[0]
  SNAP = st.snap || 0
  try {
    const k = st.k, col = Object.assign({}, MC, st.col || {})
    const { active, counts } = activity(state)
    const orchOn = state.phase === 'work'
    const items = beltItems(st)
    ST.forEach((F, i) => items.push({ d: F.d, x: F.x, svg: figure(st, F, col[F.m], active.has(i)) }))
    items.push({ d: ORCH.d, x: ORCH.x, svg: figure(st, ORCH, col.orch, orchOn) })
    // The package: at a station, or riding back into the chat once. While it
    // travels it is drawn above the belt, so the rails never cover it.
    let riding = ''
    if (state.pkg >= 0 && (state.pkg <= 5 || state.moving)) {
      const end = state.pkg > 5 ? { x: XS, d: Y1 } : { x: ST[state.pkg].bx, d: ST[state.pkg].bd }
      let g = pkgSvg(st, end, state.stamps, col)
      const t = state.moving ? trip(state.from, state.pkg) : { svg: '', dur: 0 }
      g += t.svg
      if (state.pkg > 5) g += `<animate attributeName="opacity" from="1" to="0" begin="${Math.max(0, t.dur - 0.3).toFixed(2)}s" dur="0.5s" fill="freeze"/>`
      const svg = `<g${st.pkg.filter ? ` filter="url(#${k}-${st.pkg.filter})"` : ''}>${g}</g>`
      if (state.moving) riding = svg
      else items.push({ d: end.d - 0.3, x: end.x, svg })
    }
    items.sort((a, b) => b.d - a.d || a.x - b.x)
    let out = `<svg viewBox="0 0 ${VW} ${VH}" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg"${st.snap ? ' shape-rendering="crispEdges"' : ''}>`
    out += `<defs>${baseDefs(k)}${st.defs ? st.defs(k) : ''}</defs>`
    out += st.bg(k) + st.floor(k)
    if (st.beltShadow) out += `<polygon points="${pts([...PATH.outer.map(q => P(q[0] + 0.15, q[1] - 0.1, 0)), ...PATH.inner.slice().reverse().map(q => P(q[0] + 0.15, q[1] - 0.1, 0))])}" fill="${st.beltShadow}" filter="url(#${k}-blur)"/>`
    out += wallSvg(st) + boardSvg(st, state, active)
    out += chatSvg(st, state)
    out += items.map(i => i.svg).join('') + riding
    if (st.link) {
      const a = P(ORCH.x, ORCH.d, headTop(st, ORCH) - 0.2)
      for (const idx of active.keys()) {
        const b = P(ST[idx].x, ST[idx].d, headTop(st, ST[idx]) - 0.2)
        out += `<line x1="${r1(a[0])}" y1="${r1(a[1])}" x2="${r1(b[0])}" y2="${r1(b[1])}" stroke="${st.link}" stroke-width="1.6" stroke-dasharray="5 5" opacity=".85"><animate attributeName="stroke-dashoffset" from="0" to="-20" dur="0.8s" repeatCount="indefinite"/></line>`
      }
    }
    if (st.overlayMid) out += st.overlayMid(k, active)
    const said = new Map(active)
    if (orchOn && state.orchTool) said.set(-1, state.orchTool)
    out += labelSvg(st, said, col, counts)
    if (st.overlay) out += st.overlay(k, state)
    out += logSvg(st, state.log) + headerSvg(st, state)
    if (note) out += `<text x="${VW - 12}" y="${VH - 8}" text-anchor="end" font-size="11" fill="${st.label.fill}" opacity=".45" font-family="${st.font}">${esc(note)}</text>`
    return out + '</svg>'
  } finally {
    SNAP = 0
  }
}

export function describeScene(state) {
  if (state.phase === 'idle') return 'Halle 3: Das Band steht, kein Auftrag.'
  const { active } = activity(state)
  const where = state.pkg < 0 ? 'am Chat' : state.pkg > 5 ? 'zurück im Chat' : `bei ${ST[state.pkg].name} (${ST[state.pkg].role})`
  const busy = [...active.keys()].map(i => ST[i].name).join(', ')
  return `Halle 3: Auftrag ${where}.` + (busy ? ` Es arbeiten: ${busy}.` : '') + (state.phase === 'done' ? ' Fertig.' : state.phase === 'stopped' ? ' Abgebrochen.' : '')
}
