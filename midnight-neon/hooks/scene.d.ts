import type { FloorState } from '../types'

export const DESIGNS: ReadonlyArray<{ k: string; name: string }>
export const DEFAULT_DESIGN: string
export const STATIONS: ReadonlyArray<{ m: string; name: string; role: string }>
export const ASPECT: number
export function renderScene(state: FloorState, design: string, note?: string, mode?: 'hell' | 'dunkel'): string
export function describeScene(state: FloorState): string
