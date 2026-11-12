import { describe, expect, it } from 'vitest'
import { endedOnItsOwn } from './turnPassedNotice.ts'

describe('endedOnItsOwn', () => {
  it('is a turn of mine I passed nothing by hand in', () => {
    expect(endedOnItsOwn({ number: 3, mine: true, passesAtStart: 4 }, 4)).toBe(true)
  })

  it("isn't one I passed in myself", () => {
    expect(endedOnItsOwn({ number: 3, mine: true, passesAtStart: 4 }, 5)).toBe(false)
  })

  it("isn't another player's turn, or the opening hands", () => {
    expect(endedOnItsOwn({ number: 2, mine: false, passesAtStart: 4 }, 4)).toBe(false)
    expect(endedOnItsOwn({ number: 0, mine: true, passesAtStart: 0 }, 0)).toBe(false)
  })
})
