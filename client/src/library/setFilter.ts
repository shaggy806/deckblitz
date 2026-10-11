/**
 * The library's "Set" filter: which sets there are, and which cards each one
 * printed — both from Scryfall, as a direct browser call like the deck
 * builder's printing picker (`deck-builder/printings.ts`). The pool knows one
 * printing per card at most, never every set a card has been in, so a set's
 * card list can only come from Scryfall; it is asked for when a set is picked,
 * and kept for the life of the page.
 */

/** One set the filter offers. */
export interface SetInfo {
  /** Scryfall's set code, lower case ("fra"). */
  readonly code: string
  readonly name: string
  /** YYYY-MM-DD. */
  readonly releasedAt: string
}

/** The kinds of set the filter lists — the ones `cards:sets` walks
 * (`engine/scripts/set-backlog.mjs`): paper expansions, core sets, Commander
 * products, draft-innovation, masters and starter sets. Promos, tokens,
 * Secret Lairs, memorabilia and digital sets aren't offered. */
const SET_TYPES: ReadonlySet<string> = new Set([
  'expansion',
  'core',
  'commander',
  'draft_innovation',
  'masters',
  'starter',
])

interface ScryfallSet {
  readonly code: string
  readonly name: string
  readonly set_type: string
  readonly released_at?: string
  readonly digital?: boolean
  readonly card_count?: number
}

/**
 * The sets worth offering out of Scryfall's `/sets` list, newest first: the
 * kinds above, in paper, with cards, and released by `today` (YYYY-MM-DD) —
 * a set previewing now has cards on Scryfall but none to play yet. Pure.
 */
export function offeredSets(sets: readonly ScryfallSet[], today: string): SetInfo[] {
  return sets
    .filter(
      (s) =>
        SET_TYPES.has(s.set_type) &&
        s.digital !== true &&
        (s.card_count ?? 0) > 0 &&
        s.released_at !== undefined &&
        s.released_at <= today,
    )
    .map((s) => ({ code: s.code, name: s.name, releasedAt: s.released_at as string }))
    .sort((a, b) => (a.releasedAt === b.releasedAt ? a.name.localeCompare(b.name) : a.releasedAt < b.releasedAt ? 1 : -1))
}

/**
 * Every name a Scryfall card answers to in the pool: its full name, and for a
 * card of several faces ("Bloodline Keeper // Lord of Lineage", "Fire // Ice")
 * each face's, since the pool keys a double-faced card by its front face and a
 * split card by its full name. Pure.
 */
export function namesOf(scryfallName: string): string[] {
  const faces = scryfallName.split(' // ')
  return faces.length > 1 ? [scryfallName, ...faces] : [scryfallName]
}

let setsRequest: Promise<SetInfo[]> | null = null

/** The sets the filter offers, fetched once per page. A failure isn't cached:
 * opening the menu again tries again. */
export function fetchSets(): Promise<SetInfo[]> {
  if (setsRequest === null) {
    setsRequest = (async () => {
      const res = await fetch('https://api.scryfall.com/sets')
      if (!res.ok) throw new Error(`Scryfall returned ${res.status}`)
      const data = (await res.json()) as { readonly data?: readonly ScryfallSet[] }
      return offeredSets(data.data ?? [], new Date().toISOString().slice(0, 10))
    })()
    setsRequest.catch(() => {
      setsRequest = null
    })
  }
  return setsRequest
}

interface ScryfallSearchResponse {
  readonly data?: readonly { readonly name: string }[]
  readonly has_more?: boolean
  readonly next_page?: string
}

/** A set's card names, as {@link namesOf} gives them. */
export interface SetCards {
  readonly names: ReadonlySet<string>
  /** How many distinct cards the set printed. */
  readonly total: number
}

const setCards = new Map<string, Promise<SetCards>>()

/**
 * The cards `code` printed: one search per 175 cards (`e:<code>`, one result
 * per card), its pages fetched one after another, a tenth of a second apart,
 * inside Scryfall's rate limit. Kept for the life of the page; a failure isn't.
 */
export function fetchSetCards(code: string): Promise<SetCards> {
  let request = setCards.get(code)
  if (request === undefined) {
    request = (async () => {
      const names = new Set<string>()
      let total = 0
      const params = new URLSearchParams({ q: `e:${code}`, unique: 'cards', order: 'set' })
      let url: string | undefined = `https://api.scryfall.com/cards/search?${params.toString()}`
      while (url !== undefined) {
        const res = await fetch(url)
        // 404 is Scryfall's "no cards matched".
        if (res.status === 404) break
        if (!res.ok) throw new Error(`Scryfall returned ${res.status}`)
        const data = (await res.json()) as ScryfallSearchResponse
        for (const card of data.data ?? []) {
          total += 1
          for (const name of namesOf(card.name)) names.add(name)
        }
        url = data.has_more === true ? data.next_page : undefined
        if (url !== undefined) await new Promise((resolve) => setTimeout(resolve, 100))
      }
      return { names, total }
    })()
    setCards.set(code, request)
    request.catch(() => setCards.delete(code))
  }
  return request
}
