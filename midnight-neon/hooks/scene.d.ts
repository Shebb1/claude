import type { FloorState } from '../types'

export function renderScene(state: FloorState, options?: { mode?: 'auto' | 'light' | 'dark' }): string
export function describeScene(state: FloorState): string
