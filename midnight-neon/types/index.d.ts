export type FloorModel = 'fable' | 'sonnet' | 'opus' | 'haiku' | 'other'

export type FloorWorker = {
  id: string
  model: FloorModel
  label: string
  status: 'run' | 'done' | 'failed'
  tool: string
  fresh: boolean
}

export type FloorNote = { from: string; to: string; n: number }

export type FloorState = {
  phase: 'idle' | 'work' | 'done'
  task: string
  orchTool: string
  workers: FloorWorker[]
  note: FloorNote | null
  prFresh: boolean
  counts: { done: number; notes: number; tools: number }
  log: string[]
}

declare module 'claude-code' {
  interface PluginState {
    'midnight-neon': { floor: Shaped<FloorState> }
  }
}
