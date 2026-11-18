import { useSyncExternalStore } from 'react'

/**
 * How wide a line of text is, in ems of the font it's set in — what a
 * one-line label needs to size its font to its box in CSS alone:
 * `font-size: min(<its usual size>, calc(100cqw / var(--em)))` inside a size
 * container fills the container's width exactly, at any card size, with
 * nothing to measure again when the card grows or the window changes.
 *
 * Measured on a canvas, not in the page: a hand card's art credit isn't drawn
 * until the card is hovered, a board may hold a hundred tiles, and a canvas
 * reads no layout. Cached by font and text.
 */

const cache = new Map<string, number>()
let context: OffscreenCanvasRenderingContext2D | null | undefined

function canvas(): OffscreenCanvasRenderingContext2D | null {
  if (context === undefined) {
    // No canvas (a test's DOM, a very old browser): the caller's CSS keeps
    // its own estimate.
    context = typeof OffscreenCanvas === 'undefined' ? null : new OffscreenCanvas(1, 1).getContext('2d')
  }
  return context
}

/** The size the text is measured at: large, so rounding is a small part. */
const PROBE_PX = 200

/* The face each kind of label is set in, read from the first of its kind:
   every board tile's name strip is one face and weight, and reading a
   computed style inside a size container can force a layout — once a kind,
   not once a tile. */
const fonts = new Map<string, { readonly font: string; readonly spacingEm: number }>()

function fontOf(kind: string, el: Element): { readonly font: string; readonly spacingEm: number } {
  let known = fonts.get(kind)
  if (known === undefined) {
    const cs = getComputedStyle(el)
    const size = parseFloat(cs.fontSize)
    const spacing = parseFloat(cs.letterSpacing)
    known = {
      font: `${cs.fontStyle} ${cs.fontWeight} ${PROBE_PX}px ${cs.fontFamily}`,
      spacingEm: Number.isFinite(spacing) && size > 0 ? spacing / size : 0,
    }
    fonts.set(kind, known)
  }
  return known
}

/**
 * `text`'s width over its font size, or null where it can't be measured.
 * `kind` names the label (a board tile's name, an art credit), all of one
 * face: `el`, one of them, says which. A hair over the truth (1.5%), so a
 * font sized by it never ends the line in an ellipsis for a pixel's rounding.
 */
export function textEmWidth(text: string, kind: string, el: Element): number | null {
  const ctx = canvas()
  if (ctx === null || text === '') return null
  const { font, spacingEm } = fontOf(kind, el)
  const key = `${kind}|${text}`
  const known = cache.get(key)
  if (known !== undefined) return known
  ctx.font = font
  const em = (ctx.measureText(text).width / PROBE_PX + spacingEm * text.length) * 1.015
  cache.set(key, em)
  return em
}

/* The site's faces load after the first paint (`font-display: swap`), and a
   width measured in the fallback face is wrong for the real one: every
   measure is thrown out when a face arrives, and whoever used one measures
   again (`useFontEpoch` in their effect's dependencies). */
let epoch = 0
const listeners = new Set<() => void>()
let listening = false

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange)
  if (!listening && typeof document !== 'undefined' && document.fonts !== undefined) {
    listening = true
    document.fonts.addEventListener('loadingdone', () => {
      cache.clear()
      epoch += 1
      for (const listener of listeners) listener()
    })
  }
  return () => {
    listeners.delete(onChange)
  }
}

/** Changes whenever a font finishes loading: measure again when it does. */
export function useFontEpoch(): number {
  return useSyncExternalStore(
    subscribe,
    () => epoch,
    () => 0,
  )
}
