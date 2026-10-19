import { SAMPLE_DECKS, UPGRADED_DECKS } from 'engine/client'
import type { PlayerId } from 'engine/client'
import type { BotSpeed, RoomSettings, SeatStatus, WireDeck } from 'protocol'

/**
 * A game started from the lobby with nobody but bots across the table moves
 * into this browser, as a blitz does (`docs/plans/local-rooms.md`): the same
 * seats, decks and settings, rebuilt in a room in this tab's worker, and the
 * server's waiting room left. Nobody else can be shown that game, so it only
 * moves while it's yours alone: you're the host, seated, every other seat is
 * a bot, and nobody is watching the waiting room (`spectators`).
 */
export interface LocalStart {
  /** Your deck. */
  readonly deck: WireDeck
  /** Your seat's place at the table, so you keep it. */
  readonly seatIndex: number
  /** The bots' decks, in seat order without yours. */
  readonly bots: readonly WireDeck[]
  readonly settings: RoomSettings | null
  readonly botSpeed: BotSpeed
}

export interface LobbyState {
  readonly seats: readonly SeatStatus[]
  readonly seat: PlayerId | null
  readonly isHost: boolean
  readonly pending: boolean
  readonly spectators: number
  readonly settings: RoomSettings | null
  readonly botSpeed: BotSpeed
  /** The decks this client sent for each seat (`claim-seat`, `take-seat`,
   * `add-bot`, `set-bot-deck`). */
  readonly sent: ReadonlyMap<PlayerId, WireDeck>
  /** Decks this client has saved, by name — for a seat's deck it didn't
   * send this visit (a reload). */
  readonly saved?: readonly WireDeck[]
}

/** Why a game stays on the server, or the plan for moving it here. */
export type LocalStartVerdict = { readonly local: LocalStart } | { readonly server: string }

/** The game this waiting room would start, rebuilt for this browser — or
 * why it has to start on the server. */
export function localStart(lobby: LobbyState): LocalStartVerdict {
  if (!lobby.pending) return { server: 'not a waiting room' }
  if (!lobby.isHost) return { server: 'not the host' }
  if (lobby.seat === null) return { server: 'not seated' }
  if (lobby.spectators > 0) return { server: 'someone is watching' }
  const seatIndex = lobby.seats.findIndex((s) => s.player === lobby.seat)
  if (seatIndex < 0) return { server: 'not seated' }
  const others = lobby.seats.filter((_, i) => i !== seatIndex)
  if (others.length === 0) return { server: 'nobody to play' }
  if (others.some((s) => !s.isBot)) return { server: 'another person is seated' }
  const decks: WireDeck[] = []
  for (const status of lobby.seats) {
    const deck = deckFor(status, lobby)
    if (deck === null) return { server: `no list for ${status.player}'s deck` }
    decks.push(deck)
  }
  return {
    local: {
      deck: decks[seatIndex],
      seatIndex,
      bots: decks.filter((_, i) => i !== seatIndex),
      settings: lobby.settings,
      botSpeed: lobby.botSpeed,
    },
  }
}

/** The whole list behind a seat's deck: the one this client sent for it,
 * else one of the same name among the starter and upgraded decks (what the
 * server deals a seat sent none) or the decks saved here. */
function deckFor(status: SeatStatus, lobby: LobbyState): WireDeck | null {
  const name = status.deck?.name
  if (name === undefined) return null
  const sent = lobby.sent.get(status.player)
  if (sent !== undefined && (sent.name ?? null) === name) return sent
  const starter = [...SAMPLE_DECKS, ...UPGRADED_DECKS].find((d) => d.name === name)
  if (starter !== undefined) {
    return {
      cards: starter.cards,
      commanders: starter.commanders,
      name: starter.name,
      ...(starter.printings !== undefined ? { printings: starter.printings } : {}),
    }
  }
  return lobby.saved?.find((d) => d.name === name) ?? null
}
