// Isometric factory hall, drawn as one SVG string from plain state.
// Pure: no DOM, no clock. Used by the mod's pane and by the preview page.

const C = 22
const H = 22
const OX = 232
const OY = 128
const W = 600
const HT = 430

const P = (x, y, z = 0) => [OX + (x - y) * C, OY + ((x + y) * C) / 2 - z * H]
const pt = a => a[0].toFixed(1) + ',' + a[1].toFixed(1)
const poly = (pts, cls, extra = '') => `<polygon points="${pts.map(pt).join(' ')}" class="${cls}"${extra}/>`
const line = (a, b, cls) =>
  `<line x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${b[0].toFixed(1)}" y2="${b[1].toFixed(1)}" class="${cls}"/>`
const esc = s =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
const cut = (s, n) => (s.length > n ? s.slice(0, n - 1) + '…' : s)

// A box with three visible faces: top, +y face (lit), +x face (shaded).
function box(x, y, z, w, d, h, cls, style = '') {
  const st = style ? ` style="${style}"` : ''
  const t = [P(x, y, z + h), P(x + w, y, z + h), P(x + w, y + d, z + h), P(x, y + d, z + h)]
  const l = [P(x, y + d, z + h), P(x + w, y + d, z + h), P(x + w, y + d, z), P(x, y + d, z)]
  const r = [P(x + w, y, z + h), P(x + w, y + d, z + h), P(x + w, y + d, z), P(x + w, y, z)]
  return `<g class="${cls}"${st}>${poly(l, 'l')}${poly(r, 'r')}${poly(t, 't')}</g>`
}

const MODEL = {
  orch: { color: 'var(--c-orch)', name: 'Orchestrator' },
  fable: { color: 'var(--c-fable)', name: 'Fable' },
  sonnet: { color: 'var(--c-sonnet)', name: 'Sonnet' },
  opus: { color: 'var(--c-opus)', name: 'Opus' },
  haiku: { color: 'var(--c-haiku)', name: 'Haiku' },
  other: { color: 'var(--c-other)', name: 'Agent' },
}

function hat(kind, x, y, z) {
  if (kind === 'orch') {
    return (
      box(x + 0.2, y + 0.2, z, 0.7, 0.7, 0.16, 'm-gold') +
      box(x + 0.2, y + 0.2, z + 0.16, 0.16, 0.16, 0.16, 'm-gold') +
      box(x + 0.74, y + 0.2, z + 0.16, 0.16, 0.16, 0.16, 'm-gold') +
      box(x + 0.2, y + 0.74, z + 0.16, 0.16, 0.16, 0.16, 'm-gold') +
      box(x + 0.74, y + 0.74, z + 0.16, 0.16, 0.16, 0.16, 'm-gold') +
      box(x + 0.47, y + 0.74, z + 0.16, 0.16, 0.16, 0.12, 'm-gem')
    )
  }
  if (kind === 'sonnet') {
    return box(x + 0.03, y + 0.03, z, 1.04, 1.04, 0.09, 'm-model') + box(x + 0.2, y + 0.2, z + 0.09, 0.7, 0.7, 0.28, 'm-model')
  }
  if (kind === 'opus') {
    return (
      box(x, y, z, 1.1, 1.1, 0.07, 'm-hat') +
      box(x + 0.25, y + 0.25, z + 0.07, 0.6, 0.6, 0.12, 'm-model') +
      box(x + 0.25, y + 0.25, z + 0.19, 0.6, 0.6, 0.42, 'm-hat')
    )
  }
  if (kind === 'fable') {
    return box(x + 0.08, y + 0.02, z, 0.98, 0.98, 0.15, 'm-model') + box(x + 0.5, y + 0.44, z + 0.15, 0.14, 0.14, 0.1, 'm-model')
  }
  if (kind === 'haiku') {
    return box(x + 0.15, y + 0.12, z, 0.8, 0.8, 0.2, 'm-model') + box(x + 0.15, y + 0.92, z, 0.8, 0.3, 0.06, 'm-model')
  }
  return box(x + 0.5, y + 0.5, z, 0.08, 0.08, 0.34, 'm-hat') + box(x + 0.44, y + 0.44, z + 0.34, 0.2, 0.2, 0.16, 'm-model')
}

// One blocky figure: cube body, four legs, two arm nubs, "> <" eyes, a hat per model.
function figure(x, y, z, kind, o = {}) {
  const m = MODEL[kind] || MODEL.other
  const legs = [
    [0.06, 0.06],
    [0.76, 0.06],
    [0.06, 0.76],
    [0.76, 0.76],
  ]
    .map(([dx, dy]) => box(x + dx, y + dy, z, 0.28, 0.28, 0.3, 'm-leg'))
    .join('')
  const f = (u, v) => P(x + u * 1.1, y + 1.1, z + 0.3 + v * 0.85)
  const eye = pts => `<polyline points="${pts.map(pt).join(' ')}" class="eye"/>`
  const eyes = o.done
    ? eye([f(0.18, 0.5), f(0.28, 0.62), f(0.38, 0.5)]) + eye([f(0.62, 0.5), f(0.72, 0.62), f(0.82, 0.5)])
    : eye([f(0.2, 0.74), f(0.37, 0.57), f(0.2, 0.4)]) + eye([f(0.8, 0.74), f(0.63, 0.57), f(0.8, 0.4)])
  const paper = o.work
    ? `<g class="paper">${poly([P(x + 1.32, y + 0.5, z + 1.0), P(x + 1.32, y + 0.95, z + 1.0), P(x + 1.32, y + 0.95, z + 0.5), P(x + 1.32, y + 0.5, z + 0.5)], 'sheet')}</g>`
    : ''
  const ring = poly([P(x - 0.25, y - 0.25, z), P(x + 1.35, y - 0.25, z), P(x + 1.35, y + 1.35, z), P(x - 0.25, y + 1.35, z)], 'ring')
  const cls = 'fig' + (o.work ? ' work' : '') + (o.fresh ? ' fresh' : '') + (o.failed ? ' failed' : '')
  return (
    `<g style="--mc:${m.color}">${ring}<g class="${cls}" style="--delay:${o.delay || 0}s">` +
    legs +
    box(x - 0.17, y + 0.4, z + 0.52, 0.17, 0.3, 0.22, 'm-body') +
    box(x, y, z + 0.3, 1.1, 1.1, 0.85, 'm-body') +
    eyes +
    box(x + 1.1, y + 0.4, z + 0.52, 0.17, 0.3, 0.22, 'm-body') +
    paper +
    hat(kind, x, y, z + 1.15) +
    `</g></g>`
  )
}

function tag(x, y, z, title, sub) {
  const [sx, sy] = P(x + 0.55, y + 1.25, z)
  const w = Math.max(title.length * 6.4, sub.length * 5.2) + 14
  return (
    `<g class="tag" transform="translate(${sx.toFixed(1)},${(sy + 8).toFixed(1)})">` +
    `<rect x="${(-w / 2).toFixed(1)}" y="0" width="${w.toFixed(1)}" height="${sub ? 27 : 16}" rx="5" class="tagbg"/>` +
    `<text y="11.5" class="tagt">${esc(title)}</text>` +
    (sub ? `<text y="22.5" class="tags">${esc(sub)}</text>` : '') +
    `</g>`
  )
}

function bubble(x, y, z, text) {
  const [sx, sy] = P(x + 0.55, y + 0.55, z + 2.15)
  const w = text.length * 6 + 16
  return (
    `<g class="bubble" transform="translate(${sx.toFixed(1)},${sy.toFixed(1)})">` +
    `<rect x="${(-w / 2).toFixed(1)}" y="-10" width="${w.toFixed(1)}" height="18" rx="9" class="bubbg"/>` +
    `<path d="M-4 8 L0 13 L4 8 Z" class="bubbg"/>` +
    `<text y="3" class="bubt">${esc(text)}</text></g>`
  )
}

function crate(x, y, z, color, label, cls = '', style = '') {
  const [sx, sy] = P(x + 0.3, y + 0.6, z + 0.25)
  return (
    `<g class="crate ${cls}" style="--mc:${color};${style}">` +
    box(x, y, z, 0.6, 0.6, 0.5, 'm-model') +
    (label ? `<text x="${(sx - 6).toFixed(1)}" y="${(sy + 3).toFixed(1)}" class="cratet" transform="skewY(26.6)" transform-origin="${sx.toFixed(1)} ${sy.toFixed(1)}">${esc(label)}</text>` : '') +
    `</g>`
  )
}

const SLOT = i => 3.6 + i * 2.8
const ORCH = { x: 1.3, y: 1.2, z: 2.8 }

const STYLE = mode => {
  const night = `--bg:#0b0c20;--floor:#1b1d44;--floor2:#22255a;--wall:#15173c;--wall2:#101232;--steel:#3c4078;--belt:#0e0f2a;--win:#3a4fc4;--win2:#5a7bff;--line:#ff9d3c;--ink:#eceeff;--mut:#a3a9da;--tagbg:#0d0e24;--shade:#04051a;--cone:.13;--ringo:.95;--rail:#ffd84a;--sign:#ffd84a;--body:#f08a48;--leg:#d8703a;--eye:#1a1030;--paper:#f6f3e6;--c-orch:#ffd84a;--c-fable:#c58bff;--c-sonnet:#3dffa0;--c-opus:#ff9d3c;--c-haiku:#5ad8ff;--c-other:#a3a9da;--hat:#2a2c5e;--glow:1`
  const day = `--bg:#f4eee2;--floor:#e7dccb;--floor2:#ddd0bb;--wall:#faf5ec;--wall2:#efe6d6;--steel:#a3978a;--belt:#5a5048;--win:#bfe3f2;--win2:#e6f5fb;--line:#c96442;--ink:#2a231b;--mut:#6b6153;--tagbg:#fffaf0;--shade:#4a3524;--cone:0;--ringo:.55;--rail:#e0a52c;--sign:#c96442;--body:#e27d42;--leg:#c96a34;--eye:#2a1a10;--paper:#ffffff;--c-orch:#d9a514;--c-fable:#8e5fd0;--c-sonnet:#3f9a5c;--c-opus:#c96442;--c-haiku:#2f8fb5;--c-other:#8a7f70;--hat:#3a322b;--glow:0`
  const base = mode === 'dark' ? night : day
  const auto = mode === 'auto' ? `@media (prefers-color-scheme:dark){svg{${night}}}` : ''
  return `
svg{${base};font-family:system-ui,-apple-system,"Segoe UI",sans-serif}
${auto}
.bgr{fill:var(--bg)}
.t{fill:var(--m)}.l{fill:color-mix(in srgb,var(--m) 84%,var(--shade))}.r{fill:color-mix(in srgb,var(--m) 66%,var(--shade))}
.m-floor{--m:var(--floor)}.m-steel{--m:var(--steel)}.m-belt{--m:var(--belt)}.m-body{--m:var(--body)}.m-leg{--m:var(--leg)}
.m-gold{--m:#f2c230}.m-gem{--m:#e0445a}.m-hat{--m:var(--hat)}.m-model{--m:var(--mc)}
.floor{fill:var(--floor)}.tile{stroke:var(--floor2);stroke-width:1;fill:none}
.wallx{fill:var(--wall)}.wally{fill:var(--wall2)}
.win{fill:var(--win);stroke:var(--win2);stroke-width:1}
.sign{fill:var(--sign);font-weight:800;font-size:19px;letter-spacing:1.5px}
.signs{fill:var(--mut);font-weight:600;font-size:8px;letter-spacing:1.2px}
.rail{stroke:var(--rail);stroke-width:2.5;stroke-linecap:round}
.post{stroke:var(--steel);stroke-width:1.6}
.haz{stroke:var(--rail);stroke-width:3;stroke-dasharray:7 6}
.flow{stroke:var(--line);stroke-width:2;stroke-dasharray:5 11;stroke-linecap:round;opacity:.9}
.neon{stroke:var(--line);stroke-width:2;opacity:calc(var(--glow)*.9)}
.cord{stroke:var(--mut);stroke-width:1}
.shade{fill:var(--steel)}
.bulb{fill:#ffe6a8}
.cone{fill:#ffd590;opacity:var(--cone)}
.screen{fill:var(--line);opacity:.85}
.ring{fill:none;stroke:var(--mc);stroke-width:2;opacity:var(--ringo)}
.eye{fill:none;stroke:var(--eye);stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round}
.sheet{fill:var(--paper);stroke:var(--mut);stroke-width:.6}
.tagbg{fill:var(--tagbg);stroke:var(--mc,var(--mut));stroke-width:1.2}
.tagt{fill:var(--ink);font-size:10.5px;font-weight:700;text-anchor:middle}
.tags{fill:var(--mut);font-size:8.5px;text-anchor:middle}
.bubbg{fill:var(--paper)}
.bubt{fill:#221a2c;font-size:10px;font-weight:700;text-anchor:middle}
.cratet{fill:#1a1420;font-size:8px;font-weight:800}
.hud{fill:var(--ink);font-size:11px;font-weight:600}
.hudm{fill:var(--mut);font-size:10.5px}
.note{opacity:0}
.fig{animation:breathe 3.2s ease-in-out var(--delay) infinite alternate}
.fig.work{animation:work .62s cubic-bezier(.45,0,.55,1) var(--delay) infinite alternate}
.fig.fresh{animation:dropin .7s cubic-bezier(.2,1.3,.4,1) both, work .62s cubic-bezier(.45,0,.55,1) .7s infinite alternate}
.fig.failed{opacity:.55}
.paper{animation:flap .31s ease-in-out infinite alternate}
.run .flow{animation:flow .9s linear infinite}
.crate.busy{animation:jig .62s ease-in-out infinite alternate}
.crate.arrive{animation:arrive 1.3s cubic-bezier(.25,.8,.3,1) both}
.crate.pr.fly{animation:prfly 1.7s cubic-bezier(.4,0,.2,1) both}
.note.fly{animation:notefly 1.6s cubic-bezier(.4,0,.2,1) both}
.ring{animation:pulse 1.8s ease-in-out infinite alternate}
@keyframes breathe{to{transform:translateY(-1.2px)}}
@keyframes work{to{transform:translateY(-3.5px)}}
@keyframes dropin{from{transform:translateY(-26px);opacity:0}60%{opacity:1}}
@keyframes flap{to{transform:translateY(-2.5px)}}
@keyframes flow{to{stroke-dashoffset:-16}}
@keyframes jig{to{transform:translateY(-1.5px)}}
@keyframes arrive{from{transform:translate(var(--dx),var(--dy));opacity:.2}}
@keyframes prfly{from{transform:translate(var(--dx),var(--dy))}55%{transform:translate(calc(var(--dx)*.45),calc(var(--dy)*.45 - 46px))}}
@keyframes notefly{0%{transform:translate(var(--dx),var(--dy));opacity:0}12%{opacity:1}50%{transform:translate(calc(var(--dx)*.5),calc(var(--dy)*.5 - 38px)) rotate(8deg)}88%{opacity:1}100%{transform:translate(0,0);opacity:0}}
@keyframes pulse{from{opacity:calc(var(--ringo)*.45)}}
@media (prefers-reduced-motion:reduce){*{animation:none!important}}
`
}

/**
 * @param {object} s  state: { phase, task, orchTool, workers[], note, prFresh, counts }
 * @param {{mode?: 'auto'|'light'|'dark'}} [o]
 */
export function renderScene(s, o = {}) {
  const mode = o.mode || 'auto'
  const workers = (s.workers || []).slice(-4)
  const hidden = Math.max(0, (s.workers || []).length - workers.length)
  const running = workers.filter(w => w.status === 'run').length
  const out = []
  out.push(`<rect width="${W}" height="${HT}" class="bgr"/>`)

  // walls
  out.push(poly([P(0, 0, 0), P(16, 0, 0), P(16, 0, 5), P(0, 0, 5)], 'wallx'))
  out.push(poly([P(0, 0, 0), P(0, 9, 0), P(0, 9, 5), P(0, 0, 5)], 'wally'))
  for (let k = 0; k < 6; k++) {
    const x0 = 4.3 + k * 1.9
    out.push(poly([P(x0, 0, 2.5), P(x0 + 1.4, 0, 2.5), P(x0 + 1.4, 0, 4.4), P(x0, 0, 4.4)], 'win'))
  }
  for (let k = 0; k < 3; k++) {
    const y0 = 3.7 + k * 1.8
    out.push(poly([P(0, y0, 2.5), P(0, y0 + 1.3, 2.5), P(0, y0 + 1.3, 4.4), P(0, y0, 4.4)], 'win'))
  }
  const sg = P(4.4, 0, 1.25)
  out.push(`<text transform="matrix(1,.5,0,1,${sg[0].toFixed(1)},${sg[1].toFixed(1)})" class="sign">HALLE 3</text>`)
  const sg2 = P(9.3, 0, 1.55)
  out.push(`<text transform="matrix(1,.5,0,1,${sg2[0].toFixed(1)},${sg2[1].toFixed(1)})" class="signs">MODELL-MONTAGE</text>`)
  out.push(line(P(0, 0, 2.2), P(16, 0, 2.2), 'neon'))

  // floor
  out.push(poly([P(0, 0), P(16, 0), P(16, 9), P(0, 9)], 'floor'))
  for (let x = 2; x < 16; x += 2) out.push(line(P(x, 0), P(x, 9), 'tile'))
  for (let y = 1.5; y < 9; y += 1.5) out.push(line(P(0, y), P(16, y), 'tile'))
  out.push(line(P(1.6, 7.4, 0.01), P(15.6, 7.4, 0.01), 'haz'))

  // lamps
  workers.concat(workers.length ? [] : [{}]).forEach((_, i) => {
    const x = SLOT(i) + 0.55
    const y = 4.6
    const top = P(x, y, 6.2)
    const b = P(x, y, 4.7)
    out.push(poly([P(x - 1.5, y - 1.5), P(x + 1.5, y - 1.5), P(x + 1.5, y + 1.5), P(x - 1.5, y + 1.5)].concat([[b[0] + 7, b[1]], [b[0] - 7, b[1]]]), 'cone'))
    out.push(line(top, b, 'cord'))
    out.push(`<path d="M${(b[0] - 9).toFixed(1)} ${(b[1] + 5).toFixed(1)} L${b[0].toFixed(1)} ${(b[1] - 4).toFixed(1)} L${(b[0] + 9).toFixed(1)} ${(b[1] + 5).toFixed(1)} Z" class="shade"/>`)
    out.push(`<circle cx="${b[0].toFixed(1)}" cy="${(b[1] + 5).toFixed(1)}" r="2.6" class="bulb"/>`)
  })

  // gantry (orchestrator's control stand)
  ;[
    [0.5, 0.5],
    [3.1, 0.5],
    [0.5, 2.9],
    [3.1, 2.9],
  ].forEach(([x, y]) => out.push(box(x, y, 0, 0.22, 0.22, 2.6, 'm-steel')))
  out.push(box(0.4, 0.4, 2.6, 3.0, 2.8, 0.2, 'm-steel'))
  out.push(box(0.6, 0.55, 2.8, 1.9, 0.4, 0.75, 'm-steel'))
  out.push(poly([P(0.75, 0.95, 3.45), P(2.35, 0.95, 3.45), P(2.35, 0.95, 3.0), P(0.75, 0.95, 3.0)], 'screen'))
  const orchWork = s.phase === 'work'
  out.push(figure(ORCH.x, ORCH.y, ORCH.z, 'orch', { work: orchWork && !running, done: s.phase === 'done' }))
  if (s.phase === 'done') {
    const dx = (13.2 - 2.55 - (6.0 - 1.5)) * C
    const dy = ((13.2 - 2.55 + (6.0 - 1.5)) * C) / 2 + (2.8 - 0.53) * H
    out.push(crate(2.55, 1.5, 2.8, 'var(--c-fable)', 'PR', 'pr' + (s.prFresh ? ' fly' : ''), `--dx:${dx.toFixed(1)}px;--dy:${dy.toFixed(1)}px`))
  }
  ;[0.4, 1.4, 2.4, 3.4].forEach(x => out.push(line(P(x, 3.2, 2.8), P(x, 3.2, 3.55), 'post')))
  out.push(line(P(0.4, 3.2, 3.55), P(3.4, 3.2, 3.55), 'rail'))
  ;[0.4, 1.8, 3.2].forEach(y => out.push(line(P(3.4, y, 2.8), P(3.4, y, 3.55), 'post')))
  out.push(line(P(3.4, 0.4, 3.55), P(3.4, 3.2, 3.55), 'rail'))

  // workers at their stations (behind the belt)
  workers.forEach((w, i) => {
    out.push(
      figure(SLOT(i), 4.05, 0, w.model, {
        work: w.status === 'run',
        done: w.status === 'done',
        failed: w.status === 'failed',
        fresh: w.fresh,
        delay: -(i * 0.17).toFixed(2),
      }),
    )
  })

  // conveyor belt
  out.push(`<g class="${s.phase === 'work' ? 'run' : ''}">`)
  out.push(box(2, 5.7, 0, 13.2, 1.2, 0.45, 'm-steel'))
  out.push(box(2.05, 5.8, 0.45, 13.1, 1.0, 0.08, 'm-belt'))
  out.push(line(P(2.2, 6.3, 0.54), P(15, 6.3, 0.54), 'flow'))
  out.push(line(P(2, 6.9, 0.56), P(15.2, 6.9, 0.56), 'rail'))
  out.push(line(P(2, 6.9, 0.12), P(15.2, 6.9, 0.12), 'neon'))
  out.push(`</g>`)

  // crates on the belt
  if (s.phase === 'work' && workers.length === 0) {
    out.push(crate(2.3, 6.0, 0.53, 'var(--c-orch)', '', 'busy'))
  }
  workers.forEach((w, i) => {
    const m = MODEL[w.model] || MODEL.other
    const x = SLOT(i) + 0.25
    const dx = (2.3 - x) * C
    const cls = w.status === 'run' ? (w.fresh ? 'arrive' : 'busy') : ''
    out.push(crate(x, 6.0, 0.53, m.color, w.status === 'done' ? '✓' : w.status === 'failed' ? '!' : '', cls, `--dx:${dx.toFixed(1)}px;--dy:${(dx / 2).toFixed(1)}px`))
  })

  // labels
  const orchText = s.phase === 'done' ? 'PR gemergt ✓' : s.phase === 'work' ? (s.orchTool ? '▶ ' + cut(s.orchTool, 16) : running ? 'koordiniert' : 'denkt …') : 'wartet'
  out.push(`<g style="--mc:var(--c-orch)">${tag(ORCH.x, ORCH.y, ORCH.z, 'Orchestrator', '')}</g>`)
  out.push(bubble(ORCH.x, ORCH.y, ORCH.z, orchText))
  workers.forEach((w, i) => {
    const m = MODEL[w.model] || MODEL.other
    out.push(`<g style="--mc:${m.color}">${tag(SLOT(i), 6.75, 0, m.name, cut(w.label || '', 20))}</g>`)
    if (w.status === 'run' && w.tool) out.push(bubble(SLOT(i), 4.05, 0, '▶ ' + cut(w.tool, 14)))
    if (w.status === 'failed') out.push(bubble(SLOT(i), 4.05, 0, 'gestoppt'))
  })
  if (hidden) {
    const p = P(15.2, 4.6, 0.6)
    out.push(`<text x="${p[0].toFixed(1)}" y="${p[1].toFixed(1)}" class="hud">+${hidden}</text>`)
  }

  // a note slip in flight
  if (s.note) {
    const idx = i => workers.findIndex(w => w.id === i)
    const pos = id => {
      const i = idx(id)
      return id === 'orch' || i < 0 ? P(ORCH.x + 0.55, ORCH.y + 0.55, ORCH.z + 1.9) : P(SLOT(i) + 0.55, 4.6, 1.9)
    }
    const a = pos(s.note.from)
    const b = pos(s.note.to)
    out.push(
      `<g class="note fly" style="--dx:${(a[0] - b[0]).toFixed(1)}px;--dy:${(a[1] - b[1]).toFixed(1)}px">` +
        `<g transform="translate(${b[0].toFixed(1)},${b[1].toFixed(1)})"><rect x="-9" y="-7" width="18" height="14" rx="2" class="sheet"/>` +
        `<line x1="-5" y1="-2" x2="5" y2="-2" class="cord"/><line x1="-5" y1="2" x2="2" y2="2" class="cord"/></g></g>`,
    )
  }

  // status strip
  const c = s.counts || {}
  out.push(`<text x="16" y="${HT - 30}" class="hud">${esc(s.phase === 'idle' ? 'Band steht. Warte auf die nächste Aufgabe.' : cut('Aufgabe: ' + (s.task || '…'), 70))}</text>`)
  out.push(`<text x="16" y="${HT - 13}" class="hudm">${running} aktiv · ${c.done || 0} fertig · ${c.notes || 0} Zettel · ${c.tools || 0} Werkzeugaufrufe</text>`)

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${HT}" width="${W}" height="${HT}" preserveAspectRatio="xMidYMid meet">` +
    `<style>${STYLE(mode)}</style>${out.join('')}</svg>`
  )
}

export function describeScene(s) {
  const ws = s.workers || []
  const run = ws.filter(w => w.status === 'run')
  if (s.phase === 'idle') return 'Fabrikhalle: Das Band steht, der Orchestrator wartet.'
  return `Fabrikhalle: ${run.length} Agenten arbeiten, ${ws.length - run.length} sind fertig. ${s.phase === 'done' ? 'Der Orchestrator hat das Ergebnis angenommen.' : ''}`
}
