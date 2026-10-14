import { describe, expect, it } from 'vitest'
import { fitWidth } from './boardFit.ts'

/** A board whose rows fit up to `max` px tiles, counting the layouts asked. */
function board(max: number) {
  const asked: number[] = []
  return { asked, fits: (w: number) => (asked.push(w), w <= max) }
}

describe('a board fit search', () => {
  it('finds the widest width that fits, the floor when none does, the cap when all do', () => {
    expect(fitWidth(board(97).fits, 40, 300)).toBe(97)
    expect(fitWidth(board(20).fits, 40, 300)).toBe(40)
    expect(fitWidth(board(500).fits, 40, 300)).toBe(300)
    expect(fitWidth(board(40).fits, 40, 300)).toBe(40)
    expect(fitWidth(board(299).fits, 40, 300)).toBe(299)
    expect(fitWidth(board(100).fits, 40, 30)).toBe(40)
  })

  it('lands where a search from scratch would, whatever width it starts from', () => {
    for (const max of [10, 40, 41, 97, 150, 299, 300, 900]) {
      const scratch = fitWidth(board(max).fits, 40, 300)
      for (const before of [39, 40, 41, 96, 97, 98, 150, 299, 300, 301]) {
        expect(fitWidth(board(max).fits, 40, 300, before), `max ${max}, from ${before}`).toBe(scratch)
      }
    }
  })

  it('takes two layouts when the board still fits where it last settled', () => {
    const b = board(97)
    expect(fitWidth(b.fits, 40, 300, 97)).toBe(97)
    expect(b.asked).toEqual([97, 98])
    // At the cap, or crowded at the floor, one.
    const capped = board(900)
    expect(fitWidth(capped.fits, 40, 300, 300)).toBe(300)
    expect(capped.asked).toEqual([300])
    const crowded = board(10)
    expect(fitWidth(crowded.fits, 40, 300, 40)).toBe(40)
    expect(crowded.asked).toEqual([40])
    // From scratch it's about a dozen.
    const scratch = board(97)
    fitWidth(scratch.fits, 40, 300)
    expect(scratch.asked.length).toBeGreaterThan(8)
  })
})
