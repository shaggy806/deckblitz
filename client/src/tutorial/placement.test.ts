import { describe, expect, it } from 'vitest'
import {
  tiltedRing,
  unionRect,
  CARD_GAP,
  SCREEN_MARGIN,
  blockerRects,
  centerCard,
  holeRect,
  placeCard,
  sameRect,
  sidesToTry,
} from './placement.ts'

const VIEW = { width: 1366, height: 768 }
const CARD = { width: 320, height: 180 }

const onScreen = (p: { left: number; top: number }, card = CARD, view = VIEW) =>
  p.left >= SCREEN_MARGIN - 0.5 &&
  p.top >= SCREEN_MARGIN - 0.5 &&
  p.left + card.width <= view.width - SCREEN_MARGIN + 0.5 &&
  p.top + card.height <= view.height - SCREEN_MARGIN + 0.5

describe('sidesToTry', () => {
  it('tries the side asked for, then its opposite, then the rest', () => {
    expect(sidesToTry('left')).toEqual(['left', 'right', 'bottom', 'top'])
    expect(sidesToTry('top')).toEqual(['top', 'bottom', 'right', 'left'])
    expect(sidesToTry('auto')).toEqual(['bottom', 'top', 'right', 'left'])
  })
})

describe('placeCard', () => {
  it('goes below an anchor with room under it, centred on it', () => {
    const anchor = { left: 500, top: 100, width: 200, height: 40 }
    const p = placeCard(anchor, CARD, VIEW)
    expect(p.side).toBe('bottom')
    expect(p.top).toBe(140 + CARD_GAP)
    expect(p.left).toBe(600 - CARD.width / 2)
  })

  it('flips above an anchor near the bottom of the screen', () => {
    // The blitz button at the foot of the landing page.
    const anchor = { left: 400, top: 680, width: 560, height: 60 }
    const p = placeCard(anchor, CARD, VIEW, 'bottom')
    expect(p.side).toBe('top')
    expect(p.top + CARD.height + CARD_GAP).toBe(680)
    expect(onScreen(p)).toBe(true)
  })

  it('flips left of an anchor at the right edge (the corner toolbar)', () => {
    const anchor = { left: 1254, top: 708, width: 44, height: 44 }
    const p = placeCard(anchor, CARD, VIEW, 'right')
    expect(p.side).toBe('left')
    expect(onScreen(p)).toBe(true)
  })

  it('clamps along the cross axis so the card stays on-screen', () => {
    const anchor = { left: 1300, top: 100, width: 50, height: 30 }
    const p = placeCard(anchor, CARD, VIEW, 'bottom')
    expect(p.side).toBe('bottom')
    expect(p.left).toBe(VIEW.width - CARD.width - SCREEN_MARGIN)
  })

  it('fitting nowhere, takes the side with most room and still stays on-screen', () => {
    // A board filling all but a strip at the bottom.
    const anchor = { left: 20, top: 20, width: 1326, height: 600 }
    const p = placeCard(anchor, CARD, VIEW)
    expect(p.side).toBe('bottom')
    expect(onScreen(p)).toBe(true)
  })

  it('keeps a whole card on a 1366x768 screen wherever the anchor is', () => {
    for (let x = 0; x < VIEW.width; x += 97) {
      for (let y = 0; y < VIEW.height; y += 61) {
        const p = placeCard({ left: x, top: y, width: 120, height: 44 }, CARD, VIEW)
        expect(onScreen(p)).toBe(true)
      }
    }
  })
})

describe('centerCard', () => {
  it('puts the card in the middle', () => {
    expect(centerCard(CARD, VIEW)).toEqual({ side: 'center', left: (1366 - 320) / 2, top: (768 - 180) / 2 })
  })
})

describe('holeRect', () => {
  it('pads the anchor', () => {
    expect(holeRect({ left: 100, top: 100, width: 50, height: 20 }, VIEW, 6)).toEqual({
      left: 94,
      top: 94,
      width: 62,
      height: 32,
    })
  })

  it('cuts to the viewport, and is null when nothing is on-screen', () => {
    expect(holeRect({ left: -20, top: 700, width: 100, height: 200 }, VIEW, 0)).toEqual({
      left: 0,
      top: 700,
      width: 80,
      height: 68,
    })
    expect(holeRect({ left: 0, top: 900, width: 100, height: 20 }, VIEW)).toBeNull()
  })
})

describe('blockerRects', () => {
  it('covers every pixel but the hole', () => {
    const hole = { left: 200, top: 100, width: 300, height: 50 }
    const strips = blockerRects(hole, VIEW)
    const area = strips.reduce((n, s) => n + s.width * s.height, 0)
    expect(area).toBe(VIEW.width * VIEW.height - hole.width * hole.height)
    const covered = (x: number, y: number) =>
      strips.some((s) => x >= s.left && x < s.left + s.width && y >= s.top && y < s.top + s.height)
    expect(covered(210, 110)).toBe(false) // in the hole
    expect(covered(150, 110)).toBe(true) // beside it
    expect(covered(210, 90)).toBe(true) // above it
    expect(covered(210, 160)).toBe(true) // below it
    expect(covered(510, 110)).toBe(true) // right of it
  })
})

describe('sameRect', () => {
  it('compares to the pixel', () => {
    expect(sameRect({ left: 1.2, top: 2, width: 3, height: 4 }, { left: 1.4, top: 2, width: 3, height: 4 })).toBe(true)
    expect(sameRect({ left: 1, top: 2, width: 3, height: 4 }, { left: 2, top: 2, width: 3, height: 4 })).toBe(false)
    expect(sameRect(null, null)).toBe(true)
    expect(sameRect(null, { left: 0, top: 0, width: 0, height: 0 })).toBe(false)
  })
})

describe('tiltedRing', () => {
  it('pads the untransformed box and moves the origin by the padding', () => {
    const ring = tiltedRing({ left: 100, top: 200, width: 120, height: 168 }, '60px 168px', 6)
    expect(ring.rect).toEqual({ left: 94, top: 194, width: 132, height: 180 })
    expect(ring.origin).toBe('66px 174px')
  })

  it('falls back to the centre for an unreadable origin', () => {
    expect(tiltedRing({ left: 0, top: 0, width: 10, height: 20 }, 'center', 0).origin).toBe('5px 10px')
  })
})

describe('unionRect', () => {
  it('holds both rects', () => {
    expect(unionRect({ left: 10, top: 20, width: 30, height: 40 }, { left: 0, top: 50, width: 20, height: 30 })).toEqual({
      left: 0,
      top: 20,
      width: 40,
      height: 60,
    })
  })
})
