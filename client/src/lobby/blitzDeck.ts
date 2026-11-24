import type { WireDeck } from 'protocol'
import type { BlitzReport } from '../net/useNetworkGame.ts'
import type { BotDeckPool } from './randomBotDeck.ts'

/** A Commander deck's size, commander included (rule 903.5a). */
export const COMMANDER_DECK_SIZE = 100

/** The pool a blitz deals its three bots from when nothing says otherwise:
 * Bracket 3, the upgraded precons, the bots at their best. */
export const DEFAULT_BLITZ_POOL: BotDeckPool = 'upgraded'

/** What a blitz is told about the deck beside it, or why it can't start. */
export type BlitzReady = { readonly deck: WireDeck; readonly report: BlitzReport } | { readonly problem: string }

/**
 * Whether `deck` can be blitzed, and what to tell the player over its game
 * — the one check every way into a blitz makes: a list pasted on the landing
 * page (`BlitzPanel`, after the import has swapped or dropped what the
 * engine lacks: `changes`) and a deck the deck builder's Blitz button starts
 * (`DeckBuilderPage`). A deck needs a commander and at least one other card;
 * a deck short of 100 plays, and says so (`report.short`), as a pasted list
 * always has. `known`, where the card pool is at hand (the deck builder),
 * refuses a card the engine doesn't have — a saved deck outlives a card the
 * pool renames or drops, and a room refuses such a deck. `source` picks the
 * wording: a pasted list is fixed in the list, a saved deck in the builder.
 */
export function blitzReady(
  deck: WireDeck,
  source: 'list' | 'saved',
  changes: Pick<BlitzReport, 'substituted' | 'dropped'> = { substituted: [], dropped: [] },
  known?: (name: string) => boolean,
): BlitzReady {
  const commanders = deck.commanders ?? []
  if (commanders.length === 0) {
    return {
      problem:
        source === 'list'
          ? 'No commander found in that list. Put it under a "Commander" heading, or on its own at the end.'
          : 'This deck has no commander yet. Choose one in the deck first.',
    }
  }
  if (deck.cards.length === 0) {
    return {
      problem: source === 'list' ? 'None of the cards in that list could be played.' : 'This deck has no cards besides its commander.',
    }
  }
  if (known !== undefined) {
    const missing = [...new Set([...commanders, ...deck.cards])].filter((name) => !known(name))
    if (missing.length > 0) {
      const shown = missing.slice(0, 3).join(', ')
      const rest = missing.length > 3 ? ` and ${missing.length - 3} more` : ''
      return {
        problem: `${missing.length === 1 ? 'A card' : `${missing.length} cards`} this engine no longer has (${shown}${rest}): remove ${missing.length === 1 ? 'it' : 'them'} from the deck first.`,
      }
    }
  }
  const size = deck.cards.length + commanders.length
  return {
    deck,
    report: {
      deckName: deck.name ?? 'Your deck',
      substituted: changes.substituted.map(({ from, to }) => ({ from, to })),
      dropped: changes.dropped,
      ...(size < COMMANDER_DECK_SIZE ? { short: size } : {}),
    },
  }
}

/** The URL parameter that blitzes a deck as the game's page loads: the deck
 * builder's Blitz button, which is a page of its own with no room server. Its
 * value is the deck's key among `listPickableDecks` (`saved:<id>`,
 * `starter:<index>`); `BLITZ_POOL_PARAM` beside it says which bots. */
export const BLITZ_PARAM = 'blitz'
export const BLITZ_POOL_PARAM = 'against'

/** The page that blitzes the deck with key `key` as it loads. */
export function blitzUrl(key: string, pool: BotDeckPool = DEFAULT_BLITZ_POOL): string {
  const params = new URLSearchParams({ [BLITZ_PARAM]: key })
  if (pool !== DEFAULT_BLITZ_POOL) params.set(BLITZ_POOL_PARAM, pool)
  return `/?${params.toString()}`
}
