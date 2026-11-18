import { afterEach, describe, expect, it, vi } from 'vitest'

/** A stand-in canvas: every character half an em wide. */
function stubCanvas() {
  const measureText = vi.fn((text: string) => ({ width: text.length * 100 }))
  const ctx = { font: '', measureText }
  vi.stubGlobal(
    'OffscreenCanvas',
    class {
      getContext() {
        return ctx
      }
    },
  )
  return { ctx, measureText }
}

function stubStyle(letterSpacing = 'normal') {
  const read = vi.fn(() => ({
    fontStyle: 'normal',
    fontWeight: '600',
    fontFamily: 'Barlow, sans-serif',
    fontSize: '10px',
    letterSpacing,
  }))
  vi.stubGlobal('getComputedStyle', read)
  return read
}

const el = {} as Element

afterEach(() => {
  vi.unstubAllGlobals()
  vi.resetModules()
})

describe('textEmWidth', () => {
  it("is the text's width over the font size, a hair over", async () => {
    const { ctx } = stubCanvas()
    stubStyle()
    const { textEmWidth } = await import('./textWidth.ts')
    // 10 characters at half an em each, and the 1.5% a pixel's rounding gets.
    expect(textEmWidth('0123456789', 'label', el)).toBeCloseTo(5 * 1.015, 6)
    expect(ctx.font).toBe('normal 600 200px Barlow, sans-serif')
  })

  it('counts letter spacing, which a canvas does not', async () => {
    stubCanvas()
    stubStyle('1px')
    const { textEmWidth } = await import('./textWidth.ts')
    // 1px at a 10px font is a tenth of an em a character.
    expect(textEmWidth('0123456789', 'label', el)).toBeCloseTo((5 + 1) * 1.015, 6)
  })

  it('measures a text once and reads the face once a kind', async () => {
    const { measureText } = stubCanvas()
    const read = stubStyle()
    const { textEmWidth } = await import('./textWidth.ts')
    textEmWidth('General Traag', 'board-name', el)
    textEmWidth('General Traag', 'board-name', el)
    textEmWidth('Slobad', 'board-name', el)
    expect(measureText).toHaveBeenCalledTimes(2)
    expect(read).toHaveBeenCalledTimes(1)
    textEmWidth('General Traag', 'art-credit', el)
    expect(measureText).toHaveBeenCalledTimes(3)
    expect(read).toHaveBeenCalledTimes(2)
  })

  it('is null with no canvas to measure on, and for no text', async () => {
    stubStyle()
    const { textEmWidth } = await import('./textWidth.ts')
    expect(textEmWidth('General Traag', 'label', el)).toBeNull()
    vi.resetModules()
    stubCanvas()
    const again = await import('./textWidth.ts')
    expect(again.textEmWidth('', 'label', el)).toBeNull()
  })
})
