import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register, ThemeSetArgs } from 'claude-code'

import type { FloorModel, FloorState, FloorWorker } from '../types'
import { makeColors } from './make-colors.js'
import { ASPECT, DEFAULT_DESIGN, DESIGNS, STATIONS, describeScene, renderScene } from './scene.js'

// Tag: helle, natürliche Claude-Farben (warmes Papier, Ton-Orange).
// Abend: Mitternachtsblau/-lila mit Neon-Komplementärakzenten.
const { theme, problems } = makeColors({
  label: 'Midnight Neon',
  roles: { accent: '#c2603c', danger: '#b3392f', success: '#4e7d3a', warning: '#a86f14', pro: '#7a5ea8' },
  light: {
    gray: {
      anchors: {
        'surface-0': '#f0ebe0',
        'surface-1': '#f6f2e9',
        'surface-2': '#fbf9f3',
        'text-primary': '#28231c',
        'text-secondary': '#51483c',
        'text-muted': '#6b6153',
      },
    },
  },
  dark: {
    roles: { accent: '#ff9d3c', danger: '#ff5577', success: '#3dffa0', warning: '#ffd84a', pro: '#c58bff' },
    gray: {
      anchors: {
        'surface-0': '#0d0e24',
        'surface-1': '#14163a',
        'surface-2': '#1b1d48',
        'surface-3': '#252853',
        'text-primary': '#eceeff',
        'text-secondary': '#c3c7f0',
        'text-muted': '#9ea4d6',
      },
    },
  },
})

const LOOK: ThemeSetArgs = { colors: theme }
const PANE = 'halle'
const TITLE = 'Halle 3'
// How long the drawing animates a trip along the belt before it stands still.
const TRIP_MS = 3200

const EMPTY: FloorState = {
  phase: 'idle',
  task: '',
  orchTool: '',
  pkg: -1,
  from: -1,
  moving: false,
  stamps: [],
  workers: [],
  counts: { done: 0, tools: 0 },
  log: [],
}

const floor = atom({ plugin: 'midnight-neon', key: 'floor' } as const, EMPTY, { shape: 'floor-2' })
const design = atom({ plugin: 'midnight-neon', key: 'design' } as const, DEFAULT_DESIGN, { shape: 'design-1' })
// The drawing's size in percent of what the pane's cells suggest. The engine
// gives a pane's size in text cells, not pixels: CELL_W and CELL_H are the
// desktop's cell as measured, and this lets the person correct the rest.
const ZOOMS = [50, 75, 100, 125, 150, 175, 200]
const CELL_W = 8
const CELL_H = 20
const zoom = atom({ plugin: 'midnight-neon', key: 'zoom' } as const, 100, { shape: 'zoom-1' })
const isZoom = (v: unknown): v is number => typeof v === 'number' && ZOOMS.includes(v)
// Light or dark hall: every design has both, its own and the flipped one.
type Mode = 'hell' | 'dunkel'
const mode = atom({ plugin: 'midnight-neon', key: 'mode' } as const, 'dunkel' as Mode, { shape: 'mode-1' })
const isMode = (v: unknown): v is Mode => v === 'hell' || v === 'dunkel'
const isDesign = (v: unknown): v is string => typeof v === 'string' && DESIGNS.some(d => d.k === v)

const family = (model: string): FloorModel => {
  const m = model.toLowerCase()

  return m.includes('fable') ? 'fable' : m.includes('opus') ? 'opus' : m.includes('sonnet') ? 'sonnet' : m.includes('haiku') ? 'haiku' : 'other'
}

// Each model has a fixed place on the belt. Opus and Fable stand twice: early
// in a job they plan (front), once drafting has started they revise or sign off.
const stationFor = (model: FloorModel, s: FloorState): number => {
  const late = s.pkg >= 2

  switch (model) {
    case 'haiku':
      return 2
    case 'opus':
      return late ? 4 : 1
    case 'fable':
      return late ? 5 : 0
    default:
      return 3
  }
}

const stationName = (i: number): string => STATIONS[i]?.name ?? 'Agent'
const logged = (s: FloorState, line: string): string[] => [...s.log, line].slice(-5)
const worker = (s: FloorState, id: string, fn: (w: FloorWorker) => FloorWorker): FloorWorker[] =>
  s.workers.map(w => (w.id === id ? fn(w) : w))
// Moves the package forward to a station; it never runs backwards.
const moveTo = (s: FloorState, to: number): FloorState =>
  to <= s.pkg ? s : { ...s, from: s.pkg, pkg: to, moving: true, stamps: s.pkg >= 0 && !s.stamps.includes(s.pkg) ? [...s.stamps, s.pkg] : s.stamps }

// The scene is decoration: a failed write must never get in the way of a turn or a tool.
const safely = async ($: EngineInterface, fn: (s: FloorState) => FloorState): Promise<void> => {
  try {
    await update($, floor, s => fn(s ?? EMPTY))
  } catch (error) {
    $.ui.log(`midnight-neon: ${String(error)}`)
  }
}
// One timer for the current trip: a newer trip cancels the older one's stop.
let trip: { cancel: () => void } | undefined
const settle = ($: EngineInterface): void => {
  trip?.cancel()
  trip = $.clock.after(TRIP_MS, () => {
    void safely($, s => (s.moving ? { ...s, moving: false } : s))
  })
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    // Register the command first: a failing theme must never take /halle down with it.
    await $.command.register({ name: 'halle', description: 'Zeigt die Fabrikhalle mit Orchestrator und Agenten' })
    try {
      const stored = await $.store.get('design')

      if (isDesign(stored)) {
        await update($, design, () => stored)
      }
      const lit = await $.store.get('mode')

      if (isMode(lit)) {
        await update($, mode, () => lit)
      }
      const size = await $.store.get('zoom')

      if (isZoom(size)) {
        await update($, zoom, () => size)
      }
    } catch (error) {
      $.ui.log(`midnight-neon design: ${String(error)}`)
    }
    try {
      const unpainted = problems.find(line => line.startsWith("Desktop won't paint"))

      if (unpainted !== undefined) {
        $.ui.toast(unpainted)
      }
      const set = await $.theme.set(LOOK)

      if (!set.isDrawn) {
        $.ui.status(set.reason)
      }
    } catch (error) {
      $.ui.log(`midnight-neon theme: ${String(error)}`)
    }
    void $.ui.open({ id: PANE, title: TITLE })

    return next(e)
  })

  on('command.run', { command: 'halle' }, async $ => {
    await $.ui.open({ id: PANE, title: TITLE })

    return { text: 'Halle 3 ist geöffnet.' }
  })

  // Your message lands on the belt as a package and rolls to the planners.
  on('turn.start', async ($, e, next) => {
    if (e.agentId === undefined) {
      await safely($, s => ({
        ...EMPTY,
        phase: 'work',
        task: e.text.replace(/\s+/g, ' ').slice(0, 80),
        pkg: 0,
        from: -1,
        moving: true,
        counts: s.counts,
        workers: s.workers.filter(w => w.status === 'run'),
        log: logged(s, 'Auftrag liegt auf dem Band'),
      }))
      settle($)
    }

    return next(e)
  })

  // A subagent starts at its model's station; the package rolls there.
  on('agent.spawn', async ($, e, next) => {
    const started = await next(e)
    const id = 'agentId' in started ? started.agentId : undefined

    if (typeof id === 'string') {
      const model = family('model' in started && typeof started.model === 'string' ? started.model : '')

      await safely($, s => {
        const station = stationFor(model, s)
        const moved = moveTo(s, station)

        return {
          ...moved,
          phase: 'work',
          workers: [...s.workers.filter(w => w.id !== id), { id, model, label: e.description.slice(0, 40), station, status: 'run' as const, tool: '' }].slice(-12),
          log: logged(s, `${stationName(station)}: ${e.description.slice(0, 40)}`),
        }
      })
      settle($)
    }

    return started
  })

  // Every tool call shows in the bubble of whoever makes it.
  on('tool.call', async ($, e, next) => {
    const tool = String(e.tool)
    const id = e.agentId

    await safely($, s => {
      const known = id !== undefined && s.workers.some(w => w.id === id)

      // Only a changed bubble redraws: a redraw restarts the SVG's animations.
      if (id === undefined) {
        return s.orchTool === tool ? s : { ...s, orchTool: tool }
      }
      const same = !known || s.workers.some(w => w.id === id && w.tool === tool)

      return same ? s : { ...s, workers: worker(s, id, w => ({ ...w, tool })) }
    })

    return next(e)
  })

  // A turn ends. A subagent's: its station is done and stamps the package.
  // The main loop's: the package rides back into the chat.
  on('turn.complete', async ($, e, next) => {
    const id = e.agentId

    if (id === undefined) {
      const ok = e.reason === 'answer'

      await safely($, s => ({
        ...moveTo(s, 6),
        phase: ok ? ('done' as const) : ('stopped' as const),
        orchTool: '',
        workers: s.workers.filter(w => w.status !== 'run'),
        log: logged(s, ok ? 'Ergebnis zurück im Chat' : 'Auftrag abgebrochen'),
      }))
      settle($)

      return next(e)
    }
    const isDone = e.reason === 'answer'

    await safely($, s => {
      const who = s.workers.find(w => w.id === id)

      if (who === undefined || who.status !== 'run') {
        return s
      }

      return {
        ...s,
        workers: worker(s, id, w => ({ ...w, status: isDone ? ('done' as const) : ('failed' as const), tool: '' })),
        stamps: isDone && !s.stamps.includes(who.station) ? [...s.stamps, who.station] : s.stamps,
        counts: { ...s.counts, done: s.counts.done + (isDone ? 1 : 0) },
        log: logged(s, `${stationName(who.station)} ${isDone ? 'liefert ab' : 'wurde gestoppt'}`),
      }
    })

    return next(e)
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const state = await read($, floor)
    const chosen = await read($, design)
    const current = isDesign(chosen) ? chosen : DEFAULT_DESIGN
    const litNow = await read($, mode)
    const shade: Mode = isMode(litNow) ? litNow : 'dunkel'
    const sized = await read($, zoom)
    const percent = isZoom(sized) ? sized : 100
    const { Box, Button, Select, Text } = $.ui.resolve(e)
    const picker = (
      <Select
        key="design"
        label="Design"
        options={DESIGNS.map((d, i) => ({ value: d.k, label: `${i + 1} ${d.name}` }))}
        value={current}
        onSelect={k => {
          if (!isDesign(k)) return
          void update($, design, () => k)
          // Remembered for the next session; a failed save keeps the choice for this one.
          void $.store.set('design', k).catch(() => undefined)
        }}
      />
    )

    if (e.surface === 'desktop' || e.surface === 'mobile') {
      const { Svg } = $.ui.resolve(e)
      // Fit the pane: as wide as its cells say, no taller than its room, then the person's percent.
      const cols = e.props.bodyColumns
      const rows = e.props.scroll.bodyRows
      const fit = Math.min(cols * CELL_W, rows * CELL_H * ASPECT)
      const width = Math.max(160, Math.round((fit * percent) / 100))
      const height = Math.round(width / ASPECT)

      // The hall fills the pane's width at its own proportions; the design
      // picker sits on the drawing, the log is drawn into it.
      return (
        <Box flexDirection="column" position="relative">
          <Svg source={renderScene(state, current, `${cols}×${rows}`, shade)} alt={describeScene(state)} width={width} height={height} isInteractive />
          <Box position="absolute" top={0} left={1} flexDirection="row" gap={1}>
            {picker}
            <Select
              key="zoom"
              label="Größe"
              options={ZOOMS.map(z => ({ value: String(z), label: `${z} %` }))}
              value={String(percent)}
              onSelect={v => {
                const z = Number(v)

                if (!isZoom(z)) return
                void update($, zoom, () => z)
                void $.store.set('zoom', z).catch(() => undefined)
              }}
            />
            <Button
              key="mode"
              onPress={() => {
                const next: Mode = shade === 'dunkel' ? 'hell' : 'dunkel'

                void update($, mode, () => next)
                void $.store.set('mode', next).catch(() => undefined)
              }}
            >
              {shade === 'dunkel' ? '☀ Hell' : '☾ Dunkel'}
            </Button>
          </Box>
        </Box>
      )
    }
    const running = state.workers.filter(w => w.status === 'run')

    return (
      <Box flexDirection="column">
        {picker}
        <Text>{describeScene(state)}</Text>
        {running.slice(-6).map(w => (
          <Text key={w.id}>
            {stationName(w.station)} · {w.label} · {w.tool || 'arbeitet'}
          </Text>
        ))}
        {state.log.slice(-3).map((entry, i) => (
          <Text key={`log-${i}`} dimColor>{entry}</Text>
        ))}
      </Box>
    )
  })
}
