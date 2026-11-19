import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Whether a tab plays multiplayer games as tables (`tablesMode.ts`): on
// wherever local mode is, off for a tab that said `?tables=0`.

describe('tablesMode', () => {
  let stored: Map<string, string>

  beforeEach(() => {
    stored = new Map()
    vi.resetModules()
    // A browser that runs module workers, so local mode can be on.
    vi.stubGlobal(
      'Worker',
      class {
        constructor(_url: string, options: { type?: string }) {
          void options.type
        }
        terminate(): void {}
      },
    )
    vi.stubGlobal('sessionStorage', {
      getItem: (key: string) => stored.get(key) ?? null,
      setItem: (key: string, value: string) => void stored.set(key, value),
    })
    vi.stubGlobal('window', { location: { href: 'https://deckblitz.net/' } })
  })
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('is on by default where local mode is, and off where it is not', async () => {
    const { tablesMode } = await import('./tablesMode.ts')
    expect(tablesMode('https://deckblitz.net/?local=1')).toBe(true)
    stored.clear()
    expect(tablesMode('https://deckblitz.net/?local=0')).toBe(false)
  })

  it('is turned off for the tab by ?tables=0, and stays off on the pages the game moves to', async () => {
    const { tablesMode } = await import('./tablesMode.ts')
    expect(tablesMode('https://deckblitz.net/?local=1&tables=0')).toBe(false)
    // A room's URL drops the parameter; the tab's choice holds.
    expect(tablesMode('https://deckblitz.net/?room=ABCDE')).toBe(false)
    // And back on by ?tables=1.
    expect(tablesMode('https://deckblitz.net/?tables=1')).toBe(true)
    expect(tablesMode('https://deckblitz.net/?room=ABCDE')).toBe(true)
  })

  it('goes by the parameter alone, else on, where there is no storage', async () => {
    vi.stubGlobal('sessionStorage', {
      getItem: () => {
        throw new Error('blocked')
      },
      setItem: () => {
        throw new Error('blocked')
      },
    })
    const { tablesMode } = await import('./tablesMode.ts')
    expect(tablesMode('https://deckblitz.net/?local=1')).toBe(true)
    expect(tablesMode('https://deckblitz.net/?local=1&tables=0')).toBe(false)
  })
})
