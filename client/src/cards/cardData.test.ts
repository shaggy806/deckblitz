import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { CardShard } from 'engine/client'

// The engine's shards are swapped for ones the test answers by hand, so it
// decides which shard arrives when, and which fails. Four shards, one card
// in each, named for its shard.
const shardLoads = vi.hoisted(() => ({
  pending: new Map<number, { resolve: (shard: CardShard) => void; reject: (e: Error) => void }[]>(),
  count: 0,
}))

vi.mock('engine/client', () => ({
  CARD_SHARD_COUNT: 4,
  cardShardOf: (name: string) => Number(name.slice('card '.length)),
  loadCardShard: (index: number) => {
    shardLoads.count++
    return new Promise<CardShard>((resolve, reject) => {
      const waiting = shardLoads.pending.get(index) ?? []
      waiting.push({ resolve, reject })
      shardLoads.pending.set(index, waiting)
    })
  },
  CardRegistry: class {
    register(): void {}
  },
}))

// The shards asked for again by URL, answered by hand the same way: each
// retry is recorded with its shard and attempt. `listed` is whether the page
// lists the shard files (a build does, the dev server doesn't).
const retries = vi.hoisted(() => ({
  listed: true,
  calls: [] as { index: number; attempt: number; resolve: (shard: CardShard) => void; reject: (e: Error) => void }[],
}))

vi.mock('./shardFiles.ts', () => ({
  shardFile: (index: number) => (retries.listed ? `/assets/shard-${index}.js` : undefined),
  loadShardFile: (url: string, attempt: number) =>
    new Promise<CardShard>((resolve, reject) => {
      retries.calls.push({ index: Number(/shard-(\d+)/.exec(url)?.[1]), attempt, resolve, reject })
    }),
}))

/** Answers every outstanding fetch of shard `index`, then lets the module's
 * handlers run. */
async function arrive(index: number): Promise<void> {
  const shard = { pool: [{ name: `card ${index}` }], tokens: [] } as unknown as CardShard
  for (const { resolve } of shardLoads.pending.get(index) ?? []) resolve(shard)
  shardLoads.pending.delete(index)
  await Promise.resolve()
  await Promise.resolve()
}

async function fail(index: number): Promise<void> {
  for (const { reject } of shardLoads.pending.get(index) ?? []) reject(new Error('offline'))
  shardLoads.pending.delete(index)
  await Promise.resolve()
  await Promise.resolve()
}

// cardData keeps its shards in module state, so each test gets a fresh copy.
async function freshCardData() {
  vi.resetModules()
  return import('./cardData.ts')
}

beforeEach(() => {
  shardLoads.pending.clear()
  shardLoads.count = 0
  retries.listed = true
  retries.calls = []
})

describe('poolProgress', () => {
  it('counts shards as they arrive, in whatever order, up to the total', async () => {
    const { loadCardPool, poolProgress } = await freshCardData()
    expect(poolProgress()).toEqual({ loaded: 0, total: 4 })

    const pool = loadCardPool()
    expect(shardLoads.count).toBe(4)
    await arrive(2)
    expect(poolProgress()).toEqual({ loaded: 1, total: 4 })
    await arrive(0)
    await arrive(3)
    expect(poolProgress()).toEqual({ loaded: 3, total: 4 })
    await arrive(1)
    expect(poolProgress()).toEqual({ loaded: 4, total: 4 })
    expect((await pool).cards.map((c) => c.name)).toEqual(['card 0', 'card 1', 'card 2', 'card 3'])
  })

  it('keeps the same snapshot until a shard arrives', async () => {
    const { loadCardPool, poolProgress } = await freshCardData()
    const before = poolProgress()
    void loadCardPool()
    expect(poolProgress()).toBe(before)
    await arrive(1)
    const after = poolProgress()
    expect(after).not.toBe(before)
    expect(poolProgress()).toBe(after)
  })

  it('counts a shard a lookup by name already fetched, and fetches it only once', async () => {
    const { loadCard, loadCardPool, poolProgress } = await freshCardData()
    const card = loadCard('card 3')
    await arrive(3)
    expect((await card)?.name).toBe('card 3')
    expect(poolProgress()).toEqual({ loaded: 1, total: 4 })

    void loadCardPool()
    // Shard 3 is in already, so the pool asks only for the other three.
    expect(shardLoads.count).toBe(4)
    expect(poolProgress()).toEqual({ loaded: 1, total: 4 })
  })

  it('counts a shard asked for twice at once only once', async () => {
    const { loadCard, loadCardPool, poolProgress } = await freshCardData()
    void loadCard('card 0')
    void loadCardPool()
    expect(shardLoads.count).toBe(4)
    await arrive(0)
    expect(poolProgress()).toEqual({ loaded: 1, total: 4 })
  })

  it("doesn't count a failed shard, and counts it once a retry loads it", async () => {
    const { loadCardPool, poolProgress } = await freshCardData()
    const first = loadCardPool()
    const failed = expect(first).rejects.toThrow('offline')
    await arrive(0)
    await arrive(1)
    await fail(2)
    await failed
    expect(poolProgress()).toEqual({ loaded: 2, total: 4 })

    // Shard 3 is still on its way; a second load asks again only for shard 2.
    const retry = loadCardPool()
    expect(shardLoads.count).toBe(5)
    await arrive(2)
    await arrive(3)
    expect(poolProgress()).toEqual({ loaded: 4, total: 4 })
    expect((await retry).cards).toHaveLength(4)
  })
})

describe('a shard that never answers', () => {
  const shard = (index: number) => ({ pool: [{ name: `card ${index}` }], tokens: [] }) as unknown as CardShard
  /** Moves the clock on `ms`, then lets the module's handlers run. */
  const wait = async (ms: number) => {
    vi.advanceTimersByTime(ms)
    await Promise.resolve()
    await Promise.resolve()
  }
  const retried = () => retries.calls.map(({ index, attempt }) => `${index}#${attempt}`)

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('is asked for again by URL once the shards stop arriving, and the first answer counts once', async () => {
    const { loadCardPool, poolProgress, SHARD_STALL_MS } = await freshCardData()
    const pool = loadCardPool()
    await arrive(0)
    await arrive(1)
    await arrive(2)
    await wait(SHARD_STALL_MS - 1)
    expect(retried()).toEqual([])
    await wait(1)
    expect(retried()).toEqual(['3#2'])
    retries.calls[0].resolve(shard(3))
    await Promise.resolve()
    expect(poolProgress()).toEqual({ loaded: 4, total: 4 })
    expect((await pool).cards).toHaveLength(4)
    // The first request answering late changes nothing.
    await arrive(3)
    expect(poolProgress()).toEqual({ loaded: 4, total: 4 })
  })

  it('waits the full time again after each shard that arrives', async () => {
    const { loadCardPool, SHARD_STALL_MS } = await freshCardData()
    void loadCardPool()
    await wait(SHARD_STALL_MS - 1000)
    await arrive(0)
    await wait(SHARD_STALL_MS - 1000)
    expect(retried()).toEqual([])
    await wait(1000)
    expect(retried()).toEqual(['1#2', '2#2', '3#2'])
  })

  it('stops after three requests of a shard', async () => {
    const { loadCardPool, SHARD_STALL_MS, MAX_SHARD_ATTEMPTS } = await freshCardData()
    expect(MAX_SHARD_ATTEMPTS).toBe(3)
    void loadCardPool()
    await arrive(0)
    await arrive(1)
    await arrive(2)
    await wait(SHARD_STALL_MS)
    await wait(SHARD_STALL_MS)
    await wait(SHARD_STALL_MS)
    expect(retried()).toEqual(['3#2', '3#3'])
  })

  it("doesn't fail a shard because a retry failed while another request is still out", async () => {
    const { loadCardPool, poolProgress, SHARD_STALL_MS } = await freshCardData()
    const pool = loadCardPool()
    await arrive(0)
    await arrive(1)
    await arrive(2)
    await wait(SHARD_STALL_MS)
    retries.calls[0].reject(new Error('404'))
    await Promise.resolve()
    await arrive(3)
    expect(poolProgress()).toEqual({ loaded: 4, total: 4 })
    expect((await pool).cards).toHaveLength(4)
  })

  it('fails once every request of it has', async () => {
    const { loadCardPool, SHARD_STALL_MS } = await freshCardData()
    const pool = loadCardPool()
    const failed = expect(pool).rejects.toThrow('offline')
    await arrive(0)
    await arrive(1)
    await arrive(2)
    await wait(SHARD_STALL_MS)
    retries.calls[0].reject(new Error('404'))
    await fail(3)
    await failed
  })

  it('is never asked for again where the page lists no shard files (the dev server)', async () => {
    retries.listed = false
    const { loadCardPool, SHARD_STALL_MS } = await freshCardData()
    void loadCardPool()
    await wait(SHARD_STALL_MS * 3)
    expect(retried()).toEqual([])
  })
})
