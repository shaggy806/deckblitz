import { describe, expect, it } from 'vitest'
import { touchScale } from './touch.ts'

describe('touchScale', () => {
  it('is 1 where the page is as wide as the screen', () => {
    expect(
      touchScale({ innerWidth: 412, outerWidth: 412, screenWidth: 412, screenHeight: 915, landscape: false }),
    ).toBe(1)
  })

  it('is the page over the screen for a desktop page shrunk onto a phone', () => {
    expect(
      touchScale({ innerWidth: 980, outerWidth: 412, screenWidth: 412, screenHeight: 915, landscape: false }),
    ).toBe(2.38)
  })

  it('reads the long side of a screen that reports itself upright while on its side', () => {
    // Safari: `screen.width` stays the upright width.
    expect(
      touchScale({ innerWidth: 844, outerWidth: 0, screenWidth: 390, screenHeight: 844, landscape: true }),
    ).toBe(1)
    // Chrome: it is the width as held.
    expect(
      touchScale({ innerWidth: 915, outerWidth: 915, screenWidth: 915, screenHeight: 412, landscape: true }),
    ).toBe(1)
  })

  it('goes by the window where it is narrower than the screen', () => {
    // Half of a tablet's screen, the page as wide as that half.
    expect(
      touchScale({ innerWidth: 512, outerWidth: 512, screenWidth: 1024, screenHeight: 768, landscape: false }),
    ).toBe(1)
  })

  it('never shrinks a control, nor trusts a screen size that makes no sense', () => {
    expect(
      touchScale({ innerWidth: 400, outerWidth: 0, screenWidth: 1024, screenHeight: 768, landscape: true }),
    ).toBe(1)
    expect(touchScale({ innerWidth: 980, outerWidth: 0, screenWidth: 0, screenHeight: 0, landscape: false })).toBe(1)
    expect(
      touchScale({ innerWidth: 3000, outerWidth: 300, screenWidth: 300, screenHeight: 600, landscape: false }),
    ).toBe(4)
  })
})
