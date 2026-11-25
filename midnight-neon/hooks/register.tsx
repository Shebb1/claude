import type { Register, ThemeSetArgs } from 'claude-code'

import { makeColors } from './make-colors.js'

// Hell: klar, kontrastreich, strahlend. Dunkel: Mitternachtsblau/-lila mit Neon-Komplementärfarben.
const { theme, problems } = makeColors({
  label: 'Midnight Neon',
  roles: { accent: '#2354e6', danger: '#c81e3a', success: '#12803f', warning: '#b45309', pro: '#6d28d9' },
  light: {
    gray: {
      anchors: {
        'surface-0': '#f4f6fc',
        'surface-1': '#fafbff',
        'surface-2': '#ffffff',
        'text-primary': '#0b1030',
        'text-secondary': '#2d3560',
        'text-muted': '#4a5280',
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

    return next(e)
  })
}
