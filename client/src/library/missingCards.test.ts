import { describe, expect, it } from 'vitest'
import { namesOfMissing, parseMissingCards } from './missingCards.ts'

const file = {
  oracle: '2026-11-06',
  cards: [
    ['Accursed Witch // Infectious Curse', 'id-1', 'Creature — Human Shaman // Enchantment — Aura Curse', 'B', 10841, 4],
    ['Fire // Ice', 'id-2', 'Instant // Instant', 'RU', 900, 4],
    ['Grizzly Bears', 'id-3', 'Creature — Bear', 'G', null, 2],
    ['Spawnbroker', 'id-4', 'Creature — Human Wizard', 'U', 12000, 3, 'When this creature enters, you may exchange control of …'],
  ],
}

describe('parseMissingCards', () => {
  it('reads each row into a card', () => {
    const cards = parseMissingCards(file, () => false)
    expect(cards).toHaveLength(4)
    expect(cards[3]).toEqual({
      name: 'Spawnbroker',
      printing: 'id-4',
      typeLine: 'Creature — Human Wizard',
      colors: 'U',
      edhrecRank: 12000,
      manaValue: 3,
      text: 'When this creature enters, you may exchange control of …',
    })
  })

  it('reads a row written before rules text was stored as having none', () => {
    expect(parseMissingCards(file, () => false)[2].text).toBe('')
  })

  it('drops a card the pool has since gained, by its name or a face of it', () => {
    const pool = new Set(['Grizzly Bears', 'Accursed Witch', 'Ice', 'Spawnbroker'])
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
