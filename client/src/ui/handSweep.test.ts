import { describe, expect, it } from 'vitest'
import { sweepRuns } from './handSweep.ts'

/** A row of cards 50px wide from x = 0, between y = 0 and 100; "a", "b", … */
const row = (x: number, y: number): string | null =>
  x < 0 || y < 0 || y > 100 || x >= 250 ? null : String.fromCharCode(97 + Math.floor(x / 50))

describe('sweepRuns', () => {
  it('finds every card a jump between two move events crossed, in order', () => {
    const runs = sweepRuns(
      [
        { x: 10, y: 50, t: 0 },
        { x: 240, y: 50, t: 23 },
      ],
      row,
    )
    expect(runs.map((r) => r.key)).toEqual(['a', 'b', 'c', 'd', 'e'])
  })

  it('times each run by where along the jump the pointer was over it', () => {
    const runs = sweepRuns(
      [
        { x: 0, y: 50, t: 100 },
        { x: 200, y: 50, t: 120 },
      ],
      row,
    )
    // 10px a ms: "b" from x 50 to 100.
    const b = runs.find((r) => r.key === 'b')
    expect(b?.enter).toBeCloseTo(105, 0)
    expect(b?.leave).toBeCloseTo(110, 0)
    // The path ends on "e", which it never leaves.
    expect(runs.at(-1)).toEqual({ key: 'e', enter: 120, leave: 120 })
  })

  it('follows the coalesced points rather than a straight line between the ends', () => {
    // Out over "c" and back: the ends alone would cross only "a" and "b".
    const runs = sweepRuns(
      [
        { x: 10, y: 50, t: 0 },
        { x: 120, y: 50, t: 8 },
        { x: 60, y: 50, t: 16 },
      ],
      row,
    )
    expect(runs.map((r) => r.key)).toEqual(['a', 'b', 'c', 'b'])
  })

  it('ends a run where the path leaves the row', () => {
    const runs = sweepRuns(
      [
        { x: 20, y: 50, t: 0 },
        { x: 20, y: 200, t: 15 },
        { x: 120, y: 200, t: 30 },
        { x: 120, y: 50, t: 45 },
      ],
      row,
    )
    expect(runs.map((r) => r.key)).toEqual(['a', 'c'])
  })

  it('caps the hit tests on a long jump', () => {
    let tests = 0
    sweepRuns(
      [
        { x: 0, y: 50, t: 0 },
        { x: 100000, y: 50, t: 16 },
      ],
      (x, y) => {
        tests += 1
        return row(x, y)
      },
    )
    expect(tests).toBeLessThanOrEqual(161)
  })
})
