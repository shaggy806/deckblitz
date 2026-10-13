/**
 * The library's "Set" filter: which sets there are, and which cards each one
 * printed — both from Scryfall, as a direct browser call like the deck
 * builder's printing picker (`deck-builder/printings.ts`). The pool knows one
 * printing per card at most, never every set a card has been in, so a set's
 * card list — and each card's printing in it, which the gallery shows while
 * the set is chosen — can only come from Scryfall; it is asked for when a set
 * is picked, and kept for the life of the page.
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

interface ScryfallImages {
  readonly normal?: string
}

/** One printing in a set search — the fields the filter reads. */
export interface ScryfallPrint {
  readonly id: string
  readonly name: string
  readonly collector_number: string
  readonly image_uris?: ScryfallImages
  readonly card_faces?: readonly { readonly name: string; readonly image_uris?: ScryfallImages }[]
}

interface ScryfallSearchResponse {
  readonly data?: readonly ScryfallPrint[]
  readonly has_more?: boolean
  readonly next_page?: string
}

/** A card's printing in the chosen set, for one of the names it answers to. */
export interface SetPrinting {
  /** Scryfall card id — the printings panel marks the printing by it. */
  readonly id: string
  readonly collectorNumber: string
  /** The image of the face this name is printed on (a double-faced card's
   * back face gets the back's), a `cards.scryfall.io` file, or `null` if
   * Scryfall has none. Shown through `resolveArtUrl`, like any card's `art`. */
  readonly image: string | null
}

/** A set's cards, as {@link namesOf} gives their names. */
export interface SetCards {
  readonly names: ReadonlySet<string>
  /** How many distinct cards the set printed. */
  readonly total: number
  /** Each name → its printing in the set ({@link setCardsOf} says which). */
  readonly printings: ReadonlyMap<string, SetPrinting>
}

/** A collector number's sort key: its leading digits as a number, then the
 * whole string ("12" < "12a" < "120"; "★" and the like last). */
function collectorKey(n: string): [number, string] {
  const digits = /^\d+/.exec(n)
  return [digits === null ? Number.POSITIVE_INFINITY : Number(digits[0]), n]
}

function lowerCollectorNumber(a: string, b: string): boolean {
  const [an, as] = collectorKey(a)
  const [bn, bs] = collectorKey(b)
  return an !== bn ? an < bn : as < bs
}

/**
 * A set's cards out of its printings (`unique: 'prints'`), in any order. A
 * card printed several times in the set is shown in its **lowest-numbered**
 * printing: the set's own numbered card, ahead of the showcase, borderless and
 * extended-art variants, which a set numbers after its main run (a basic land,
 * its first art). Not Scryfall's `unique: 'cards'` pick, which can land on a
 * later reprint numbered past the set's end (Foundations' Serra Angel came back
 * as #740, not #147). Pure.
 */
export function setCardsOf(prints: readonly ScryfallPrint[]): SetCards {
  const chosen = new Map<string, ScryfallPrint>()
  for (const print of prints) {
    const held = chosen.get(print.name)
    if (held === undefined || lowerCollectorNumber(print.collector_number, held.collector_number)) {
      chosen.set(print.name, print)
    }
  }
  const names = new Set<string>()
  const printings = new Map<string, SetPrinting>()
  for (const print of chosen.values()) {
    const at = (image: string | undefined): SetPrinting => ({
      id: print.id,
      collectorNumber: print.collector_number,
      image: image ?? null,
    })
    // One image for the whole card (a split card, an adventure) or one per
    // face (a double-faced card): each face's name gets its own face's.
    const faces = print.card_faces ?? []
    const front = print.image_uris?.normal ?? faces[0]?.image_uris?.normal
    for (const name of namesOf(print.name)) {
      names.add(name)
      const face = faces.find((f) => f.name === name)
      printings.set(name, at(print.image_uris?.normal ?? face?.image_uris?.normal ?? front))
    }
  }
  return { names, total: chosen.size, printings }
}

const setCards = new Map<string, Promise<SetCards>>()

/**
 * The cards `code` printed: one search per 175 printings (`e:<code>`, every
 * printing, so {@link setCardsOf} can pick each card's), its pages fetched one
 * after another, a tenth of a second apart, inside Scryfall's rate limit. Kept
 * for the life of the page; a failure isn't.
 */
export function fetchSetCards(code: string): Promise<SetCards> {
  let request = setCards.get(code)
  if (request === undefined) {
    request = (async () => {
      const prints: ScryfallPrint[] = []
      const params = new URLSearchParams({ q: `e:${code}`, unique: 'prints', order: 'set' })
      let url: string | undefined = `https://api.scryfall.com/cards/search?${params.toString()}`
      while (url !== undefined) {
        const res = await fetch(url)
        // 404 is Scryfall's "no cards matched".
        if (res.status === 404) break
        if (!res.ok) throw new Error(`Scryfall returned ${res.status}`)
        const data = (await res.json()) as ScryfallSearchResponse
        prints.push(...(data.data ?? []))
        url = data.has_more === true ? data.next_page : undefined
        if (url !== undefined) await new Promise((resolve) => setTimeout(resolve, 100))
      }
      return setCardsOf(prints)
    })()
    setCards.set(code, request)
    request.catch(() => setCards.delete(code))
  }
  return request
}
