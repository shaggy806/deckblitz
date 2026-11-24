import { describe, expect, it } from 'vitest'
import { BLITZ_PARAM, BLITZ_POOL_PARAM, blitzReady, blitzUrl } from './blitzDeck.ts'
import { BOT_DECK_POOLS, poolLabel } from './randomBotDeck.ts'

const hundred = { commanders: ['Atraxa, Praetors\' Voice'], cards: Array.from({ length: 99 }, (_, i) => `Card ${i}`), name: 'Mine' }

describe('blitzReady', () => {
  it('starts a full deck with nothing to report', () => {
    const ready = blitzReady(hundred, 'saved')
    expect('report' in ready && ready.report).toEqual({ deckName: 'Mine', substituted: [], dropped: [] })
  })

  it('plays a short deck, and says how short', () => {
    const ready = blitzReady({ ...hundred, cards: hundred.cards.slice(0, 59) }, 'saved')
    expect('report' in ready && ready.report.short).toBe(60)
  })

  it('carries what the import changed', () => {
    const ready = blitzReady(hundred, 'list', { substituted: [{ from: 'A', to: 'B' }], dropped: ['C'] })
    expect('report' in ready && ready.report).toMatchObject({ substituted: [{ from: 'A', to: 'B' }], dropped: ['C'] })
  })

  it('refuses a deck with no commander, worded for where it came from', () => {
    const list = blitzReady({ ...hundred, commanders: [] }, 'list')
    const saved = blitzReady({ ...hundred, commanders: [] }, 'saved')
    expect('problem' in list && list.problem).toMatch(/Commander" heading/)
    expect('problem' in saved && saved.problem).toMatch(/no commander/)
  })

  it('refuses a deck of only a commander', () => {
    expect('problem' in blitzReady({ ...hundred, cards: [] }, 'saved')).toBe(true)
  })

  it('refuses a card the pool no longer has, by name, where the pool is at hand', () => {
    const ready = blitzReady(hundred, 'saved', undefined, (name) => name !== 'Card 3')
    expect('problem' in ready && ready.problem).toMatch(/A card this engine no longer has \(Card 3\)/)
    // Without the pool, the room is left to refuse it.
    expect('report' in blitzReady(hundred, 'saved')).toBe(true)
  })
})

describe('blitzUrl', () => {
  it('names the deck, and the pool only when it is not the default', () => {
    expect(new URL(blitzUrl('saved:abc'), 'http://x').searchParams.get(BLITZ_PARAM)).toBe('saved:abc')
    expect(new URL(blitzUrl('saved:abc'), 'http://x').searchParams.has(BLITZ_POOL_PARAM)).toBe(false)
    expect(new URL(blitzUrl('starter:2', 'strong'), 'http://x').searchParams.get(BLITZ_POOL_PARAM)).toBe('strong')
  })
})

describe('bracket names', () => {
  it('calls the pools Brackets 2, 3 and 4, and still says where each deals from', () => {
    expect(['precon', 'upgraded', 'strong'].map((p) => poolLabel(p as never))).toEqual(['Bracket 2', 'Bracket 3', 'Bracket 4'])
    expect(BOT_DECK_POOLS.map((p) => p.hint)).toEqual([
      expect.stringMatching(/precon as printed/),
      expect.stringMatching(/upgraded precon/),
      expect.stringMatching(/real player's deck/),
    ])
  })
})
