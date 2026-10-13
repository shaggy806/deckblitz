import { describe, expect, it } from 'vitest'
import { FRESH, STORAGE_KEY, createProgressStore, parseProgress } from './progress.ts'
import type { StorageLike } from './progress.ts'

function memory(initial: Record<string, string> = {}): StorageLike & { data: Record<string, string> } {
  const data = { ...initial }
  return {
    data,
    getItem: (k) => data[k] ?? null,
    setItem: (k, v) => {
      data[k] = v
    },
  }
}

const throwing: StorageLike = {
  getItem: () => {
    throw new Error('SecurityError')
  },
  setItem: () => {
    throw new Error('QuotaExceededError')
  },
}

describe('parseProgress', () => {
  it('reads nothing stored as a first visit', () => {
    expect(parseProgress(null)).toEqual(FRESH)
  })

  it('reads junk as a fresh start', () => {
    expect(parseProgress('{not json')).toEqual(FRESH)
    expect(parseProgress('42')).toEqual(FRESH)
    expect(parseProgress('null')).toEqual(FRESH)
  })

  it('keeps what it recognises and drops the rest', () => {
    const raw = JSON.stringify({
      seenIntro: true,
      tour: { done: true, at: 'db-import' },
      lessons: { basics: 'done', other: 'half', bad: 3 },
      extra: 'ignored',
    })
    expect(parseProgress(raw)).toEqual({
      seenIntro: true,
      tour: { done: true, at: 'db-import' },
      lessons: { basics: 'done' },
    })
    expect(parseProgress(JSON.stringify({ tour: { at: 7 } })).tour.at).toBeNull()
  })
})

describe('createProgressStore', () => {
  it('reads the stored progress and writes every change back', () => {
    const storage = memory({ [STORAGE_KEY]: JSON.stringify({ seenIntro: true }) })
    const store = createProgressStore(() => storage)
    expect(store.get().seenIntro).toBe(true)
    store.update((p) => ({ ...p, tour: { done: false, at: 'lib-search' } }))
    expect(JSON.parse(storage.data[STORAGE_KEY])).toEqual({
      seenIntro: true,
      tour: { done: false, at: 'lib-search' },
      lessons: {},
    })
  })

  it('tells its subscribers', () => {
    const store = createProgressStore(() => memory())
    let calls = 0
    const off = store.subscribe(() => calls++)
    store.update((p) => ({ ...p, seenIntro: true }))
    off()
    store.update((p) => ({ ...p, seenIntro: false }))
    expect(calls).toBe(1)
  })

  it('works on, for this page, with a storage that throws', () => {
    const store = createProgressStore(() => throwing)
    expect(store.get()).toEqual(FRESH)
    store.update((p) => ({ ...p, seenIntro: true }))
    expect(store.get().seenIntro).toBe(true)
  })

  it('works with no storage at all, or one that throws on being reached', () => {
    expect(createProgressStore(() => null).get()).toEqual(FRESH)
    const store = createProgressStore(() => {
      throw new Error('SecurityError')
    })
    store.update((p) => ({ ...p, tour: { done: true, at: null } }))
    expect(store.get().tour.done).toBe(true)
  })
})
