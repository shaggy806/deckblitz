import { describe, expect, it } from 'vitest'
import { revealGrid } from './revealLayout.ts'
import type { RevealRoom } from './revealLayout.ts'
import { REVEAL_MAX_MS, REVEAL_STEP_MS, revealHoldMs } from '../game/animationSchedule.ts'

/** The room a tray has on a screen `width` by `height`, with a full-size card
 * `full` wide: the numbers `RevealTray` measured at each of the three sizes. */
const room = (width: number, height: number, full: number, top: number): RevealRoom => ({
  width: width * 0.96,
  height: height * 0.96 - top,
  full,
  gap: 8,
  caption: 31,
  between: 12,
})
const HD = room(1920, 1080, 210, 119)
const LAPTOP = room(1366, 768, 172, 84)

/** Whether a grid's rows fit the room both ways. */
function fits(counts: readonly number[], r: RevealRoom): boolean {
  const { cols, cardW } = revealGrid(counts, r)
  const rows = counts.reduce((sum, n) => sum + Math.ceil(n / cols), 0)
  const across = cols * cardW + (cols - 1) * r.gap
  const down =
    rows * cardW * 1.4 + counts.length * r.caption + (counts.length - 1) * r.between + (rows - counts.length) * r.gap
  return across <= r.width + 0.5 && down <= r.height + 0.5
}

describe('revealGrid', () => {
  it('leaves a few cards in one row at full size', () => {
    expect(revealGrid([1], HD)).toEqual({ cols: 1, cardW: 210 })
    expect(revealGrid([5], HD)).toEqual({ cols: 5, cardW: 210 })
  })

  it('keeps ten cards in one row where they stay near full size, a little smaller', () => {
    const grid = revealGrid([10], HD)
    expect(grid.cols).toBe(10)
    // They were 210 wide and ran 2172px across a 1920px screen.
    expect(grid.cardW).toBeGreaterThan(210 * 0.8)
    expect(grid.cardW).toBeLessThan(210)
    expect(fits([10], HD)).toBe(true)
  })

  it('wraps ten cards into two even rows where one row would shrink them too far', () => {
    // 1366x768: one row is 72% of full size, so five and five at full size.
    expect(revealGrid([10], LAPTOP)).toEqual({ cols: 5, cardW: 172 })
    expect(fits([10], LAPTOP)).toBe(true)
  })

  it('fits a whole library, however small the cards get', () => {
    for (const count of [16, 25, 40, 60, 99]) {
      expect(fits([count], HD)).toBe(true)
      expect(fits([count], LAPTOP)).toBe(true)
      expect(revealGrid([count], LAPTOP).cardW).toBeGreaterThan(0)
    }
  })

  it('fits several reveals showing at once, one under another at one size', () => {
    expect(fits([10, 1], HD)).toBe(true)
    expect(fits([10, 10], LAPTOP)).toBe(true)
    expect(fits([1, 1, 1, 1], LAPTOP)).toBe(true)
    // Four single cards can't sit four deep at full size on a short screen.
    expect(revealGrid([1, 1, 1, 1], LAPTOP).cardW).toBeLessThan(172)
  })
})

describe('revealHoldMs', () => {
  it("holds one card as long as it always was, and longer for each card past it, up to a ceiling", () => {
    expect(revealHoldMs(1)).toBe(REVEAL_STEP_MS)
    expect(revealHoldMs(0)).toBe(REVEAL_STEP_MS)
    expect(revealHoldMs(2)).toBeGreaterThan(revealHoldMs(1))
    // Ten cards: 7.1 s before the viewer's speed, where they had 2.6 s.
    expect(revealHoldMs(10)).toBe(7100)
    expect(revealHoldMs(16)).toBe(REVEAL_MAX_MS)
    expect(revealHoldMs(99)).toBe(REVEAL_MAX_MS)
  })
})
