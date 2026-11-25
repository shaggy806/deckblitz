import { describe, expect, it } from 'vitest'

import { startingX } from './startingX.ts'

/** A delve offer's ranges for X from 0 up: `byMana` is the largest X mana
 * alone pays, and each X past it needs one more card. */
const delveByX = (maxX: number, byMana: number) => ({
  byX: Array.from({ length: maxX + 1 }, (_v, x) => ({ minCards: Math.max(0, x - byMana), maxCards: x })),
})

describe('startingX', () => {
  it('starts an X paid in mana at the most there is to pay', () => {
    expect(startingX({ maxX: 7 })).toBe(7)
  })

  it('starts an X paid in life at the least that does anything', () => {
    expect(startingX({ maxX: 40, paidInLife: true })).toBe(1)
    expect(startingX({ maxX: 40, minX: 3, paidInLife: true })).toBe(3)
  })

  it('starts a delve spell at the most mana alone pays, not what the graveyard buys', () => {
    // Logic Knot with five mana and 43 cards in the graveyard: X up to 46.
    expect(startingX({ maxX: 46 }, delveByX(46, 3))).toBe(3)
  })

  it('starts a delve spell at its largest X when mana pays all of it', () => {
    expect(startingX({ maxX: 4 }, delveByX(4, 4))).toBe(4)
  })

  it('starts at the least X when even that needs a card exiled', () => {
    const byX = [{ minCards: 1 }, { minCards: 2 }, { minCards: 3 }]
    expect(startingX({ maxX: 2 }, { byX })).toBe(0)
    expect(startingX({ maxX: 2, minX: 1 }, { byX })).toBe(1)
  })

  it('ignores a delve offer with no range by X', () => {
    expect(startingX({ maxX: 5 }, {})).toBe(5)
  })
})
