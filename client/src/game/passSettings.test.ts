import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * The priority stops belong to the game they were set in (`stopsBelongTo`):
 * the module reads `localStorage` as it loads, so each case loads it afresh
 * over its own storage, as a page load would.
 */

function fakeStorage(initial: Record<string, string> = {}) {
  const items = new Map<string, string>(Object.entries(initial))
  return {
    getItem: (key: string) => items.get(key) ?? null,
    setItem: (key: string, value: string) => void items.set(key, value),
    removeItem: (key: string) => void items.delete(key),
  }
}

type PassModule = typeof import('./passSettings.ts')

/** The module as a page load over `storage` would have it. */
async function load(storage: ReturnType<typeof fakeStorage>): Promise<PassModule> {
  vi.resetModules()
  vi.stubGlobal('window', { localStorage: storage })
  return import('./passSettings.ts')
}

/** What the next page load would read back. */
const stored = (storage: ReturnType<typeof fakeStorage>) =>
  JSON.parse(storage.getItem('mtg.pass') ?? 'null') as { passToMain: boolean; stops: { mine: string[]; theirs: string[] } }

describe('priority stops and the game they were set in', () => {
  let storage: ReturnType<typeof fakeStorage>
  beforeEach(() => {
    storage = fakeStorage()
  })
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('keeps the stops through a reload of the same game', async () => {
    const first = await load(storage)
    first.stopsBelongTo('room-a:1')
    first.toggleStop('upkeep', true)
    first.toggleStop('end', false)

    const reloaded = await load(storage)
    reloaded.stopsBelongTo('room-a:1')
    expect(stored(storage).stops).toEqual({ mine: ['upkeep'], theirs: ['end'] })
  })

  it('clears them as another game begins, a rematch included, and nothing else', async () => {
    const pass = await load(storage)
    pass.stopsBelongTo('room-a:1')
    pass.setPassSettings({ passToMain: true })
    pass.toggleStop('upkeep', true)

    // The same room's next game.
    pass.stopsBelongTo('room-a:2')
    expect(stored(storage).stops).toEqual({ mine: [], theirs: [] })
    expect(stored(storage).passToMain).toBe(true)

    // Another room, after a page load in between.
    pass.toggleStop('draw', false)
    const later = await load(storage)
    later.stopsBelongTo('room-b:1')
    expect(stored(storage).stops).toEqual({ mine: [], theirs: [] })
    expect(stored(storage).passToMain).toBe(true)
  })

  it('writes nothing while the game is the same one, and the cleared stops when it changes', async () => {
    const pass = await load(storage)
    pass.stopsBelongTo('room-a:1')
    pass.toggleStop('upkeep', true)
    // Told on every frame: only a new game's first one does anything.
    const writes = vi.spyOn(storage, 'setItem')
    pass.stopsBelongTo('room-a:1')
    expect(writes).not.toHaveBeenCalled()
    pass.stopsBelongTo('room-b:1')
    expect(writes).toHaveBeenCalledWith('mtg.pass', expect.stringContaining('"mine":[]'))
  })
})
