import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register, ThemeSetArgs } from 'claude-code'

import type { FloorModel, FloorState, FloorWorker } from '../types'
import { makeColors } from './make-colors.js'
import { describeScene, renderScene } from './scene.js'

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
        'surface-3': '#13142f',
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

const EMPTY: FloorState = {
  phase: 'idle',
  task: '',
  orchTool: '',
  workers: [],
  note: null,
  prFresh: false,
  counts: { done: 0, notes: 0, tools: 0 },
  log: [],
}

const floor = atom({ plugin: 'midnight-neon', key: 'floor' } as const, EMPTY, { shape: 'floor-1' })

const family = (model: string): FloorModel => {
  const m = model.toLowerCase()

  return m.includes('fable') ? 'fable' : m.includes('opus') ? 'opus' : m.includes('sonnet') ? 'sonnet' : m.includes('haiku') ? 'haiku' : 'other'
}

const NAME: Record<FloorModel, string> = { fable: 'Fable', sonnet: 'Sonnet', opus: 'Opus', haiku: 'Haiku', other: 'Agent' }
const logged = (s: FloorState, line: string): string[] => [...s.log, line].slice(-5)
const worker = (s: FloorState, id: string, fn: (w: FloorWorker) => FloorWorker): FloorWorker[] =>
  s.workers.map(w => (w.id === id ? fn(w) : w))

// The scene is decoration: a failed write must never get in the way of a turn or a tool.
const safely = async ($: EngineInterface, fn: (s: FloorState) => FloorState): Promise<void> => {
  try {
    await update($, floor, s => fn(s ?? EMPTY))
  } catch (error) {
    $.ui.log(`midnight-neon: ${String(error)}`)
  }
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const unpainted = problems.find(line => line.startsWith("Desktop won't paint"))

    if (unpainted !== undefined) {
      $.ui.toast(unpainted)
    }
    const set = await $.theme.set(LOOK)

    if (!set.isDrawn) {
      $.ui.status(set.reason)
    }
    await $.command.register({ name: 'halle', description: 'Zeigt die Fabrikhalle mit Orchestrator und Agenten' })
    void $.ui.open({ id: PANE, title: TITLE })

    return next(e)
  })

  on('command.run', { command: 'halle' }, async $ => {
    await $.ui.open({ id: PANE, title: TITLE })

    return { text: 'Halle 3 ist geöffnet.' }
  })

  // A turn of the main loop: the orchestrator puts a task on the belt.
  on('turn.start', async ($, e, next) => {
    if (e.agentId === undefined) {
      await safely($, s => ({
        ...s,
        phase: 'work',
        task: e.text.replace(/\s+/g, ' ').slice(0, 80),
        orchTool: '',
        prFresh: false,
        note: null,
        workers: s.workers.filter(w => w.status === 'run'),
        log: logged(s, 'Orchestrator legt eine Aufgabe aufs Band'),
      }))
    }

    return next(e)
  })

  // A subagent starts: a figure takes its station and a crate rolls to it.
  on('agent.spawn', async ($, e, next) => {
    const started = await next(e)
    const id = 'agentId' in started ? started.agentId : undefined

    if (typeof id === 'string') {
      const model = family('model' in started && typeof started.model === 'string' ? started.model : '')

      await safely($, s => ({
        ...s,
        phase: 'work',
        workers: [...s.workers.filter(w => w.id !== id), { id, model, label: e.description.slice(0, 40), status: 'run' as const, tool: '', fresh: true }].slice(-8),
        log: logged(s, `${NAME[model]} übernimmt: ${e.description.slice(0, 40)}`),
      }))
      $.clock.after(1600, () => {
        void safely($, s => ({ ...s, workers: worker(s, id, w => ({ ...w, fresh: false })) }))
      })
    }

    return started
  })

  // Every tool call shows above the figure that makes it; messages fly as slips.
  on('tool.call', async ($, e, next) => {
    const tool = String(e.tool)
    const id = e.agentId
    const isNote = tool === 'SendMessage' || tool === 'AskUserQuestion'

    await safely($, s => {
      const known = id !== undefined && s.workers.some(w => w.id === id)
      const counts = { ...s.counts, tools: s.counts.tools + 1, notes: s.counts.notes + (isNote ? 1 : 0) }
      const target = s.workers.find(w => w.status === 'run')?.id ?? 'orch'
      const note = isNote ? { from: known && id !== undefined ? id : 'orch', to: known ? 'orch' : target, n: counts.notes } : s.note

      return {
        ...s,
        counts,
        note,
        orchTool: id === undefined ? tool : s.orchTool,
        workers: known && id !== undefined ? worker(s, id, w => ({ ...w, tool })) : s.workers,
        log: isNote ? logged(s, known ? 'Zettel an den Orchestrator' : 'Zettel vom Orchestrator') : s.log,
      }
    })

    if (isNote) {
      $.clock.after(1700, () => {
        void safely($, s => ({ ...s, note: null }))
      })
    }

    return next(e)
  })

  // A subagent hands its result back: the report flies to the orchestrator.
  on('agent.report', async ($, e, next) => {
    const id = e.agentId

    await safely($, s => {
      const who = s.workers.find(w => w.id === id)

      if (who === undefined) {
        return s
      }
      const isDone = e.status === 'completed'

      return {
        ...s,
        workers: worker(s, id, w => ({ ...w, status: isDone ? ('done' as const) : ('failed' as const), tool: '', fresh: false })),
        note: { from: id, to: 'orch', n: s.counts.notes + 1 },
        counts: { ...s.counts, done: s.counts.done + (isDone ? 1 : 0), notes: s.counts.notes + 1 },
        log: logged(s, `${NAME[who.model]} ${isDone ? 'liefert ab' : 'wurde gestoppt'}`),
      }
    })
    $.clock.after(1700, () => {
      void safely($, s => ({ ...s, note: null }))
    })

    return next(e)
  })

  // The main loop answers: everything goes back to the orchestrator as one bundle.
  on('turn.complete', async ($, e, next) => {
    if (e.agentId === undefined) {
      await safely($, s => ({ ...s, phase: 'done', orchTool: '', prFresh: true, log: logged(s, 'Orchestrator nimmt das Ergebnis an') }))
      $.clock.after(1900, () => {
        void safely($, s => ({ ...s, prFresh: false }))
      })
    }

    return next(e)
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const state = await read($, floor)

    if (e.surface === 'desktop' || e.surface === 'mobile') {
      const { Box, Svg, Text } = $.ui.resolve(e)

      return (
        <Box flexDirection="column">
          <Svg source={renderScene(state)} alt={describeScene(state)} />
          {state.log.slice(-3).map(entry => (
            <Text dimColor>{entry}</Text>
          ))}
        </Box>
      )
    }
    const { Box, Text } = $.ui.resolve(e)
    const running = state.workers.filter(w => w.status === 'run')

    return (
      <Box flexDirection="column">
        <Text>{state.phase === 'idle' ? 'Halle 3: Band steht.' : `Halle 3: ${running.length} aktiv, ${state.counts.done} fertig`}</Text>
        {state.workers.slice(-6).map(w => (
          <Text dimColor={w.status !== 'run'}>
            {NAME[w.model]} · {w.label} · {w.status === 'run' ? w.tool || 'arbeitet' : w.status === 'done' ? 'fertig' : 'gestoppt'}
          </Text>
        ))}
        {state.log.slice(-3).map(entry => (
          <Text dimColor>{entry}</Text>
        ))}
      </Box>
    )
  })
}
