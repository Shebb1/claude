export type FloorModel = 'fable' | 'sonnet' | 'opus' | 'haiku' | 'other'

// A subagent at its fixed station (0..5, see STATIONS in scene.js).
export type FloorWorker = {
  id: string
  model: FloorModel
  label: string
  station: number
  status: 'run' | 'done' | 'failed'
  tool: string
}

export type FloorState = {
  phase: 'idle' | 'work' | 'done' | 'stopped'
  task: string
  orchTool: string
  // Where the job's package is: -1 at the chat input, 0..5 a station, 6 back in the chat.
  pkg: number
  // Where it came from; `moving` makes the drawing animate the trip once.
  from: number
  moving: boolean
  stamps: number[]
  workers: FloorWorker[]
  counts: { done: number; tools: number }
  log: string[]
}

declare module 'claude-code' {
  interface PluginState {
    'midnight-neon': { floor: Shaped<FloorState>; design: Shaped<string>; zoom: Shaped<number>; mode: Shaped<'hell' | 'dunkel'> }
  }
}
