import { expect, test } from 'claude-code/testing'

const PANE = {
  plugin: 'midnight-neon',
  component: 'Pane',
  requestId: 'halle',
  props: {
    title: 'Halle 3',
    isFocused: false,
    bodyColumns: 60,
    placement: 'dock',
    scroll: { offset: 0, bodyRows: 30 },
    view: {},
  },
} as const

test('a message puts the package at the planners, the picker switches designs', async ($, on) => {
  on('command.register', () => ({ value: { command: 'halle' } }))
  on('ui.open', () => ({ value: { isPlaced: true } }))
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  on('turn.start', () => ({ turnId: 't1' }))
  on('store.set', () => ({ value: undefined }))
  on('ui.log', () => ({ value: undefined }))
  on('clock.after', () => ({ value: undefined }))

  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })
  await $.turn.start({ text: 'Bau die Halle um', turnId: 't1' })

  const term = await $.ui.mount({ ...PANE, surface: 'terminal' })
  expect((await term.find({ type: 'Text', text: /Halle 3:/ }))?.text).toBe('Halle 3: Auftrag bei Fable (plant den Auftrag). Es arbeiten: Fable.')
  await term.unmount()

  const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
  expect((await ui.find({ type: 'Select', key: 'design' }))?.props.value).toBe('claude')
  await ui.select({ key: 'design', value: 'neon' })
  expect((await ui.find({ type: 'Select', key: 'design' }))?.props.value).toBe('neon')
  expect((await ui.find({ type: 'Button', key: 'mode' }))?.text).toBe('☀ Hell')
  await ui.press({ key: 'mode' })
  expect((await ui.find({ type: 'Button', key: 'mode' }))?.text).toBe('☾ Dunkel')
  await ui.unmount()
})
