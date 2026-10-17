/**
 * Who illustrated a card's art, for the credit Scryfall's image guidelines
 * ask for wherever an art crop is shown: "When using the art_crop, list the
 * artist name and copyright elsewhere in the same interface presenting the
 * art crop" (scryfall.com/docs/api, "Use of Scryfall Data and Images"). The
 * board's tiles are art crops; the hover card (`CardTile`) carries the
 * credit for whichever one is being looked at, and the lobby and the landing
 * page credit theirs beside them. See `docs/plans/fan-content-policy.md`.
 *
 * An art reference resolves the way `resolveArtUrl` resolves it — a card by
 * name (the printing Scryfall serves for that name), or a pinned printing by
 * card id, page link or API link — and the artist comes from the same
 * printing. Lookups are batched through `/cards/collection` like the art's
 * own (75 to a request), and `art.ts`'s by-name batch seeds this cache from
 * the cards it already fetched (`noteArtists`), so a card on the board costs
 * nothing more. Kept in `localStorage` for two weeks, as the image URLs are.
 */

/** A `/cards/collection` identifier. */
type Identifier =
  | { readonly id: string }
  | { readonly set: string; readonly collector_number: string }
  | { readonly name: string }

interface Target {
  readonly key: string
  readonly identifier: Identifier
  /** The second printed face (a transforming card turned over). */
  readonly back: boolean
  /** For a by-name lookup: the face named, which may be either face. */
  readonly faceName?: string
}

interface CollectionFace {
  readonly name?: string
  readonly artist?: string
}

interface CollectionCard extends CollectionFace {
  readonly id?: string
  readonly set?: string
  readonly collector_number?: string
  readonly card_faces?: readonly CollectionFace[]
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const PAGE_RE = /^https?:\/\/(?:www\.)?scryfall\.com\/card\/([^/]+)\/([^/?#]+)/i
const API_RE = /^https?:\/\/api\.scryfall\.com\/cards\/([^?#]+)/i
/** `cards.scryfall.io/{version}/{front|back}/{a}/{b}/{id}.{ext}`. */
const CDN_RE = /^https?:\/\/cards\.scryfall\.io\/[^/]+\/(front|back)\/[^/]+\/[^/]+\/([0-9a-f-]{36})\./i

/** What `art`/`name` names, as `resolveArtUrl` reads it; `null` for an
 * image off Scryfall, which has no artist to look up. */
export function artTarget(art: string | null | undefined, name: string, backFace = false): Target | null {
  if (!art) return { key: `n:${name.toLowerCase()}`, identifier: { name }, back: false, faceName: name }
  const trimmed = art.trim()
  const byId = (id: string, back: boolean): Target => ({
    key: `i:${id.toLowerCase()}${back ? ':b' : ''}`,
    identifier: { id: id.toLowerCase() },
    back,
  })
  const bySet = (set: string, number: string, back: boolean): Target => ({
    key: `s:${set.toLowerCase()}/${number.toLowerCase()}${back ? ':b' : ''}`,
    identifier: { set: set.toLowerCase(), collector_number: number },
    back,
  })
  if (UUID_RE.test(trimmed)) return byId(trimmed, backFace)
  const cdn = CDN_RE.exec(trimmed)
  if (cdn) return byId(cdn[2], cdn[1].toLowerCase() === 'back')
  const page = PAGE_RE.exec(trimmed)
  if (page) return bySet(page[1], page[2], backFace)
  const api = API_RE.exec(trimmed)
  if (api) {
    const parts = api[1].split('/')
    if (parts.length === 1 && UUID_RE.test(parts[0])) return byId(parts[0], backFace)
    if (parts.length === 2) return bySet(parts[0], parts[1], backFace)
  }
  return null
}

/** key -> the artist, or `null` once Scryfall has none to give. */
const artists = new Map<string, string | null>()
const savedAt = new Map<string, number>()
const pending = new Map<string, Target>()
const inFlight = new Set<string>()
const attempts = new Map<string, number>()
const listeners = new Set<() => void>()
let version = 0
let flushTimer: ReturnType<typeof setTimeout> | null = null
let persistTimer: ReturnType<typeof setTimeout> | null = null

const COLLECTION_ENDPOINT = 'https://api.scryfall.com/cards/collection'
const BATCH = 75
const FLUSH_DEBOUNCE_MS = 50
const MAX_ATTEMPTS = 3
const PERSIST_KEY = 'mtg-engine:artists:v1'
const PERSIST_TTL_MS = 14 * 24 * 60 * 60 * 1000
const PERSIST_MAX_ENTRIES = 4000

function notify(): void {
  version += 1
  for (const listener of listeners) listener()
}

export function subscribeArtists(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getArtistsVersion(): number {
  return version
}

function store(key: string, artist: string | null): void {
  if (artists.get(key) === artist) return
  artists.set(key, artist)
  savedAt.set(key, Date.now())
}

/** The artist of `card`'s face: the one named, else the back or front. */
function artistOf(card: CollectionCard, back: boolean, faceName?: string): string | null {
  const faces = card.card_faces ?? []
  if (faceName !== undefined) {
    const lower = faceName.toLowerCase()
    const face = faces.find((f) => f.name?.toLowerCase() === lower)
    if (face !== undefined) return face.artist ?? card.artist ?? null
  }
  const face = faces[back ? 1 : 0]
  return face?.artist ?? card.artist ?? null
}

/** Seeds the by-name entries from a card `art.ts`'s own lookup fetched —
 * the same printing whose art it shows. */
export function noteArtists(card: CollectionCard): void {
  let changed = false
  const put = (name: string | undefined, artist: string | null): void => {
    if (!name || artist === null) return
    const key = `n:${name.toLowerCase()}`
    if (artists.get(key) !== artist) {
      store(key, artist)
      changed = true
    }
  }
  put(card.name, artistOf(card, false))
  for (const face of card.card_faces ?? []) put(face.name, face.artist ?? card.artist ?? null)
  if (changed) {
    notify()
    persistSoon()
  }
}

function loadPersisted(): void {
  try {
    const raw = window.localStorage.getItem(PERSIST_KEY)
    if (!raw) return
    const stored = JSON.parse(raw) as Record<string, readonly [number, string | null]>
    const cutoff = Date.now() - PERSIST_TTL_MS
    for (const [key, [at, artist]] of Object.entries(stored)) {
      if (at < cutoff || artists.has(key)) continue
      artists.set(key, artist)
      savedAt.set(key, at)
    }
  } catch {
    // Unreadable or blocked: look them up again.
  }
}

function persistSoon(): void {
  if (persistTimer !== null || typeof window === 'undefined') return
  persistTimer = setTimeout(() => {
    persistTimer = null
    try {
      const cutoff = Date.now() - PERSIST_TTL_MS
      const live = [...savedAt]
        .filter(([, at]) => at >= cutoff)
        .sort((a, b) => b[1] - a[1])
        .slice(0, PERSIST_MAX_ENTRIES)
      const out: Record<string, readonly [number, string | null]> = {}
      for (const [key, at] of live) {
        const artist = artists.get(key)
        if (artist !== undefined) out[key] = [at, artist]
      }
      window.localStorage.setItem(PERSIST_KEY, JSON.stringify(out))
    } catch {
      // Full or blocked: the in-memory cache still serves this visit.
    }
  }, 1000)
}

if (typeof window !== 'undefined') loadPersisted()

/** Which card in a response answers `target`. */
function answers(card: CollectionCard, target: Target): boolean {
  const id = target.identifier
  if ('id' in id) return card.id?.toLowerCase() === id.id
  if ('set' in id) {
    return card.set?.toLowerCase() === id.set && card.collector_number?.toLowerCase() === id.collector_number.toLowerCase()
  }
  const lower = id.name.toLowerCase()
  return card.name?.toLowerCase() === lower || (card.card_faces ?? []).some((f) => f.name?.toLowerCase() === lower)
}

async function flush(): Promise<void> {
  const targets = [...pending.values()]
  pending.clear()
  for (const t of targets) inFlight.add(t.key)
  let changed = false
  for (let i = 0; i < targets.length; i += BATCH) {
    const chunk = targets.slice(i, i + BATCH)
    try {
      const res = await fetch(COLLECTION_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifiers: chunk.map((t) => t.identifier) }),
      })
      if (!res.ok) throw new Error(`Scryfall returned ${res.status}`)
      const data = (await res.json()) as { data?: readonly CollectionCard[] }
      const cards = data.data ?? []
      for (const target of chunk) {
        const card = cards.find((c) => answers(c, target))
        // Not found: nothing to credit but the copyright, which shows anyway.
        store(target.key, card === undefined ? null : artistOf(card, target.back, target.faceName))
        changed = true
      }
    } catch {
      // A blip: a few more tries, then leave the credit at the copyright.
      for (const target of chunk) {
        const n = (attempts.get(target.key) ?? 0) + 1
        attempts.set(target.key, n)
        if (n < MAX_ATTEMPTS) setTimeout(() => queue(target), 2000 * n)
        else {
          artists.set(target.key, null)
          changed = true
        }
      }
    } finally {
      for (const t of chunk) inFlight.delete(t.key)
    }
  }
  if (changed) {
    notify()
    persistSoon()
  }
}

function queue(target: Target): void {
  if (artists.has(target.key) || pending.has(target.key) || inFlight.has(target.key)) return
  pending.set(target.key, target)
  if (flushTimer !== null) return
  flushTimer = setTimeout(() => {
    flushTimer = null
    void flush()
  }, FLUSH_DEBOUNCE_MS)
}

/**
 * The artist of the art `art`/`name` names: a name, `null` when there's none
 * to give (off Scryfall, not found), or `undefined` while it's being looked
 * up — which this starts. Safe to call during render, as `queueArtLookup` is;
 * subscribe with `subscribeArtists` to hear it arrive.
 */
export function artistFor(art: string | null | undefined, name: string, backFace = false): string | null | undefined {
  const target = artTarget(art, name, backFace)
  if (target === null) return null
  const known = artists.get(target.key)
  if (known !== undefined) return known
  queue(target)
  return undefined
}

/** The copyright line a card prints beside its illustrator. */
export const CARD_COPYRIGHT = '™ & © Wizards of the Coast'
