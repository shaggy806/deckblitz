/**
 * Local (per-browser) deck persistence — no server-side save/share yet, that's
 * the separate, later roadmap item (see `docs/plans/`). A small named-deck
 * list in `localStorage`, plus a reference to whichever deck is "active":
 * the deck a seat starts with on the seat board (`getActiveDeck`, read by
 * `SeatBoard`). `localStorage`, not `sessionStorage` — a
 * deck someone's building should survive closing the tab, unlike a room seat
 * claim.
 *
 * "Active" can point at one of the player's own saved decks *or* directly at
 * one of `engine`'s `STARTER_DECKS` (the curated starter decks: the precons,
 * then their upgrades) or at one of its `STRONG_DECKS` (the average decks
 * and two players' own, Bracket 4) — playing a built-in deck as-is shouldn't require duplicating
 * it into "my decks" first.
 */

import { STARTER_DECKS, STRONG_DECKS, commandersOf, nameForFlavorName } from 'engine/client'
import type { CommanderColors } from 'engine/client'
import type { SeatCommander, WireDeck } from 'protocol'

export interface SavedDeck {
  readonly id: string;
  readonly name: string;
  /**
   * None, one, or two: a Partner pair, or a commander and its Background
   * (rule 903.3c). Stored beside `cards` rather than in it, as the wire and
   * the engine both have it. A deck saved before pairs existed has a single
   * `commander` instead, which `readDecks` turns into this.
   */
  readonly commanders: readonly string[];
  /**
   * The colour chosen for a commander that says "If ~ is your commander,
   * choose a color before the game begins" (rule 903.4b — Clara Oswald, The
   * Prismatic Piper), by its name: chosen in the deck editor, or read off an
   * imported list's cards. Absent on every other deck.
   */
  readonly commanderColors?: CommanderColors;
  readonly cards: readonly string[];
  /**
   * Which printing of a card this deck brings, keyed by card name → Scryfall
   * card id. Keyed by *name*, not per copy: the format is singleton, and for
   * the one card type that does repeat (basic lands) wanting two different
   * arts in the same deck is a niche the picker isn't worth complicating for.
   * A name with no entry plays as the pool's default printing, which is what
   * every deck saved before the picker existed has.
   */
  readonly printings?: Readonly<Record<string, string>>;
  /**
   * The deck's sideboard (rule 100.4): up to fifteen cards (100.4a) kept
   * outside the game, which a wish (Burning Wish, Karn, the Great Creator) or
   * learn brings in, or a companion to reveal (103.2b). Commander games use no
   * sideboards (903.5e), so a Commander deck's counts only for its companions
   * (702.139d): the game leaves out the rest. Absent on every deck saved before
   * sideboards existed.
   */
  readonly sideboard?: readonly string[];
  /**
   * The deck's Attraction deck (rule 717.2), apart from `cards`: each a name,
   * or a name and the collector number of the printing whose lit numbers it
   * brings (717.1). Absent on every deck saved before Attractions existed,
   * and on most decks since.
   */
  readonly attractions?: readonly AttractionEntry[];
}

/** One card of an Attraction deck, as the wire carries it. */
export type AttractionEntry = NonNullable<WireDeck['attractions']>[number]

/** An Attraction deck entry's card name. */
export const attractionName = (entry: AttractionEntry): string => (typeof entry === 'string' ? entry : entry.name)

/** The collector number an entry names, or `null` for the card's first printing. */
export const attractionCollector = (entry: AttractionEntry): string | null =>
  typeof entry === 'string' ? null : (entry.collector ?? null)

/** "In constructed play, a sideboard may contain no more than fifteen cards"
 * (rule 100.4a) — the server's cap too. */
export const MAX_SIDEBOARD = 15

/** The sideboard a deck brings to a table, none when it's empty. A Commander
 * deck's goes too: the game keeps its companions and leaves out the rest (rules
 * 903.5e, 702.139d), and this has no card pool to tell them apart with. */
export function playableSideboard(deck: {
  readonly commanders: readonly string[]
  readonly sideboard?: readonly string[]
}): readonly string[] | undefined {
  if (deck.sideboard === undefined || deck.sideboard.length === 0) return undefined
  return deck.sideboard.slice(0, MAX_SIDEBOARD)
}

/**
 * One of the decks that come with the site: a starter by its index in
 * `STARTER_DECKS` (which only grows at its end), or a strong deck by its
 * name. By name, since `STRONG_DECKS`' averages are generated, with the
 * players' decks after them: one more average moves every index past it,
 * and a saved reference would then name another deck. A reference to a deck
 * no longer there (the eight Archidekt decks, gone 2026-11-25) names
 * nothing, and the player has no active deck until they pick one.
 */
export type BuiltInRef =
  | { readonly kind: 'starter'; readonly index: number }
  | { readonly kind: 'strong'; readonly name: string }

export type ActiveRef = { readonly kind: 'saved'; readonly id: string } | BuiltInRef

/** Whether two references name the same deck. */
export function sameRef(a: ActiveRef | null, b: ActiveRef | null): boolean {
  if (a === null || b === null || a.kind !== b.kind) return false
  if (a.kind === 'saved') return a.id === (b as typeof a).id
  if (a.kind === 'starter') return a.index === (b as typeof a).index
  return a.name === (b as typeof a).name
}

/** The built-in deck `ref` names, or `null` when it names none (a strong
 * deck since renamed or removed). */
export function builtInDeck(ref: BuiltInRef): (typeof STARTER_DECKS)[number] | null {
  return (ref.kind === 'starter' ? STARTER_DECKS[ref.index] : STRONG_DECKS.find((d) => d.name === ref.name)) ?? null
}

const DECKS_KEY = 'mtg-engine:decks'
const ACTIVE_KEY = 'mtg-engine:active-deck'

function newId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2)
}

/** Wraps every `localStorage` access — a private window or blocked site data
 * throws on read/write, in which case decks just don't persist rather than
 * breaking the builder (same convention as `useNetworkGame.ts`'s
 * `sessionStorage` helpers). */
function readDecks(): SavedDeck[] {
  try {
    const raw = window.localStorage.getItem(DECKS_KEY)
    if (!raw) return []
    const stored = JSON.parse(raw) as StoredDeck[]
    const decks = stored.map((deck) => renameCards(fromStorage(deck)))
    // Each migration hands back the deck it was given when it has nothing to
    // do, so an unchanged list is the same objects. Anything migrated is
    // written back once, here, rather than waiting for the deck to be edited:
    // the next read finds today's shape and has nothing to do.
    if (decks.some((deck, i) => deck !== stored[i])) writeDecks(decks)
    return decks
  } catch {
    return []
  }
}

/** A deck as some version of this file wrote it: before Partner pairs, a
 * lone optional `commander` rather than a `commanders` list.
 *
 * `fromStorage` and `renameCards` are the two migrations. Since 2026-10-09
 * `readDecks` saves what they produce, so each old deck needs them on just
 * one read in the browser holding it. They can go once that's had time to
 * happen for decks in use (a few months, say from 2027); a deck first read
 * after that would lose its lone commander and keep a flavor name the server
 * refuses. */
type StoredDeck = Omit<SavedDeck, 'commanders'> & {
  readonly commanders?: readonly string[]
  readonly commander?: string
}

function fromStorage(stored: StoredDeck): SavedDeck {
  if (stored.commanders !== undefined && !('commander' in stored)) return stored as SavedDeck
  const { commander: legacy, ...rest } = stored
  return { ...rest, commanders: stored.commanders ?? (legacy === undefined ? [] : [legacy]) }
}

/** A deck saved holding a card under a name the server doesn't know — its
 * flavor name (the pool once registered Azusa, Lost but Seeking as "Princess
 * Sarah") — has it renamed to the card's own, or it would be refused when
 * brought to a table. */
function renameCards(deck: SavedDeck): SavedDeck {
  const renamed = (name: string) => nameForFlavorName(name) ?? name
  const differs = (name: string) => renamed(name) !== name
  const touched =
    deck.cards.some(differs) ||
    deck.commanders.some(differs) ||
    (deck.sideboard ?? []).some(differs) ||
    Object.keys(deck.printings ?? {}).some(differs)
  if (!touched) return deck
  return {
    ...deck,
    cards: deck.cards.map(renamed),
    commanders: deck.commanders.map(renamed),
    ...(deck.sideboard !== undefined ? { sideboard: deck.sideboard.map(renamed) } : {}),
    ...(deck.printings
      ? {
          printings: Object.fromEntries(
            Object.entries(deck.printings).map(([name, id]) => [renamed(name), id]),
          ),
        }
      : {}),
  }
}

function writeDecks(decks: readonly SavedDeck[]): void {
  try {
    window.localStorage.setItem(DECKS_KEY, JSON.stringify(decks))
  } catch {
    // ignore — see readDecks
  }
}

export function listDecks(): SavedDeck[] {
  return readDecks()
}

export function getDeck(id: string): SavedDeck | null {
  return readDecks().find((d) => d.id === id) ?? null
}

/** Creates a new, empty deck (no commander, no cards) and makes it active. */
export function createDeck(name: string): SavedDeck {
  const deck: SavedDeck = { id: newId(), name, commanders: [], cards: [] }
  writeDecks([...readDecks(), deck])
  setActive({ kind: 'saved', id: deck.id })
  return deck
}

/** `deck` with every copy of `from` — in the deck, the sideboard or the
 * command zone — replaced by `to`, where it stood. `from`'s chosen printing
 * goes with it. */
export function replaceCard(deck: SavedDeck, from: string, to: string): SavedDeck {
  const swap = (names: readonly string[]): readonly string[] => names.map((n) => (n === from ? to : n))
  const { printings, sideboard, ...rest } = deck
  const kept = printings === undefined ? undefined : Object.fromEntries(Object.entries(printings).filter(([name]) => name !== from))
  return {
    ...rest,
    cards: swap(deck.cards),
    commanders: swap(deck.commanders),
    ...(sideboard !== undefined ? { sideboard: swap(sideboard) } : {}),
    ...(kept !== undefined && Object.keys(kept).length > 0 ? { printings: kept } : {}),
  }
}

/** `name`, or `name (2)`, `name (3)`… — the first that no deck in `taken` has. */
export function unusedDeckName(name: string, taken: readonly string[]): string {
  if (!taken.includes(name)) return name
  for (let n = 2; ; n += 1) {
    const candidate = `${name} (${n})`
    if (!taken.includes(candidate)) return candidate
  }
}

/** Same as `createDeck`, but pre-populated — for the deck builder's decklist
 * import flow, once it's resolved a final card list (implemented cards
 * as-is, an already-implemented stand-in for anything the engine doesn't
 * have yet). */
export function createDeckFromImport(
  name: string,
  cards: readonly string[],
  commanders: readonly string[] = [],
  printings?: Readonly<Record<string, string>>,
  sideboard: readonly string[] = [],
  attractions: readonly AttractionEntry[] = [],
  commanderColors: CommanderColors = {},
): SavedDeck {
  const deck: SavedDeck = {
    id: newId(),
    // The same list imported twice is two decks nothing told apart.
    name: unusedDeckName(name, readDecks().map((d) => d.name)),
    cards,
    commanders,
    ...(Object.keys(commanderColors).length > 0 ? { commanderColors } : {}),
    ...(sideboard.length > 0 ? { sideboard } : {}),
    ...(attractions.length > 0 ? { attractions } : {}),
    // Omitted entirely when the pasted list carried no printing suffixes, so
    // an imported deck looks like any other hand-built one.
    ...(printings && Object.keys(printings).length > 0 ? { printings } : {}),
  }
  writeDecks([...readDecks(), deck])
  setActive({ kind: 'saved', id: deck.id })
  return deck
}

/** Upserts by id — the builder calls this on every edit (add/remove a card,
 * set the commander, rename). */
export function saveDeck(deck: SavedDeck): void {
  const decks = readDecks()
  const i = decks.findIndex((d) => d.id === deck.id)
  if (i === -1) writeDecks([...decks, deck])
  else writeDecks(decks.map((d, j) => (j === i ? deck : d)))
}

export function deleteDeck(id: string): void {
  writeDecks(readDecks().filter((d) => d.id !== id))
  const active = getActiveRef()
  if (active?.kind === 'saved' && active.id === id) setActive(null)
}

/** Copies a saved deck, or one of the read-only starter decks (`fromStarter`
 * index), into a new editable entry in "my decks". */
export function duplicateDeck(id: string): SavedDeck | null {
  const source = getDeck(id)
  if (source === null) return null
  const copy: SavedDeck = { ...source, id: newId(), name: `${source.name} (copy)` }
  writeDecks([...readDecks(), copy])
  return copy
}

export function duplicateStarter(ref: BuiltInRef): SavedDeck | null {
  const source = builtInDeck(ref)
  if (source === null) return null
  const copy: SavedDeck = {
    id: newId(),
    name: `${source.name} (copy)`,
    commanders: commandersOf(source),
    cards: source.cards,
    // A copy keeps its precon's printings, as the starter shows them.
    ...(source.printings !== undefined ? { printings: source.printings } : {}),
  }
  writeDecks([...readDecks(), copy])
  return copy
}

export function getActiveRef(): ActiveRef | null {
  try {
    const raw = window.localStorage.getItem(ACTIVE_KEY)
    return raw ? (JSON.parse(raw) as ActiveRef) : null
  } catch {
    return null
  }
}

export function setActive(ref: ActiveRef | null): void {
  try {
    if (ref === null) window.localStorage.removeItem(ACTIVE_KEY)
    else window.localStorage.setItem(ACTIVE_KEY, JSON.stringify(ref))
  } catch {
    // ignore — see readDecks
  }
}

/** What a deck brings to a table, whether it's a saved deck or a starter. */
export interface DeckContents {
  readonly name: string
  readonly commanders: readonly string[]
  /** See `SavedDeck.commanderColors`. */
  readonly commanderColors?: CommanderColors
  readonly cards: readonly string[]
  readonly printings?: Readonly<Record<string, string>>
  readonly sideboard?: readonly string[]
  readonly attractions?: readonly AttractionEntry[]
}

/** A deck's commanders with the printing it brings for each — what the
 * lobby draws, and the shape `SeatStatus` carries for someone else's seat. */
export function commanderPrintings(deck: DeckContents): readonly SeatCommander[] {
  return deck.commanders.map((name) => ({ name, printing: deck.printings?.[name] ?? null }))
}

function starterContents(ref: BuiltInRef): DeckContents | null {
  const deck = builtInDeck(ref)
  if (deck === null) return null
  return { name: deck.name, commanders: commandersOf(deck), cards: deck.cards, printings: deck.printings }
}

/** The active deck's display name + card data, regardless of whether it's a
 * saved deck or a starter — `null` when nothing's active or the active
 * reference no longer resolves (a deleted saved deck). */
export function getActiveDeck(): DeckContents | null {
  const ref = getActiveRef()
  if (ref === null) return null
  if (ref.kind === 'saved') return getDeck(ref.id)
  return starterContents(ref)
}

/** One pickable option in the seat-picker's deck-choice popup — a saved deck
 * or one of `engine`'s starters, normalized to the same shape. `key` is
 * stable for React lists; `ref` is what selecting it should persist as
 * "active" (a saved deck only — picking a starter for someone *else's* seat,
 * a bot, shouldn't change what *you'd* bring if you later join yourself). */
export interface PickableDeck extends DeckContents {
  readonly key: string
  readonly ref: ActiveRef | null
  /** A built-in deck's strength, which the picker groups by; a saved deck
   * has none. */
  readonly strength?: DeckStrength
  /** A real player's deck: its creator, whose name a bot playing it takes
   * (the server's `PendingRoom.botName`). Its title is what `deckLabel`
   * shows for it. */
  readonly author?: string
  /** An average deck: whose average it is ("EDHREC"). No one's list, so it
   * has no `author`. */
  readonly averageOf?: string
}

/** How strong a built-in deck is: a precon as printed, its upgrade, or a
 * strong deck (an average of real Bracket 4 decks, or a player's own). */
export type DeckStrength = 'precon' | 'upgraded' | 'strong'

/** Every deck the seat-picker's popup can offer: this browser's saved decks,
 * then the starter decks — in that order, since a saved deck is more likely
 * to be what someone actually wants to bring than a generic starter — then
 * the strong decks (`listStrongDecks`). */
export function listPickableDecks(): readonly PickableDeck[] {
  return [
    ...readDecks().map((d) => ({
      key: `saved:${d.id}`,
      ref: { kind: 'saved', id: d.id } as ActiveRef,
      name: d.name,
      commanders: d.commanders,
      ...(d.commanderColors !== undefined ? { commanderColors: d.commanderColors } : {}),
      cards: d.cards,
      printings: d.printings,
      ...(d.sideboard !== undefined ? { sideboard: d.sideboard } : {}),
      ...(d.attractions !== undefined ? { attractions: d.attractions } : {}),
    })),
    ...STARTER_DECKS.map((d, i) => ({
      key: `starter:${i}`,
      ref: { kind: 'starter', index: i } as ActiveRef,
      name: d.name,
      commanders: commandersOf(d),
      cards: d.cards,
      printings: d.printings,
      strength: (d.upgradeOf !== undefined ? 'upgraded' : 'precon') as DeckStrength,
    })),
    ...listStrongDecks(),
  ]
}

/** The strong decks (`engine`'s `STRONG_DECKS`), as the picker and the deck
 * builder offer them: the averages of real Bracket 4 decks, and the decks
 * two players gave, credited on the About page. For
 * anyone's seat since 2026-11-24 (the user: "make the bracket 4 decks
 * available in the deck builder as starter decks and in the lobby as decks
 * that people can choose"); until then a bot's only. */
export function listStrongDecks(): readonly PickableDeck[] {
  return STRONG_DECKS.map((d, i) => ({
    key: `strong:${i}`,
    ref: { kind: 'strong', name: d.name } as ActiveRef,
    name: d.name,
    commanders: commandersOf(d),
    cards: d.cards,
    printings: d.printings,
    strength: 'strong' as DeckStrength,
    ...(d.credit !== undefined ? { author: d.credit.author } : {}),
    ...(d.average !== undefined ? { averageOf: d.average.source } : {}),
  }))
}

/** What follows a strong deck's commander on its row: " · by Shaggy5405"
 * for a player's deck, " · EDHREC average" for an average, nothing for any
 * other deck. */
export function deckSourceNote(deck: {
  readonly author?: string | undefined
  readonly averageOf?: string | undefined
}): string {
  if (deck.author !== undefined) return ` · by ${deck.author}`
  return deck.averageOf !== undefined ? ` · ${deck.averageOf} average` : ''
}

/**
 * What to call a deck where its name is shown: a real player's deck (a
 * strong deck) by its creator's own title, "Here Be Dragons", where its
 * `name` is "<commander> by <creator>", the form that carries the credit
 * wherever only a name travels (the wire, a script). Any other deck's name
 * is its label. The bot playing one is named for the creator, so the two
 * lines of a seat read "Shaggy5405" and "Here Be Dragons" (the user,
 * 2026-11-15).
 */
export function deckLabel(name: string): string {
  return STRONG_DECKS.find((d) => d.name === name)?.credit?.title ?? name
}
