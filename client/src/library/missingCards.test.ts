import { describe, expect, it } from 'vitest'
import { namesOfMissing, parseMissingCards } from './missingCards.ts'

const file = {
  oracle: '2026-11-06',
  cards: [
    ['Accursed Witch // Infectious Curse', 'id-1', 'Creature — Human Shaman // Enchantment — Aura Curse', 'B', 10841, 4],
    ['Fire // Ice', 'id-2', 'Instant // Instant', 'RU', 900, 4],
    ['Grizzly Bears', 'id-3', 'Creature — Bear', 'G', null, 2],
  ],
}

describe('parseMissingCards', () => {
  it('reads each row into a card', () => {
    const cards = parseMissingCards(file, () => false)
    expect(cards).toHaveLength(3)
    expect(cards[2]).toEqual({
      name: 'Grizzly Bears',
      printing: 'id-3',
      typeLine: 'Creature — Bear',
      colors: 'G',
      edhrecRank: null,
      manaValue: 2,
    })
  })

  it('drops a card the pool has since gained, by its name or a face of it', () => {
    const pool = new Set(['Grizzly Bears', 'Accursed Witch', 'Ice'])
    expect(parseMissingCards(file, (n) => pool.has(n))).toEqual([])
  })

  it('refuses a file with no list', () => {
    expect(() => parseMissingCards({}, () => false)).toThrow()
  })
})

describe('namesOfMissing', () => {
  it("is a two-part card's own name and each face's", () => {
    expect(namesOfMissing('Fire // Ice')).toEqual(['Fire // Ice', 'Fire', 'Ice'])
    expect(namesOfMissing('Grizzly Bears')).toEqual(['Grizzly Bears'])
  })
})
