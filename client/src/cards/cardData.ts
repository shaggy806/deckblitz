import { useSyncExternalStore } from 'react'
import type { CardDefinition, CardShard, CatalogChunk } from 'engine/client'
import { CardRegistry, cardShardOf, loadCardShard, readCatalogChunk } from 'engine/client'
import { CATALOG_CHUNK_COUNT, loadCatalogChunk } from './catalogChunks.ts'
import { catalogFile, loadShardFile, shardFile } from './shardFiles.ts'

/**
 * The card pool, fetched as it's needed.
 *
 * Nothing here is on any page's startup path. There are two kinds of caller,
 * and each gets the pool in the form that suits it:
 *
 * - **A lookup by name** (`peekCard`, `loadCard`, `requestCards`,
 *   `useCardData`). The game page needs a definition only for extras: the
 *   tooltip on a card's name in the history, or the other face of a
 *   double-faced card in a zone viewer. Everything a game needs to be played
 *   arrives in the server's views, with each object's characteristics
 *   already worked out. A lookup fetches the one **shard** its name hashes
 *   to, the first time anything asks: the engine ships the pool's whole
 *   definitions as shards, each its own file in the build (see
 *   `engine/src/cards/card-shards.ts`).
 * - **The whole pool** (`loadCardPool`, `cardPool`), for the library and the
 *   deck builder, which search, sort and validate over every card. They
 *   read a card's printed fields, its text and what the deck rules look at,
 *   never what it does, so they get the **catalog**
 *   (`engine/src/cards/catalog.ts`): every card with its behaviour cut away,
 *   in a handful of pieces of plain data — about 11 MB where every shard
 *   was 39 (2026-11-14), parsed and not run. `main.tsx` fetches it
 *   alongside the page's own code and renders the page once both are in, so
 *   inside those pages `cardPool()` is always ready. Until then,
 *   `usePoolProgress` says how many of its pieces are in, for the loading
 *   screen's progress bar (`PoolLoading.tsx`).
 *
 * A catalog card answers a lookup by name too, where no shard has: on the
 * pool's pages every name resolves without a shard being fetched.
 *
 * Art is the exception, since the lobby draws commander art before anyone
 * has asked for a card. The engine's `PINNED_ART` holds the few printings
 * the pool pins, and every other card is found on Scryfall by name.
 *
 * A file that fails to load (a network error, or a deploy that replaced the
 * build while a page was open) reads as not loaded yet, and is fetched again
 * the next time something asks for it.
 */

/** Whole definitions, by name, from the shards that have arrived. */
const byName = new Map<string, CardDefinition>()
/** Catalog cards, by name, from the pieces that have arrived. */
const catalogByName = new Map<string, CardDefinition>()

/** Bumped as each file arrives, so a component that read `peekCard` before
 * it did renders again (`useCardData`). */
let version = 0
const listeners = new Set<() => void>()
const changed = (): void => {
  version++
  for (const listener of listeners) listener()
}

/** How much of the pool is in, for a page waiting on all of it. */
export interface PoolProgress {
  /** Catalog pieces loaded so far. One whose fetch failed doesn't count
   * until a later fetch succeeds. */
  readonly loaded: number
  /** Every piece: `CATALOG_CHUNK_COUNT`. */
  readonly total: number
}

/** Replaced, never mutated, as each piece arrives, so `useSyncExternalStore`
 * sees the same object until something changed. */
let progress: PoolProgress = { loaded: 0, total: CATALOG_CHUNK_COUNT }

/** How long files may be out with none of them arriving before the ones
 * still out are asked for again. They arrive within a second on an
 * ordinary connection; on a slow one they keep arriving, so this never
 * fires there. */
export const SHARD_STALL_MS = 5_000

/** Requests of one file at most: its own `import()`, then two by URL. */
export const MAX_SHARD_ATTEMPTS = 3

/**
 * The files still out, each with how to ask for it again. A request can
 * hang without failing (a user's library sat at 30 of 32 shards, 2026-10-14),
 * and nothing then would ever settle it, so whenever `SHARD_STALL_MS` passes
 * with files out and none arriving, each is asked for again by URL
 * (`shardFiles.ts`), and the first answer wins.
 */
const outstanding = new Map<string, () => void>()
let stallTimer: ReturnType<typeof setTimeout> | undefined

/** Starts the stall clock over, if any file is still out. */
function watchForStall(): void {
  clearTimeout(stallTimer)
  stallTimer = undefined
  if (outstanding.size === 0) return
  stallTimer = setTimeout(() => {
    for (const askAgain of [...outstanding.values()]) askAgain()
    watchForStall()
  }, SHARD_STALL_MS)
}

/** One kind of file the pool comes in — the shards, the catalog's pieces —
 * fetched one at a time by index, each at most once. */
interface Pieces<T> {
  readonly kind: string
  readonly loaded: Map<number, T>
  readonly inFlight: Map<number, Promise<T>>
  /** The file's own `import()`. */
  readonly load: (index: number) => Promise<T>
  /** Its URL, to ask again by (`shardFiles.ts`). */
  readonly file: (index: number) => string | undefined
  /** The file at that URL, as attempt `attempt`. */
  readonly again: (url: string, attempt: number) => Promise<T>
  /** Takes in a file that has arrived, before anyone is told. */
  readonly arrived: (index: number, piece: T) => void
}

function fetchPiece<T>(pieces: Pieces<T>, index: number): Promise<T> {
  const loaded = pieces.loaded.get(index)
  if (loaded !== undefined) return Promise.resolve(loaded)
  let pending = pieces.inFlight.get(index)
  if (pending === undefined) {
    const key = `${pieces.kind}:${index}`
    pending = new Promise<T>((resolve, reject) => {
      let attempts = 0
      let failures = 0
      let settled = false
      const arrived = (piece: T) => {
        if (settled) return
        settled = true
        outstanding.delete(key)
        pieces.loaded.set(index, piece)
        pieces.inFlight.delete(index)
        pieces.arrived(index, piece)
        changed()
        // A file arriving is progress: the rest get the full wait again.
        watchForStall()
        resolve(piece)
      }
      // Fails only once every request made has, so a retry that 404s (a
      // deploy replaced the build) doesn't cut short one still out.
      const failed = (error: unknown) => {
        failures++
        if (settled || failures < attempts) return
        settled = true
        outstanding.delete(key)
        pieces.inFlight.delete(index)
        reject(error)
      }
      const attempt = (request: Promise<T>) => {
        attempts++
        request.then(arrived, failed)
      }
      attempt(pieces.load(index))
      outstanding.set(key, () => {
        const url = pieces.file(index)
        if (settled || url === undefined || attempts >= MAX_SHARD_ATTEMPTS) return
        attempt(pieces.again(url, attempts + 1))
      })
    })
    pieces.inFlight.set(index, pending)
    if (stallTimer === undefined) watchForStall()
  }
  return pending
}

const shards: Pieces<CardShard> = {
  kind: 'shard',
  loaded: new Map(),
  inFlight: new Map(),
  load: loadCardShard,
  file: shardFile,
  again: (url, attempt) => loadShardFile<CardShard>(url, attempt),
  arrived: (_index, shard) => {
    for (const def of shard.pool) byName.set(def.name, def)
    for (const def of shard.tokens) byName.set(def.name, def)
  },
}

/** A catalog piece, read: its cards as definitions (`readCatalogChunk`). */
type CatalogPiece = ReturnType<typeof readCatalogChunk>

const catalog: Pieces<CatalogPiece> = {
  kind: 'catalog',
  loaded: new Map(),
  inFlight: new Map(),
  load: async (index) => readCatalogChunk(await loadCatalogChunk(index)),
  file: catalogFile,
  again: async (url, attempt) => readCatalogChunk(await loadShardFile<CatalogChunk>(url, attempt)),
  arrived: (_index, piece) => {
    for (const def of piece.pool) catalogByName.set(def.name, def)
    for (const def of piece.tokens) catalogByName.set(def.name, def)
    progress = { loaded: catalog.loaded.size, total: CATALOG_CHUNK_COUNT }
  },
}
const fetchShard = (index: number): Promise<CardShard> => fetchPiece(shards, index)

/**
 * The definition named `name`, if it's in: the card whole when its shard has
 * arrived, else its catalog card when the catalog has it; `null` when the
 * pool has no card by that name. `undefined` means nothing that would know
 * has loaded yet — ask with `loadCard` or `requestCards`.
 */
export function peekCard(name: string): CardDefinition | null | undefined {
  const def = byName.get(name) ?? catalogByName.get(name)
  if (def !== undefined) return def
  return shards.loaded.has(cardShardOf(name)) || pool !== null ? null : undefined
}

/** The whole definition named `name`, fetching its shard first if need be.
 * `null` when the pool has no such card, or its shard couldn't be fetched. */
export async function loadCard(name: string): Promise<CardDefinition | null> {
  try {
    await fetchShard(cardShardOf(name))
  } catch {
    return null
  }
  return byName.get(name) ?? null
}

/** Starts fetching the shards `names` are in, without waiting for them. Not
 * where the catalog already answers for a name: its pages need no more. */
export function requestCards(names: Iterable<string>): void {
  for (const name of names) if (!catalogByName.has(name)) void loadCard(name)
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
 * renders again as each file arrives, so a card that wasn't loaded the first
 * time shows up once it is. Reading fetches nothing; pair it with
 * `requestCards` for the names the component shows.
 */
export function useCardData(): (name: string) => CardDefinition | null | undefined {
  useSyncExternalStore(subscribe, currentVersion)
  return peekCard
}

/** How many of the catalog's pieces are in. */
export function poolProgress(): PoolProgress {
  return progress
}

/**
 * `poolProgress`, for a component that draws it: the component renders again
 * as each piece arrives. A failed piece isn't reported here, since
 * `loadCardPool` rejects on it, and the page waiting on the pool shows its
 * failure instead (`PoolLoadBoundary`).
 */
export function usePoolProgress(): PoolProgress {
  return useSyncExternalStore(subscribe, poolProgress)
}

/**
 * Every card and token, for the pages that work over all of them: catalog
 * cards, which say everything about a card but what it does (see above). The
 * tokens a card makes are `tokensMadeBy` (`engine/client`), which knows a
 * catalog card's.
 */
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

/** Fetches every piece of the catalog, in parallel, and assembles the pool. */
export function loadCardPool(): Promise<CardPool> {
  if (pool !== null) return Promise.resolve(pool)
  poolPending ??= Promise.all(
    Array.from({ length: CATALOG_CHUNK_COUNT }, (_, i) => fetchPiece(catalog, i)),
  ).then(
    (loaded) => {
      const alphabetical = (a: CardDefinition, b: CardDefinition) => a.name.localeCompare(b.name)
      const cards = loaded.flatMap((piece) => piece.pool).sort(alphabetical)
      const tokens = loaded.flatMap((piece) => piece.tokens).sort(alphabetical)
      const registry = new CardRegistry()
      for (const def of cards) registry.register(def)
      for (const def of tokens) registry.register(def)
      pool = { cards, tokens, byName: catalogByName, registry }
      changed()
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
