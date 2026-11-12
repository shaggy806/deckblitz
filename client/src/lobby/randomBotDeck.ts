import { SAMPLE_DECKS, STRONG_DECKS, UPGRADED_DECKS, botPool } from 'engine/client'
import type { SampleDeck } from 'engine/client'
import type { SeatStatus, WireDeck } from 'protocol'

/** How strong a deck a bot is dealt: a precon as printed, an upgraded
 * precon, or a real player's deck. The host picks one per bot, by which of
 * a seat's three "Add bot" buttons they press (`SeatBoard`). */
export type BotDeckPool = 'precon' | 'upgraded' | 'strong'

/** The pools in the order the lobby offers them, each with its button's
 * label and what it says on hover. */
export const BOT_DECK_POOLS: readonly { pool: BotDeckPool; label: string; hint: string }[] = [
  { pool: 'precon', label: 'Precon', hint: 'Add a bot playing a random precon, as printed' },
  { pool: 'upgraded', label: 'Upgraded', hint: 'Add a bot playing a random upgraded precon' },
  { pool: 'strong', label: 'Strong', hint: "Add a bot playing a real player's deck (credited on the About page)" },
]

/** The decks a pool deals from: the precons, the upgraded precons, or the
 * real players' decks (bots only: the deck builder doesn't offer those). */
export function botDecksOf(pool: BotDeckPool): readonly SampleDeck[] {
  // Less any deck kept from the bots because they pilot it too badly
  // (`SampleDeck.bots`: Jeskai Striker (Upgraded)).
  return botPool(pool === 'strong' ? STRONG_DECKS : pool === 'upgraded' ? UPGRADED_DECKS : SAMPLE_DECKS)
}

/**
 * The deck one of the lobby's "Add bot" buttons gives a bot: one of `from`'s
 * decks (`botDecksOf`) at random — one no other seat at the table is
 * already playing, while there is one. `random` is `Math.random`, passed in
 * for tests.
 */
export function randomBotDeck(
  seats: readonly SeatStatus[],
  random: () => number = Math.random,
  from: BotDeckPool = 'precon',
): WireDeck {
  const decks = botDecksOf(from)
  const taken = new Set(seats.flatMap((s) => (s.deck === null ? [] : [s.deck.name])))
  const free = decks.filter((d) => !taken.has(d.name))
  const pool: readonly SampleDeck[] = free.length > 0 ? free : decks
  const deck = pool[Math.min(pool.length - 1, Math.floor(random() * pool.length))]
  return {
    cards: deck.cards,
    commanders: deck.commanders,
    name: deck.name,
    // Its precon's art, as the deck builder shows the starter.
    ...(deck.printings !== undefined ? { printings: deck.printings } : {}),
  }
}

/**
 * Decks for `count` bots at once, all different from each other and from
 * `taken` (the names already at the table) while `from`'s decks last — a
 * blitz game's three opponents, picked before its room exists.
 */
export function randomBotDecks(
  count: number,
  taken: readonly string[] = [],
  random: () => number = Math.random,
  from: BotDeckPool = 'precon',
): WireDeck[] {
  const picked: WireDeck[] = []
  for (let i = 0; i < count; i += 1) {
    const names = [...taken, ...picked.map((d) => d.name ?? '')]
    const seats = names.map((name) => ({ deck: { name, commanders: [] } }) as unknown as SeatStatus)
    picked.push(randomBotDeck(seats, random, from))
  }
  return picked
}
