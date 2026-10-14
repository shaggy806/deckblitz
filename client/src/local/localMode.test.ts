import { afterEach, describe, expect, it, vi } from 'vitest'

/** A `sessionStorage` over a map. */
function storage() {
  const map = new Map<string, string>()
  return {
    map,
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => void map.set(k, v),
    removeItem: (k: string) => void map.delete(k),
  }
}

/** A `Worker` that reads its options, as a browser with module workers does —
 * or doesn't, as an older one. */
function workers(readsType: boolean) {
  return class {
    constructor(_url: string, options?: { type?: string }) {
      if (readsType) void options?.type
    }
    terminate() {}
  }
}

/** `localMode`, freshly imported: it checks for module workers once a page. */
async function load(opts: { readsType?: boolean; noStorage?: boolean } = {}) {
  vi.resetModules()
  const store = storage()
  if (opts.noStorage) {
    vi.stubGlobal('sessionStorage', {
      getItem: () => {
        throw new Error('blocked')
      },
      setItem: () => {
        throw new Error('blocked')
      },
    })
  } else {
    vi.stubGlobal('sessionStorage', store)
  }
  vi.stubGlobal('Worker', workers(opts.readsType ?? true))
  const { localMode } = await import('./localMode.ts')
  return { localMode, store }
}

const SITE = 'https://deckblitz.net/'

describe('local mode', () => {
  afterEach(() => vi.unstubAllGlobals())

  it("is on by default in a production build and off under vite dev, until the tab says", async () => {
    const { localMode } = await load()
    expect(localMode(SITE, true)).toBe(true)
    expect(localMode(SITE, false)).toBe(false)
  })

  it('remembers ?local=0 and ?local=1 for the tab, over the default', async () => {
    const { localMode, store } = await load()
    expect(localMode(`${SITE}?local=0`, true)).toBe(false)
    // The room URLs the game moves to drop the parameter: still off.
    expect(localMode(`${SITE}?room=ABCDE`, true)).toBe(false)
    expect(store.map.get('mtg.local')).toBe('0')
    expect(localMode(`${SITE}?local=1`, false)).toBe(true)
    expect(localMode(SITE, false)).toBe(true)
  })

  it('without storage, goes by the parameter, else the default', async () => {
    const { localMode } = await load({ noStorage: true })
    expect(localMode(`${SITE}?local=0`, true)).toBe(false)
    expect(localMode(`${SITE}?local=1`, false)).toBe(true)
    expect(localMode(SITE, true)).toBe(true)
  })

  it('is never on where the browser has no module workers', async () => {
    const { localMode } = await load({ readsType: false })
    expect(localMode(SITE, true)).toBe(false)
    expect(localMode(`${SITE}?local=1`, true)).toBe(false)
    // Nor where there are no workers at all.
    vi.resetModules()
    vi.stubGlobal('Worker', undefined)
    const { localMode: none } = await import('./localMode.ts')
    expect(none(SITE, true)).toBe(false)
  })
})
