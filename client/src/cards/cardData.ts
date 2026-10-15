import { useSyncExternalStore } from 'react'
import type { CardDefinition, CardShard } from 'engine/client'
import { CARD_SHARD_COUNT, CardRegistry, cardShardOf, loadCardShard } from 'engine/client'
import { loadShardFile, shardFile } from './shardFiles.ts'

/**
 * The card pool, fetched as it's needed.
 *
 * The engine ships the pool as shards, each its own file in the build (see
 * `engine/src/cards/card-shards.ts`), and this module is the client's one way
 * into them. Nothing here is on any page's startup path. There are two kinds
 * of caller:
 *
 * - **A lookup by name** (`peekCard`, `loadCard`, `requestCards`,
 *   `useCardData`). The game page needs a definition only for extras: the
 *   tooltip on a card's name in the history, or the other face of a
 *   double-faced card in a zone viewer. Everything a game needs to be played
 *   arrives in the server's views, with each object's characteristics
 *   already worked out. A lookup fetches the one shard its name hashes to,
 *   the first time anything asks.
 * - **The whole pool** (`loadCardPool`, `cardPool`), for the library and the
 *   deck builder, which search, sort and validate over every card.
 *   `main.tsx` fetches it alongside the page's own code and renders the page
 *   once both are in, so inside those pages `cardPool()` is always ready.
 *   Until then, `usePoolProgress` says how many of the shards are in, for
 *   the loading screen's progress bar (`PoolLoading.tsx`).
 *
 * Art is the exception, since the lobby draws commander art before anyone
 * has asked for a card. The engine's `PINNED_ART` holds the few printings
 * the pool pins, and every other card is found on Scryfall by name.
 *
 * A shard that fails to load (a network error, or a deploy that replaced the
 * build while a page was open) reads as not loaded yet, and is fetched again
 * the next time something asks for it.
 */

const shards = new Map<number, CardShard>()
const inFlight = new Map<number, Promise<CardShard>>()
const byName = new Map<string, CardDefinition>()

/** Bumped as each shard arrives, so a component that read `peekCard` before
 * it did renders again (`useCardData`). */
let version = 0
const listeners = new Set<() => void>()

/** How much of the pool is in, for a page waiting on all of it. */
export interface PoolProgress {
  /** Shards loaded so far, counting any a lookup by name fetched first. A
   * shard whose fetch failed doesn't count until a later fetch succeeds. */
  readonly loaded: number
  /** Every shard: `CARD_SHARD_COUNT`. */
  readonly total: number
}

/** Replaced, never mutated, as each shard arrives, so `useSyncExternalStore`
 * sees the same object until something changed. */
let progress: PoolProgress = { loaded: 0, total: CARD_SHARD_COUNT }

/** How long shards may be out with none of them arriving before the ones
 * still out are asked for again. Shards arrive within a second on an
 * ordinary connection; on a slow one they keep arriving, so this never
 * fires there. */
export const SHARD_STALL_MS = 5_000

/** Requests of one shard at most: the engine's own, then two by URL. */
export const MAX_SHARD_ATTEMPTS = 3

/**
 * The shards still out, each with how to ask for it again. A request can
 * hang without failing (a user's library sat at 30 of 32 shards, 2026-10-14),
 * and nothing then would ever settle it, so whenever `SHARD_STALL_MS` passes
 * with shards out and none arriving, each is asked for again by URL
 * (`shardFiles.ts`), and the first answer wins.
 */
const outstanding = new Map<number, () => void>()
let stallTimer: ReturnType<typeof setTimeout> | undefined

/** Starts the stall clock over, if any shard is still out. */
function watchForStall(): void {
  clearTimeout(stallTimer)
  stallTimer = undefined
  if (outstanding.size === 0) return
  stallTimer = setTimeout(() => {
    for (const askAgain of [...outstanding.values()]) askAgain()
    watchForStall()
  }, SHARD_STALL_MS)
}

function fetchShard(index: number): Promise<CardShard> {
  const loaded = shards.get(index)
  if (loaded !== undefined) return Promise.resolve(loaded)
  let pending = inFlight.get(index)
  if (pending === undefined) {
    pending = new Promise<CardShard>((resolve, reject) => {
      let attempts = 0
      let failures = 0
      let settled = false
      const arrived = (shard: CardShard) => {
        if (settled) return
        settled = true
        outstanding.delete(index)
        for (const def of shard.pool) byName.set(def.name, def)
        for (const def of shard.tokens) byName.set(def.name, def)
        shards.set(index, shard)
        inFlight.delete(index)
        version++
        progress = { loaded: shards.size, total: CARD_SHARD_COUNT }
        for (const listener of listeners) listener()
        // A shard arriving is progress: the rest get the full wait again.
        watchForStall()
        resolve(shard)
      }
      // Fails only once every request made has, so a retry that 404s (a
      // deploy replaced the build) doesn't cut short one still out.
      const failed = (error: unknown) => {
        failures++
        if (settled || failures < attempts) return
        settled = true
        outstanding.delete(index)
        inFlight.delete(index)
        reject(error)
      }
      const attempt = (request: Promise<CardShard>) => {
        attempts++
        request.then(arrived, failed)
      }
      attempt(loadCardShard(index))
      outstanding.set(index, () => {
        const url = shardFile(index)
        if (settled || url === undefined || attempts >= MAX_SHARD_ATTEMPTS) return
        attempt(loadShardFile(url, attempts + 1))
      })
    })
    inFlight.set(index, pending)
    if (stallTimer === undefined) watchForStall()
  }
  return pending
}

/**
 * The definition named `name`, if its shard is in: the card, or `null` when
 * the pool has no card by that name. `undefined` means its shard hasn't
 * loaded yet — ask with `loadCard` or `requestCards`.
 */
export function peekCard(name: string): CardDefinition | null | undefined {
  const def = byName.get(name)
  if (def !== undefined) return def
  return shards.has(cardShardOf(name)) ? null : undefined
}

/** The definition named `name`, fetching its shard first if need be. `null`
 * when the pool has no such card, or its shard couldn't be fetched. */
export async function loadCard(name: string): Promise<CardDefinition | null> {
  try {
    await fetchShard(cardShardOf(name))
  } catch {
    return null
  }
  return byName.get(name) ?? null
}

/** Starts fetching the shards `names` are in, without waiting for them. */
export function requestCards(names: Iterable<string>): void {
  for (const name of names) void loadCard(name)
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

const currentVersion = () => version

/**
 * `peekCard`, for a component that renders what it finds: the component
 * renders again as each shard arrives, so a card that wasn't loaded the first
 * time shows up once it is. Reading fetches nothing; pair it with
 * `requestCards` for the names the component shows.
 */
export function useCardData(): (name: string) => CardDefinition | null | undefined {
  useSyncExternalStore(subscribe, currentVersion)
  return peekCard
}

/** How many of the pool's shards are in. */
export function poolProgress(): PoolProgress {
  return progress
}

/**
 * `poolProgress`, for a component that draws it: the component renders again
 * as each shard arrives. A failed shard isn't reported here, since
 * `loadCardPool` rejects on it, and the page waiting on the pool shows its
 * failure instead (`PoolLoadBoundary`).
 */
export function usePoolProgress(): PoolProgress {
  return useSyncExternalStore(subscribe, poolProgress)
}

/** Every card and token, for the pages that work over all of them. */
export interface CardPool {
  /** Every definition under `pool/`, by name. Each face of a double-faced
   * card is its own definition, as in `POOL_CARDS`. */
  readonly cards: readonly CardDefinition[]
  /** Every token definition, by name. */
  readonly tokens: readonly CardDefinition[]
  /** Every card and token, by name. */
  readonly byName: ReadonlyMap<string, CardDefinition>
  /** A registry of every card and token, which is what the engine's deck
   * rules (`validateCommanderDeck`, `canPairCommanders`) read. */
  readonly registry: CardRegistry
}

let pool: CardPool | null = null
let poolPending: Promise<CardPool> | null = null

/** Fetches every shard, in parallel, and assembles the pool. */
export function loadCardPool(): Promise<CardPool> {
  if (pool !== null) return Promise.resolve(pool)
  poolPending ??= Promise.all(
    Array.from({ length: CARD_SHARD_COUNT }, (_, i) => fetchShard(i)),
  ).then(
    (loaded) => {
      const alphabetical = (a: CardDefinition, b: CardDefinition) => a.name.localeCompare(b.name)
      const cards = loaded.flatMap((shard) => shard.pool).sort(alphabetical)
      const tokens = loaded.flatMap((shard) => shard.tokens).sort(alphabetical)
      const registry = new CardRegistry()
      for (const def of cards) registry.register(def)
      for (const def of tokens) registry.register(def)
      pool = { cards, tokens, byName, registry }
      return pool
    },
    (error: unknown) => {
      poolPending = null
      throw error
    },
  )
  return poolPending
}

/**
 * The whole pool, once `loadCardPool` has assembled it. The library and the
 * deck builder render only after it has (see `main.tsx`), so they read it
 * from here rather than having it threaded through every component.
 */
export function cardPool(): CardPool {
  if (pool === null) throw new Error('cardPool() was read before loadCardPool() finished')
  return pool
}
