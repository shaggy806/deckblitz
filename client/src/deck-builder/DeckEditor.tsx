import { useCallback, useMemo, useState } from 'react'
import type { DragEvent, MouseEvent, ReactNode } from 'react'
import type { CardDefinition, Color } from 'engine/client'
import {
  attractionDeckProblems,
  canCommandAlone,
  canPairCommanders,
  colorIdentityOf,
  companionProblem,
  edhrecRankOf,
  flavorNamesOf,
  hasPartner,
  identityString,
  isDeckableCard,
  fitsDeckIdentity,
  rulebreakersOf,
  validateCommanderDeck,
  withinIdentity,
} from 'engine/client'
import { cardPool } from '../cards/cardData.ts'
import { Symbols } from '../ui/Symbols.tsx'
import { CardHoverPreview } from '../ui/CardHoverPreview.tsx'
import type { HoverTarget } from '../ui/CardHoverPreview.tsx'
import { CardContextMenu } from './CardContextMenu.tsx'
import { StableLabel } from '../ui/StableLabel.tsx'
import type { MenuAnchor, MenuItem } from './CardContextMenu.tsx'
import { matchesTerms, searchHaystack, searchTerms } from '../library/search.ts'
import { PrintingPicker } from './PrintingPicker.tsx'
import { ReplacementPicker } from './ReplacementPicker.tsx'
import type { AttractionEntry, SavedDeck } from './decks.ts'
import { MAX_SIDEBOARD, attractionCollector, attractionName, replaceCard } from './decks.ts'
import { AttractionLights } from '../ui/AttractionLights.tsx'

const TYPE_FILTERS = [
  'creature',
  'instant',
  'sorcery',
  'artifact',
  'enchantment',
  'planeswalker',
  'land',
] as const

const DECK_SIZE = 100

let buildable: readonly CardDefinition[] | null = null

/** The buildable pool, by name. Tokens and back faces are registered
 * definitions but neither is a decklist entry — a token isn't a card at all
 * (rule 111.1), and a double-faced card is listed under its front face (rule
 * 712.3) — so they're filtered out here rather than offered and then rejected
 * by `validateCommanderDeck`. Built from the card pool on first use:
 * `main.tsx` loads the whole pool before rendering the deck builder.
 * Ordered by EDHREC rank, the most played first and unranked cards (too new
 * for EDHREC, basics) last alphabetically, so a search lists the cards
 * people actually play before an alphabetical wall (the user, 2026-10-07). */
function buildableCards(): readonly CardDefinition[] {
  buildable ??= cardPool()
    .cards.filter(isDeckableCard)
    .map((def) => ({ def, rank: edhrecRankOf(def.name) ?? Infinity }))
    .sort((a, b) =>
      a.rank === b.rank ? a.def.name.localeCompare(b.def.name) : a.rank === Infinity ? 1 : b.rank === Infinity ? -1 : a.rank - b.rank,
    )
    .map((r) => r.def)
  return buildable
}

const searchTexts = new WeakMap<CardDefinition, string>()

/** What the pool's search reads of a card, lowercase: its name, the names
 * it's printed under too ("Princess Sarah" finds Azusa), its subtypes and
 * its rules text. Built once a card. */
function searchTextOf(def: CardDefinition): string {
  let text = searchTexts.get(def)
  if (text === undefined) {
    text = searchHaystack([def.name, ...flavorNamesOf(def.name), def.subtypes.join(' '), def.text])
    searchTexts.set(def, text)
  }
  return text
}

/** Every definition, including the ones the buildable pool hides: a deck
 * saved before that filter existed can still name one, and such a row has to
 * render (and be removable) rather than showing up as an unknown card. */
const cardNamed = (name: string): CardDefinition | undefined => cardPool().byName.get(name)

/** An Attraction card (rule 717.1): it goes in the Attraction deck, never the 99. */
const isAttraction = (def: CardDefinition | undefined): boolean => (def?.attractionLights?.length ?? 0) > 0

/** Each card's colour identity (rule 903.4, every face's), worked out once:
 * the pool's colour filter reads thousands of them per keystroke. */
const identities = new WeakMap<CardDefinition, ReadonlySet<Color>>()
function identityOf(def: CardDefinition): ReadonlySet<Color> {
  let identity = identities.get(def)
  if (identity === undefined) {
    identity = colorIdentityOf(def, cardPool().registry)
    identities.set(def, identity)
  }
  return identity
}

/**
 * A deck's commanders once `cardName` is starred. Starring a commander again
 * demotes it. Otherwise the card joins a commander it can partner with (rule
 * 702.124c) — keeping, out of a full pair, the first one that can — and
 * partnering with none of them it replaces them, which is what starring a
 * second legend always did.
 */
function toggledCommanders(commanders: readonly string[], cardName: string): readonly string[] {
  if (commanders.includes(cardName)) return commanders.filter((n) => n !== cardName)
  const partner = commanders.find((n) => canPairCommanders(cardPool().registry, n, cardName))
  return partner === undefined ? [cardName] : [partner, cardName]
}

/** The drag payload — a bare card name is all the deck pane needs. */
const DRAG_MIME = 'application/x-mtg-card'

/** Deck rows group by type, in the order a decklist usually reads. */
const GROUP_ORDER = [
  'creature',
  'planeswalker',
  'instant',
  'sorcery',
  'artifact',
  'enchantment',
  'land',
] as const
type Group = (typeof GROUP_ORDER)[number] | 'other'

function groupOf(def: CardDefinition | undefined): Group {
  if (def === undefined) return 'other'
  for (const g of GROUP_ORDER) if (def.types.includes(g)) return g
  return 'other'
}

/**
 * A deck, laid out by type with its legality, and — given `onChange` — the
 * card pool beside it to build from. Without `onChange` it is read-only: a
 * starter deck, shown the way a saved deck is but with no pool, no edit
 * buttons, no drag target and no right-click menu; "Duplicate to edit" is how
 * one is changed. `intro` goes under the legality line (a starter's
 * description and stand-ins), and `standIns` marks those rows.
 */
export function DeckEditor({
  deck,
  isActive,
  onChange,
  onMakeActive,
  onDuplicate,
  onDelete,
  intro,
  standIns,
}: {
  readonly deck: SavedDeck
  readonly isActive: boolean
  readonly onChange?: (next: SavedDeck) => void
  readonly onMakeActive: () => void
  readonly onDuplicate: () => void
  readonly onDelete?: () => void
  readonly intro?: ReactNode
  readonly standIns?: ReadonlySet<string>
}) {
  const readOnly = onChange === undefined
  const change = (next: SavedDeck) => onChange?.(next)
  const [query, setQuery] = useState('')
  // Delete asks first: a deck lives only in this browser, so a misclick
  // used to lose it for good.
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  // The legality's issues, behind a toggle: listed inline they came and went
  // as cards were added, moving everything under them (the jitter sweep).
  const [showIssues, setShowIssues] = useState(false)
  const [typeFilter, setTypeFilter] = useState<string | null>(null)
  // The pool kept to the commander's colour identity (rule 903.4) while the
  // deck has one: a Temur deck was offered white cards first, none of which
  // it can play.
  const [inIdentityOnly, setInIdentityOnly] = useState(true)
  const [name, setName] = useState(deck.name)
  const [hover, setHover] = useState<HoverTarget | null>(null)
  const [dropActive, setDropActive] = useState(false)
  const [menu, setMenu] = useState<MenuAnchor | null>(null)
  /** Which card's printing picker is open, by name. */
  const [picking, setPicking] = useState<string | null>(null)
  /** The card whose stand-ins are being looked up (`ReplacementPicker`). */
  const [replacing, setReplacing] = useState<string | null>(null)

  const counts = useMemo(() => {
    const m = new Map<string, number>()
    for (const c of deck.cards) m.set(c, (m.get(c) ?? 0) + 1)
    return m
  }, [deck.cards])

  /** Rows of the pool list shown at once. Larger than the library's page
   * because a row here is text rather than a card image, so it costs far less
   * per entry — but the list still can't render a pool heading for thousands
   * of cards all at once. */
  const POOL_PAGE_SIZE = 100

  /** The commanders' combined colour identity, or null with no commander
   * (or one the pool doesn't have) to keep the pool to. */
  const commanderIdentity = useMemo(() => {
    if (deck.commanders.length === 0) return null
    const identity = new Set<Color>()
    for (const name of deck.commanders) {
      const def = cardNamed(name)
      if (def === undefined) return null
      for (const c of identityOf(def)) identity.add(c)
    }
    return identity
  }, [deck.commanders])
  const identityFilter = inIdentityOnly ? commanderIdentity : null
  /** Whether a card may go in this deck by colour identity: within the
   * commanders', or let in by a commander's Rulebreaker. */
  const fitsIdentity = useMemo(() => {
    if (identityFilter === null) return () => true
    const rulebreakers = rulebreakersOf(deck.commanders, cardPool().registry)
    return (c: CardDefinition) =>
      withinIdentity(identityOf(c), identityFilter) ||
      (rulebreakers.length > 0 && fitsDeckIdentity(c, identityFilter, rulebreakers, cardPool().registry))
  }, [identityFilter, deck.commanders])

  /** How many cards the type and identity filters leave, whatever is typed. */
  const inFilters = useMemo(
    () =>
      buildableCards().filter(
        (c) => (!typeFilter || c.types.includes(typeFilter as CardDefinition['types'][number])) && fitsIdentity(c),
      ).length,
    [typeFilter, fitsIdentity],
  )

  const filtered = useMemo(() => {
    // Every word, in any order, as the library's search reads it.
    const terms = searchTerms(query)
    return buildableCards().filter((c) => {
      if (typeFilter && !c.types.includes(typeFilter as CardDefinition['types'][number])) return false
      if (!fitsIdentity(c)) return false
      return terms.length === 0 || matchesTerms(searchTextOf(c), terms)
    })
  }, [query, typeFilter, fitsIdentity])

  const [poolPage, setPoolPage] = useState(0)
  const poolPageCount = Math.max(1, Math.ceil(filtered.length / POOL_PAGE_SIZE))
  // Reset to the first page during render whenever the search changes — see
  // the same pattern (and why it isn't an effect) in `LibraryPage`.
  const poolKey = `${query}|${typeFilter ?? ''}|${identityFilter === null ? '' : identityString(identityFilter)}`
  const [pagedFor, setPagedFor] = useState(poolKey)
  if (pagedFor !== poolKey) {
    setPagedFor(poolKey)
    setPoolPage(0)
  }
  const poolPageSafe = Math.min(poolPage, poolPageCount - 1)
  const poolRows = useMemo(
    () => filtered.slice(poolPageSafe * POOL_PAGE_SIZE, (poolPageSafe + 1) * POOL_PAGE_SIZE),
    [filtered, poolPageSafe],
  )

  /** The deck's own contents, grouped and alphabetised — plus any name the
   * registry doesn't have, which is what a deck saved before a card was
   * renamed or dropped looks like. The server refuses such a deck outright,
   * so it has to be visible and removable here. */
  const deckRows = useMemo(() => {
    const groups = new Map<Group, { name: string; n: number; def: CardDefinition | undefined }[]>()
    for (const [cardName, n] of [...counts].sort((a, b) => a[0].localeCompare(b[0]))) {
      const def = cardNamed(cardName)
      const g = def === undefined ? 'other' : groupOf(def)
      const row = { name: cardName, n, def }
      const existing = groups.get(g)
      if (existing) existing.push(row)
      else groups.set(g, [row])
    }
    return GROUP_ORDER.concat('other' as never)
      .map((g) => ({ group: g as Group, rows: groups.get(g as Group) ?? [] }))
      .filter((s) => s.rows.length > 0)
  }, [counts])

  const unknownNames = useMemo(() => {
    const names = new Set<string>()
    for (const c of deck.cards) if (cardNamed(c) === undefined) names.add(c)
    for (const c of deck.commanders) if (cardNamed(c) === undefined) names.add(c)
    return [...names]
  }, [deck.cards, deck.commanders])

  const totalCount = deck.cards.length + deck.commanders.length

  const attractions = useMemo(() => deck.attractions ?? [], [deck.attractions])

  const legality = useMemo(() => {
    const result = validateCommanderDeck(
      { commanders: deck.commanders, cards: deck.cards, size: DECK_SIZE },
      cardPool().registry,
    )
    // The Attraction deck's own rules (717.2a) beside the 99's.
    const attractionIssues = attractionDeckProblems(attractions.map(attractionName), cardPool().registry)
    return attractionIssues.length === 0
      ? result
      : { ...result, legal: false, violations: [...result.violations, ...attractionIssues] }
  }, [deck.commanders, deck.cards, attractions])

  // The Attraction deck (rule 717.2): only Attractions, which never go in the
  // 99, so an Attraction card's "add" puts it here.
  const withAttractions = (next: readonly AttractionEntry[]): SavedDeck => ({
    ...deck,
    attractions: next.length === 0 ? undefined : next,
  })
  const addAttraction = (cardName: string) => change(withAttractions([...attractions, cardName]))
  const removeAttraction = (index: number) => change(withAttractions(attractions.filter((_, i) => i !== index)))
  const setAttractionPrinting = (index: number, collector: string | null) =>
    change(
      withAttractions(
        attractions.map((entry, i) => {
          if (i !== index) return entry
          const name = attractionName(entry)
          return collector === null ? name : { name, collector }
        }),
      ),
    )
  const attractionCounts = useMemo(() => {
    const n = new Map<string, number>()
    for (const entry of attractions) n.set(attractionName(entry), (n.get(attractionName(entry)) ?? 0) + 1)
    return n
  }, [attractions])

  const addCard = (cardName: string) =>
    isAttraction(cardNamed(cardName)) ? addAttraction(cardName) : change({ ...deck, cards: [...deck.cards, cardName] })
  const removeCard = (cardName: string) => {
    const i = deck.cards.indexOf(cardName)
    if (i === -1) return
    change({ ...deck, cards: [...deck.cards.slice(0, i), ...deck.cards.slice(i + 1)] })
  }
  const removeAll = (cardName: string) =>
    change({ ...deck, cards: deck.cards.filter((c) => c !== cardName) })

  // The sideboard (rule 100.4): up to fifteen cards outside the game, for a
  // wish or learn to bring in, or a companion to reveal (103.2b). A Commander
  // deck brings only companions (903.5e, 702.139d).
  const sideboard = deck.sideboard ?? []
  const sideboardOpen = sideboard.length < MAX_SIDEBOARD
  const belongsInSideboard = (def: CardDefinition | undefined): boolean =>
    deck.commanders.length === 0 || (def?.companion ?? null) !== null
  const withSideboard = (next: readonly string[], cards = deck.cards): SavedDeck => ({
    ...deck,
    cards,
    sideboard: next.length === 0 ? undefined : next,
  })
  const withoutOne = (list: readonly string[], cardName: string): readonly string[] | null => {
    const i = list.indexOf(cardName)
    return i === -1 ? null : [...list.slice(0, i), ...list.slice(i + 1)]
  }
  const addToSideboard = (cardName: string) => {
    if (sideboardOpen) change(withSideboard([...sideboard, cardName]))
  }
  const removeFromSideboard = (cardName: string) => {
    const next = withoutOne(sideboard, cardName)
    if (next !== null) change(withSideboard(next))
  }
  const moveToSideboard = (cardName: string) => {
    const cards = withoutOne(deck.cards, cardName)
    if (cards !== null && sideboardOpen) change(withSideboard([...sideboard, cardName], cards))
  }
  const moveToDeck = (cardName: string) => {
    const next = withoutOne(sideboard, cardName)
    if (next !== null) change(withSideboard(next, [...deck.cards, cardName]))
  }
  const sideboardRows = useMemo(() => {
    const n = new Map<string, number>()
    for (const name of deck.sideboard ?? []) n.set(name, (n.get(name) ?? 0) + 1)
    return [...n.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([name, count]) => ({ name, n: count }))
  }, [deck.sideboard])
  /**
   * Move a card into the command zone, or out of it.
   *
   * Promoting a card **takes one copy out of the 99**, which is not a nicety:
   * the commander is stored beside `cards` rather than in it, so a card that is
   * both would be two copies of itself and break singleton the moment it was
   * promoted. That was reachable before this — starring a pool card already in
   * the deck did exactly that — and it becomes the common case now the button
   * sits on the deck rows themselves.
   *
   * Demoting leaves the card out of the 99, matching what "Clear commander"
   * has always done: the slot empties and you pick again. So does a
   * commander that a newly starred card replaces. See `toggledCommanders`
   * for which one that is.
   */
  const toggleCommander = (cardName: string) => {
    const commanders = toggledCommanders(deck.commanders, cardName)
    if (deck.commanders.includes(cardName)) {
      change({ ...deck, commanders })
      return
    }
    const at = deck.cards.indexOf(cardName)
    const cards = at === -1 ? deck.cards : [...deck.cards.slice(0, at), ...deck.cards.slice(at + 1)]
    change({ ...deck, commanders, cards })
  }

  /** What starring `cardName` would do, for its button's tooltip and its
   * menu item — pairing and replacing look the same until they happen. */
  const commanderAction = (cardName: string): string => {
    if (deck.commanders.includes(cardName)) return 'Clear commander'
    const next = toggledCommanders(deck.commanders, cardName)
    const replaced = deck.commanders.filter((n) => !next.includes(n))
    const replacing = replaced.length === 0 ? '' : ` (replacing ${replaced.join(' and ')})`
    return next.length === 2 ? `Pair with ${next[0]} as a second commander${replacing}` : `Make commander${replacing}`
  }

  /** Records (or clears) which printing this deck brings for one card.
   * `null` drops the entry entirely rather than storing a sentinel, so a
   * deck that never leaves a default carries no `printings` at all. */
  const setPrinting = (cardName: string, id: string | null) => {
    const next = { ...deck.printings }
    if (id === null) delete next[cardName]
    else next[cardName] = id
    change({
      ...deck,
      printings: Object.keys(next).length === 0 ? undefined : next,
    })
  }

  /** Spread onto a whole card *row*, not just its name: the row is the drag
   * handle and the click target, so that's the area a preview should follow
   * — catching the pointer only over the text made it feel broken anywhere
   * else along the row. */
  const hoverProps = (def: CardDefinition | undefined, lights?: readonly number[] | null) => {
    if (def === undefined) return {}
    // The preview shows the printing this deck brings, not the pool's own
    // art — otherwise picking one gave no feedback anywhere in the builder.
    // Below the pool list's top: a row near it put the preview over the
    // search box and the filters (2026-11-02).
    const at = (e: MouseEvent): HoverTarget => {
      const list = (e.currentTarget as HTMLElement).closest('.db-card-list')
      return {
        def,
        x: e.clientX,
        y: e.clientY,
        art: deck.printings?.[def.name] ?? null,
        ...(lights !== undefined ? { lights } : {}),
        ...(list !== null ? { clearAbove: list.getBoundingClientRect().top } : {}),
      }
    }
    return {
      onMouseEnter: (e: MouseEvent) => setHover(at(e)),
      onMouseMove: (e: MouseEvent) => setHover(at(e)),
      onMouseLeave: () => setHover(null),
    }
  }

  /**
   * Right-click on a card row. `extra` is whatever that row's own buttons
   * do, so the menu is a superset of what's already visible rather than a
   * second, different vocabulary — "Change printing…" is the one thing it
   * offers that has nowhere else to live.
   */
  const menuProps = (def: CardDefinition | undefined, extra: readonly MenuItem[]) =>
    def === undefined || readOnly
      ? {}
      : {
          onContextMenu: (e: MouseEvent) => {
            e.preventDefault()
            setHover(null)
            setMenu({
              x: e.clientX,
              y: e.clientY,
              title: def.name,
              items: [
                { label: 'Change printing…', onSelect: () => setPicking(def.name) },
                // The import's card replacer, asked about this one card: only
                // for a card the deck has.
                ...(deck.cards.includes(def.name) || deck.commanders.includes(def.name)
                  ? [{ label: 'Suggest a replacement…', onSelect: () => setReplacing(def.name) }]
                  : []),
                ...extra.map((item, i) => (i === 0 ? { ...item, separated: true } : item)),
              ],
            })
          },
        }

  // Stable, because `CardContextMenu` registers it as a window listener.
  const closeMenu = useCallback(() => setMenu(null), [])
  const pickingDef = picking === null ? null : (cardNamed(picking) ?? null)

  const onDrop = (e: DragEvent) => {
    if (readOnly) return
    e.preventDefault()
    setDropActive(false)
    const dropped = e.dataTransfer.getData(DRAG_MIME)
    if (dropped && cardNamed(dropped) !== undefined) addCard(dropped)
  }

  return (
    <div className="db-editor">
      <div className="db-editor-head" data-tour="db-editor">
        {readOnly ? (
          <h2>{deck.name}</h2>
        ) : (
          <input
            className="db-name-input"
            // As wide as its name, so a long one ("Imported: Atraxa,
            // Praetors' Voice") isn't cut off at an input's default width.
            size={Math.max(12, name.length + 1)}
            title={name}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => {
              if (name.trim() && name !== deck.name) change({ ...deck, name: name.trim() })
            }}
          />
        )}
        {readOnly ? (
          <div className="db-editor-actions">
            <button type="button" data-tour="db-make-active" onClick={onMakeActive} disabled={isActive}>
              <StableLabel widest={['Make active']}>{isActive ? 'Active' : 'Make active'}</StableLabel>
            </button>
            <button type="button" onClick={onDuplicate}>
              Duplicate to edit
            </button>
          </div>
        ) : (
          // The buttons and the delete confirm share one cell, the hidden one
          // keeping its room, so asking to delete doesn't change the row.
          <div className="db-actions-slot">
            <div className="db-editor-actions db-delete-confirm" role={confirmingDelete ? 'alert' : undefined} hidden={!confirmingDelete}>
              {/* Short, so the confirm is no wider than the buttons it shares
                  a cell with and the head row doesn't wrap for it. */}
              <span>Delete this deck?</span>
              <button type="button" className="db-danger" title="It can't be undone." onClick={() => onDelete?.()}>
                Delete
              </button>
              {confirmingDelete ? (
                // Keyed apart from the idle one, so it mounts — and takes the
                // focus — as the confirm opens.
                <button key="cancel" type="button" onClick={() => setConfirmingDelete(false)} autoFocus>
                  Cancel
                </button>
              ) : (
                <button key="cancel-idle" type="button" tabIndex={-1}>
                  Cancel
                </button>
              )}
            </div>
            <div className="db-editor-actions" hidden={confirmingDelete}>
              <button type="button" data-tour="db-make-active" onClick={onMakeActive} disabled={isActive}>
                <StableLabel widest={['Make active']}>{isActive ? 'Active' : 'Make active'}</StableLabel>
              </button>
              <button type="button" onClick={onDuplicate}>
                Duplicate
              </button>
              <button type="button" onClick={() => setConfirmingDelete(true)}>
                Delete…
              </button>
            </div>
          </div>
        )}
      </div>

      <div
        className={`db-legality ${!legality.legal ? 'illegal' : legality.banned.length > 0 ? 'banned' : 'legal'}`}
      >
        <div className="db-legality-line">
          <strong>
            {!legality.legal
              ? `✗ ${legality.violations.length} ${legality.violations.length === 1 ? 'issue' : 'issues'}`
              : legality.banned.length > 0
                ? `✓ Playable — ${legality.banned.length} banned in Commander`
                : '✓ Commander-legal'}
          </strong>
          <span className="muted"> · identity: {legality.identity || 'colourless'}</span>
          {legality.violations.length > 0 ? (
            <button type="button" className="link-button db-issues-toggle" aria-expanded={showIssues} onClick={() => setShowIssues((s) => !s)}>
              <StableLabel widest={['Show issues', 'Hide issues']}>{showIssues ? 'Hide issues' : 'Show issues'}</StableLabel>
            </button>
          ) : null}
        </div>
        {legality.legal && legality.banned.length > 0 ? (
          // Banned cards are in the pool for casual play (the user's call,
          // 2026-10-11): any room takes the deck but one set to Commander-
          // legal decks only.
          <p className="db-banned muted">
            {legality.banned.join(', ')} — banned in Commander. A room set to Commander-legal decks only
            refuses this deck.
          </p>
        ) : null}
        {showIssues && legality.violations.length > 0 ? (
          <ul className="db-issues">
            {legality.violations.map((v, i) => (
              <li key={i}>{v}</li>
            ))}
          </ul>
        ) : null}
      </div>

      {intro}

      {unknownNames.length > 0 && !readOnly ? (
        <div className="db-unknown">
          <strong>⚠ {unknownNames.length} card(s) this engine no longer has</strong>
          <span className="muted">
            {' '}
            — a room will refuse this deck until they're gone.
          </span>
          <ul>
            {unknownNames.map((n) => (
              <li key={n}>
                <span className="mono">{n}</span>
                <button
                  type="button"
                  onClick={() =>
                    change({
                      ...deck,
                      cards: deck.cards.filter((c) => c !== n),
                      commanders: deck.commanders.filter((c) => c !== n),
                    })
                  }
                >
                  remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className={`db-panes${readOnly ? ' read-only' : ''}`}>
        {readOnly ? null : (
        <section className="db-pane db-pane-library">
          <header className="db-pane-head">
            <h3>Card pool</h3>
            <span className="muted mono">{filtered.length}</span>
          </header>
          <div className="db-search-row">
            <input
              className="db-search"
              // The cards the filters leave, which is what a search looks
              // through: the pool's whole size beside a filtered count read
              // as two different totals.
              placeholder={`Search ${query.trim() === '' ? filtered.length : inFilters} cards…`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="db-type-filters">
            <button type="button" className={typeFilter === null ? 'selected' : undefined} onClick={() => setTypeFilter(null)}>
              all
            </button>
            {TYPE_FILTERS.map((t) => (
              <button
                key={t}
                type="button"
                className={typeFilter === t ? 'selected' : undefined}
                onClick={() => setTypeFilter(typeFilter === t ? null : t)}
              >
                {t}
              </button>
            ))}
          </div>

          {commanderIdentity !== null ? (
            <label className="db-identity-filter">
              <input
                type="checkbox"
                checked={inIdentityOnly}
                onChange={(e) => setInIdentityOnly(e.target.checked)}
              />
              Only cards in the commander's colours
              {commanderIdentity.size > 0 ? (
                <Symbols text={[...identityString(commanderIdentity)].map((c) => `{${c}}`).join('')} />
              ) : (
                <span className="muted">(colourless)</span>
              )}
            </label>
          ) : null}

          <ul className="db-card-list">
            {poolRows.map((c) => {
              // An Attraction's add and count are the Attraction deck's.
              const attraction = isAttraction(c)
              const n = attraction ? (attractionCounts.get(c.name) ?? 0) : (counts.get(c.name) ?? 0)
              const addLabel = attraction ? 'Add to Attraction deck' : 'Add to deck'
              const isThisCommander = deck.commanders.includes(c.name)
              return (
                <li
                  key={c.name}
                  className={n > 0 || isThisCommander ? 'db-in-deck' : undefined}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData(DRAG_MIME, c.name)
                    e.dataTransfer.effectAllowed = 'copy'
                    setHover(null)
                  }}
                  onDoubleClick={() => addCard(c.name)}
                  {...hoverProps(c)}
                  {...menuProps(c, [
                    {
                      label: addLabel,
                      onSelect: () => addCard(c.name),
                      disabled: isThisCommander,
                    },
                    ...(canCommandAlone(c)
                      ? [
                          {
                            label: commanderAction(c.name),
                            onSelect: () => toggleCommander(c.name),
                          },
                        ]
                      : []),
                    ...(n > 0
                      ? [
                          {
                            label: 'Remove one',
                            onSelect: () =>
                              attraction
                                ? removeAttraction(attractions.map(attractionName).lastIndexOf(c.name))
                                : removeCard(c.name),
                          },
                        ]
                      : []),
                    ...(!attraction && belongsInSideboard(c)
                      ? [{ label: 'Add to sideboard', onSelect: () => addToSideboard(c.name), disabled: !sideboardOpen }]
                      : []),
                  ])}
                >
                  <span className="db-card-name">{c.name}</span>
                  {deck.printings?.[c.name] ? (
                    <span className="db-printing-mark" title="Custom printing">
                      ◆
                    </span>
                  ) : null}
                  {c.manaCost ? <Symbols text={c.manaCost} /> : null}
                  <span className="db-card-row-spacer" />
                  {canCommandAlone(c) ? (
                    <button
                      type="button"
                      title={commanderAction(c.name)}
                      className={isThisCommander ? 'selected' : undefined}
                      onClick={() => toggleCommander(c.name)}
                    >
                      {isThisCommander ? '★' : '☆'}
                    </button>
                  ) : null}
                  {n > 0 ? <span className="db-count mono">×{n}</span> : null}
                  <button type="button" title={addLabel} onClick={() => addCard(c.name)} disabled={isThisCommander}>
                    +
                  </button>
                </li>
              )
            })}
          </ul>
          {poolPageCount > 1 ? (
            <nav className="db-pager" aria-label="Card pool pages">
              <button
                type="button"
                onClick={() => setPoolPage(poolPageSafe - 1)}
                disabled={poolPageSafe === 0}
                aria-label="Previous page"
                title="Previous page"
              >
                ←
              </button>
              <span className="muted mono">
                {poolPageSafe + 1}/{poolPageCount}
              </span>
              <button
                type="button"
                onClick={() => setPoolPage(poolPageSafe + 1)}
                disabled={poolPageSafe >= poolPageCount - 1}
                aria-label="Next page"
                title="Next page"
              >
                →
              </button>
            </nav>
          ) : null}
        </section>
        )}

        <section
          className={`db-pane db-pane-deck${dropActive ? ' db-drop-active' : ''}`}
          onDragOver={(e) => {
            if (readOnly || !e.dataTransfer.types.includes(DRAG_MIME)) return
            e.preventDefault()
            e.dataTransfer.dropEffect = 'copy'
            setDropActive(true)
          }}
          onDragLeave={() => setDropActive(false)}
          onDrop={onDrop}
        >
          <header className="db-pane-head">
            <h3>This deck</h3>
            <span className="mono">
              {totalCount} / {DECK_SIZE}
            </span>
          </header>

          <div className="db-commander-slots">
            {deck.commanders.map((commander) => (
              <div
                key={commander}
                className="db-commander-slot"
                {...hoverProps(cardNamed(commander))}
                {...menuProps(cardNamed(commander), [
                  { label: 'Clear commander', onSelect: () => toggleCommander(commander) },
                ])}
              >
                <span className="muted">Commander</span>
                <span className="db-card-name">{commander}</span>
                {deck.printings?.[commander] ? (
                  <span className="db-printing-mark" title="Custom printing">
                    ◆
                  </span>
                ) : null}
                <span className="db-card-row-spacer" />
                {readOnly ? null : (
                  <button type="button" title="Clear commander" onClick={() => toggleCommander(commander)}>
                    −
                  </button>
                )}
              </div>
            ))}
            {deck.commanders.length === 0 ? (
              <div className="db-commander-slot">
                <span className="muted">
                  No commander — pick a legendary creature, or another card that can command, with ☆
                </span>
              </div>
            ) : !readOnly && deck.commanders.length === 1 && hasPartner(cardPool().registry, deck.commanders[0]) ? (
              <p className="db-commander-hint muted">
                {deck.commanders[0]} has Partner — ☆ another commander with Partner to add a second.
              </p>
            ) : null}
          </div>

          {deck.cards.length === 0 ? (
            <p className="db-empty muted">
              Drag a card here from the pool, or use its <strong>+</strong> button. Double-clicking
              a card adds it too.
            </p>
          ) : (
            <ul className="db-deck-list">
              {deckRows.map(({ group, rows }) => (
                <li key={group} className="db-deck-group">
                  <div className="db-deck-group-head muted">
                    {group} · {rows.reduce((sum, r) => sum + r.n, 0)}
                  </div>
                  <ul>
                    {rows.map((row) => (
                      <li
                        key={row.name}
                        className={
                          row.def === undefined ? 'db-unknown-row' : standIns?.has(row.name) ? 'db-stand-in' : undefined
                        }
                        {...hoverProps(row.def)}
                        {...menuProps(row.def, [
                          { label: 'Add another', onSelect: () => addCard(row.name) },
                          { label: 'Remove one', onSelect: () => removeCard(row.name) },
                          { label: 'Remove all copies', onSelect: () => removeAll(row.name) },
                          ...(belongsInSideboard(row.def)
                            ? [
                                {
                                  label: 'Move one to the sideboard',
                                  onSelect: () => moveToSideboard(row.name),
                                  disabled: !sideboardOpen,
                                },
                              ]
                            : []),
                          // Promoting from here matters most right after an
                          // import: a decklist that didn't label its commander
                          // gets one guessed, and fixing that meant hunting the
                          // right card down in the pool.
                          ...(row.def !== undefined && canCommandAlone(row.def)
                            ? [
                                {
                                  label: commanderAction(row.name),
                                  onSelect: () => toggleCommander(row.name),
                                },
                              ]
                            : []),
                        ])}
                      >
                        <span className="db-count mono">{row.n}</span>
                        <span className="db-card-name">{row.name}</span>
                        {deck.printings?.[row.name] ? (
                          <span className="db-printing-mark" title="Custom printing">
                            ◆
                          </span>
                        ) : null}
                        {row.def?.manaCost ? <Symbols text={row.def.manaCost} /> : null}
                        <span className="db-card-row-spacer" />
                        {readOnly ? null : (
                          <>
                            {row.def !== undefined && canCommandAlone(row.def) ? (
                              <button
                                type="button"
                                title={commanderAction(row.name)}
                                onClick={() => toggleCommander(row.name)}
                              >
                                ☆
                              </button>
                            ) : null}
                            <button type="button" title="Remove one" onClick={() => removeCard(row.name)}>
                              −
                            </button>
                            <button type="button" title="Add another" onClick={() => addCard(row.name)}>
                              +
                            </button>
                            <button type="button" title="Remove all copies" onClick={() => removeAll(row.name)}>
                              ×
                            </button>
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}

          {deck.commanders.length > 0 && sideboard.length === 0 ? null : (
            <div className="db-sideboard" data-testid="db-sideboard">
              <div className="db-deck-group-head muted">
                Sideboard · {sideboard.length} / {MAX_SIDEBOARD}
              </div>
              {deck.commanders.length > 0 ? (
                <p className="db-commander-hint muted">
                  Commander games use no sideboard: only a card with companion comes to the table from here.
                </p>
              ) : sideboard.length === 0 ? (
                <p className="db-commander-hint muted">
                  Cards outside the game, for a wish or learn to bring in, or a companion to reveal. Right-click a card
                  to add it.
                </p>
              ) : null}
              <ul>
                {sideboardRows.map((row) => {
                  const def = cardNamed(row.name)
                  // Whether this deck could reveal it (rule 103.2b), said here
                  // because the game simply won't offer one it can't.
                  const companionUnmet =
                    (def?.companion ?? null) === null
                      ? null
                      : companionProblem(row.name, { cards: deck.cards, commanders: deck.commanders }, cardPool().registry)
                  return (
                    <li
                      key={row.name}
                      className={def === undefined ? 'db-unknown-row' : undefined}
                      {...hoverProps(def)}
                      {...menuProps(def, [
                        { label: 'Move one to the deck', onSelect: () => moveToDeck(row.name) },
                        {
                          label: 'Add another',
                          onSelect: () => addToSideboard(row.name),
                          disabled: !sideboardOpen || !belongsInSideboard(def),
                        },
                        { label: 'Remove one', onSelect: () => removeFromSideboard(row.name) },
                      ])}
                    >
                      <span className="db-count mono">{row.n}</span>
                      <span className="db-card-name">{row.name}</span>
                      {def?.manaCost ? <Symbols text={def.manaCost} /> : null}
                      {(def?.companion ?? null) !== null ? (
                        <span
                          className="db-companion-mark muted"
                          data-companion-unmet={companionUnmet !== null ? true : undefined}
                          title={
                            companionUnmet === null
                              ? 'This deck can reveal it as its companion when the game begins'
                              : `This deck can't reveal it as its companion: ${companionUnmet}`
                          }
                        >
                          {companionUnmet === null ? 'companion' : 'companion: not met'}
                        </span>
                      ) : null}
                      <span className="db-card-row-spacer" />
                      {readOnly ? null : (
                        <>
                          <button type="button" title="Move one to the deck" onClick={() => moveToDeck(row.name)}>
                            ↑
                          </button>
                          <button type="button" title="Remove one" onClick={() => removeFromSideboard(row.name)}>
                            −
                          </button>
                        </>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          )}

          {/* The Attraction deck (rule 717.2): drawn once it has a card — an
              Attraction's + in the pool puts one here. Each row picks its
              printing, which decides the numbers it lights (717.1). */}
          {attractions.length === 0 ? null : (
            <div className="db-sideboard db-attractions" data-testid="db-attractions">
              <div className="db-deck-group-head muted">Attraction deck · {attractions.length}</div>
              <p className="db-commander-hint muted">
                Attractions start in their own deck, ten or more with different names, and are opened onto the
                battlefield by other cards.
              </p>
              <ul>
                {attractions.map((entry, index) => {
                  const name = attractionName(entry)
                  const def = cardNamed(name)
                  const printings = def?.attractionLights ?? []
                  const collector = attractionCollector(entry)
                  const printing = printings.find((p) => p.collector === collector) ?? printings[0]
                  return (
                    <li
                      key={`${name}-${index}`}
                      className={def === undefined || printings.length === 0 ? 'db-unknown-row' : undefined}
                      {...hoverProps(def, printing?.lights ?? null)}
                      {...menuProps(def, [{ label: 'Remove', onSelect: () => removeAttraction(index) }])}
                    >
                      <span className="db-card-name">{name}</span>
                      <span className="db-card-row-spacer" />
                      {printing !== undefined ? <AttractionLights lights={printing.lights} inline /> : null}
                      {printings.length > 1 && !readOnly ? (
                        <select
                          className="db-attraction-printing"
                          title="Which printing: each lights different numbers"
                          value={printing?.collector ?? ''}
                          onChange={(e) =>
                            setAttractionPrinting(
                              index,
                              e.target.value === printings[0].collector ? null : e.target.value,
                            )
                          }
                        >
                          {printings.map((p) => (
                            <option key={p.collector} value={p.collector}>
                              #{p.collector}
                            </option>
                          ))}
                        </select>
                      ) : null}
                      {readOnly ? null : (
                        <button type="button" title="Remove" onClick={() => removeAttraction(index)}>
                          −
                        </button>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
        </section>
      </div>

      {/* The preview is suppressed while the menu is open: the pointer is
          still over the row that opened it, so the two otherwise overlap. */}
      <CardHoverPreview target={menu === null ? hover : null} />
      <CardContextMenu anchor={menu} onClose={closeMenu} />
      {pickingDef ? (
        <PrintingPicker
          key={pickingDef.name}
          def={pickingDef}
          current={deck.printings?.[pickingDef.name] ?? null}
          onChoose={(id) => {
            setPrinting(pickingDef.name, id)
            setPicking(null)
          }}
          onClose={() => setPicking(null)}
        />
      ) : null}
      {replacing !== null ? (
        <ReplacementPicker
          key={replacing}
          card={replacing}
          cards={deck.cards}
          commanders={deck.commanders}
          onChoose={(replacement) => {
            change(replaceCard(deck, replacing, replacement))
            setReplacing(null)
          }}
          onClose={() => setReplacing(null)}
        />
      ) : null}
    </div>
  )
}
