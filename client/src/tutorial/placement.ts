import type { Placement } from './types.ts'

/**
 * Where a coach card goes, and the spotlight's hole — pure, so it's
 * unit-tested. The same ideas as `ui/useHoverPopover.ts`: try the preferred
 * side, flip to the other one when it would run off the screen, and clamp
 * whatever is chosen inside the viewport, since a card cut off at the edge
 * is the thing to avoid.
 */

export interface Rect {
  readonly left: number
  readonly top: number
  readonly width: number
  readonly height: number
}

export interface Size {
  readonly width: number
  readonly height: number
}

export type Side = 'top' | 'bottom' | 'left' | 'right'

export interface CardPlace {
  readonly left: number
  readonly top: number
  /** The side of the anchor the card ended up on; `center` with no anchor. */
  readonly side: Side | 'center'
}

/** Between the spotlight's edge and the card. */
export const CARD_GAP = 14
/** Between the card and the edge of the screen. */
export const SCREEN_MARGIN = 10
/** Around the anchor, so the ring doesn't sit on its border. */
export const HOLE_PAD = 6

const OPPOSITE: Record<Side, Side> = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' }

/** The sides to try, in order: the one asked for, its opposite, then the
 * other two (the vertical pair first — a card above or below reads with the
 * page, beside it covers its neighbours). */
export function sidesToTry(prefer: Placement = 'auto'): readonly Side[] {
  if (prefer === 'auto') return ['bottom', 'top', 'right', 'left']
  const rest: Side[] = (['bottom', 'top', 'right', 'left'] as const).filter(
    (s) => s !== prefer && s !== OPPOSITE[prefer],
  )
  return [prefer, OPPOSITE[prefer], ...rest]
}

const clamp = (v: number, lo: number, hi: number): number => Math.min(Math.max(v, lo), Math.max(lo, hi))

/** How much room the card has on `side` of the anchor, along that axis. */
function room(side: Side, a: Rect, view: Size): number {
  switch (side) {
    case 'bottom':
      return view.height - (a.top + a.height) - CARD_GAP - SCREEN_MARGIN
    case 'top':
      return a.top - CARD_GAP - SCREEN_MARGIN
    case 'right':
      return view.width - (a.left + a.width) - CARD_GAP - SCREEN_MARGIN
    case 'left':
      return a.left - CARD_GAP - SCREEN_MARGIN
  }
}

const fits = (side: Side, a: Rect, card: Size, view: Size): boolean =>
  room(side, a, view) >= (side === 'top' || side === 'bottom' ? card.height : card.width)

/** The card on `side` of the anchor, centred on it along the other axis,
 * then clamped on-screen. */
function at(side: Side, a: Rect, card: Size, view: Size): CardPlace {
  const maxLeft = view.width - card.width - SCREEN_MARGIN
  const maxTop = view.height - card.height - SCREEN_MARGIN
  if (side === 'top' || side === 'bottom') {
    const top = side === 'bottom' ? a.top + a.height + CARD_GAP : a.top - CARD_GAP - card.height
    const left = a.left + a.width / 2 - card.width / 2
    return { side, left: clamp(left, SCREEN_MARGIN, maxLeft), top: clamp(top, SCREEN_MARGIN, maxTop) }
  }
  const left = side === 'right' ? a.left + a.width + CARD_GAP : a.left - CARD_GAP - card.width
  const top = a.top + a.height / 2 - card.height / 2
  return { side, left: clamp(left, SCREEN_MARGIN, maxLeft), top: clamp(top, SCREEN_MARGIN, maxTop) }
}

/**
 * The card's place beside `anchor` (the spotlight's hole): the first side in
 * `sidesToTry(prefer)` it fits on, or — when it fits nowhere, as beside a
 * board that fills the screen — the side with the most room, clamped
 * on-screen even if that means covering part of the anchor.
 */
export function placeCard(anchor: Rect, card: Size, view: Size, prefer: Placement = 'auto'): CardPlace {
  const order = sidesToTry(prefer)
  const side =
    order.find((s) => fits(s, anchor, card, view)) ??
    [...order].sort((x, y) => room(y, anchor, view) - room(x, anchor, view))[0]
  return at(side, anchor, card, view)
}

/** A card with nothing to point at: the middle of the screen. */
export function centerCard(card: Size, view: Size): CardPlace {
  return {
    side: 'center',
    left: Math.max(SCREEN_MARGIN, (view.width - card.width) / 2),
    top: Math.max(SCREEN_MARGIN, (view.height - card.height) / 2),
  }
}

/** The spotlight's hole: the anchor and a little padding, cut to the
 * viewport. Null when none of it is on-screen. */
export function holeRect(anchor: Rect, view: Size, pad: number = HOLE_PAD): Rect | null {
  const left = Math.max(0, anchor.left - pad)
  const top = Math.max(0, anchor.top - pad)
  const right = Math.min(view.width, anchor.left + anchor.width + pad)
  const bottom = Math.min(view.height, anchor.top + anchor.height + pad)
  if (right <= left || bottom <= top) return null
  return { left, top, width: right - left, height: bottom - top }
}

/**
 * The four click-catching strips around a hole — above, below, and the two
 * sides between them — which together cover every pixel of the screen but
 * the hole's. A click in the hole reaches the page; anywhere else it lands
 * on a strip and goes no further.
 */
export function blockerRects(hole: Rect, view: Size): readonly Rect[] {
  const bottom = hole.top + hole.height
  const right = hole.left + hole.width
  return [
    { left: 0, top: 0, width: view.width, height: hole.top },
    { left: 0, top: bottom, width: view.width, height: Math.max(0, view.height - bottom) },
    { left: 0, top: hole.top, width: hole.left, height: hole.height },
    { left: right, top: hole.top, width: Math.max(0, view.width - right), height: hole.height },
  ]
}

/** Whether two rects are the same to the pixel — the frame loop rewrites the
 * DOM only when something moved. */
export function sameRect(a: Rect | null, b: Rect | null): boolean {
  if (a === null || b === null) return a === b
  return (
    Math.round(a.left) === Math.round(b.left) &&
    Math.round(a.top) === Math.round(b.top) &&
    Math.round(a.width) === Math.round(b.width) &&
    Math.round(a.height) === Math.round(b.height)
  )
}
