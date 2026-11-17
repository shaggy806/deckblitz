import { describe, expect, it } from 'vitest'
import { shiftBetween } from './tileShift.ts'

describe('shiftBetween', () => {
  it('is nothing for a tile that stayed put, a pixel of rounding included', () => {
    expect(shiftBetween({ left: 159, top: 566, width: 123 }, { left: 159, top: 566, width: 123 })).toBeNull()
    expect(shiftBetween({ left: 159, top: 566, width: 123 }, { left: 159.4, top: 567, width: 123 })).toBeNull()
  })

  it('is the way back to where the tile stood, from its top left corner', () => {
    // The Island beside a Forest stack that split: one tile to the right.
    expect(shiftBetween({ left: 159, top: 566, width: 123 }, { left: 290, top: 566, width: 123 })).toEqual({
      dx: -131,
      dy: 0,
      scale: 1,
    })
    // Wrapped onto the row above.
    expect(shiftBetween({ left: 28, top: 700, width: 123 }, { left: 1200, top: 566, width: 123 })).toEqual({
      dx: -1172,
      dy: 134,
      scale: 1,
    })
  })

  it('scales a tile whose board shrank its tiles to fit one more', () => {
    const shift = shiftBetween({ left: 28, top: 566, width: 123 }, { left: 28, top: 566, width: 100 })
    expect(shift?.dx).toBe(0)
    expect(shift?.scale).toBeCloseTo(1.23)
  })

  it('is nothing for a tile with no size to glide from or to', () => {
    expect(shiftBetween({ left: 0, top: 0, width: 0 }, { left: 50, top: 0, width: 123 })).toBeNull()
    expect(shiftBetween({ left: 0, top: 0, width: 123 }, { left: 50, top: 0, width: 0 })).toBeNull()
  })
})
