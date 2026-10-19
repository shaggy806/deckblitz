import { describe, expect, it } from 'vitest'
import { SAMPLE_DECKS, UPGRADED_DECKS } from 'engine/client'
import type { PlayerId } from 'engine/client'
import type { SeatStatus, WireDeck } from 'protocol'
import { localStart } from './localStart.ts'
import type { LobbyState } from './localStart.ts'

const seatOf = (player: string, deck: string, isBot: boolean): SeatStatus =>
  ({ player, deck: { name: deck, commanders: [] }, isBot, claimed: !isBot }) as unknown as SeatStatus

const mine: WireDeck = { name: 'My Deck', cards: ['Forest'], commanders: ['Ureni of the Unwritten'] }
const bob = SAMPLE_DECKS[0]
const carol = UPGRADED_DECKS[0]

const lobby = (over: Partial<LobbyState> = {}): LobbyState => ({
  seats: [seatOf('alice', 'My Deck', false), seatOf('bob', bob.name, true), seatOf('carol', carol.name, true)],
  seat: 'alice' as PlayerId,
  isHost: true,
  pending: true,
  spectators: 0,
  settings: { startingLife: 30, firstPlayer: 'bob' as PlayerId, commanderLegalOnly: false, botDecks: 'precon' },
  botSpeed: 'fast',
  sent: new Map([['alice' as PlayerId, mine]]),
  ...over,
})

describe('localStart', () => {
  it('moves a host seated with only bots into this browser, decks, settings and speed with it', () => {
    const verdict = localStart(lobby())
    if (!('local' in verdict)) throw new Error(verdict.server)
    expect(verdict.local.deck).toBe(mine)
    expect(verdict.local.seatIndex).toBe(0)
    // The bots' lists from the starter decks they're named after.
    expect(verdict.local.bots.map((d) => d.name)).toEqual([bob.name, carol.name])
    expect(verdict.local.bots[0].cards).toEqual(bob.cards)
    expect(verdict.local.settings?.startingLife).toBe(30)
    expect(verdict.local.botSpeed).toBe('fast')
  })

  it('keeps the host in their own seat', () => {
    const verdict = localStart(
      lobby({
        seats: [seatOf('alice', bob.name, true), seatOf('bob', 'My Deck', false)],
        seat: 'bob' as PlayerId,
        sent: new Map([['bob' as PlayerId, mine]]),
      }),
    )
    if (!('local' in verdict)) throw new Error(verdict.server)
    expect(verdict.local.seatIndex).toBe(1)
    expect(verdict.local.bots.map((d) => d.name)).toEqual([bob.name])
  })

  it('uses the list it sent for a bot over a starter of the same name', () => {
    const custom: WireDeck = { name: bob.name, cards: ['Island'], commanders: [] }
    const verdict = localStart(lobby({ sent: new Map([['alice' as PlayerId, mine], ['bob' as PlayerId, custom]]) }))
    if (!('local' in verdict)) throw new Error(verdict.server)
    expect(verdict.local.bots[0]).toBe(custom)
  })

  it('finds a deck saved here by name when this tab sent none (a reload)', () => {
    const verdict = localStart(lobby({ sent: new Map(), saved: [mine] }))
    if (!('local' in verdict)) throw new Error(verdict.server)
    expect(verdict.local.deck).toBe(mine)
  })

  it.each([
    ['another person is seated', { seats: [seatOf('alice', 'My Deck', false), seatOf('bob', bob.name, false)] }],
    ['someone is watching', { spectators: 1 }],
    ['not the host', { isHost: false }],
    ['not seated', { seat: null }],
    ['not a waiting room', { pending: false }],
    ["no list for alice's deck", { sent: new Map() }],
    ['nobody to play', { seats: [seatOf('alice', 'My Deck', false)] }],
  ] as const)('stays on the server: %s', (reason, over) => {
    expect(localStart(lobby(over as Partial<LobbyState>))).toEqual({ server: reason })
  })
})
