import { useSyncExternalStore } from 'react'

/**
 * Whether this device is worked by touch, and how small the page is drawn on
 * it.
 *
 * The site is built for a mouse: a hand tray that rises under the pointer, a
 * card read by hovering it. A finger has no hover, and a tap is the hover and
 * the click at once, so on a phone the tap meant to open the hand also played
 * the card under it (the survey of 2026-11-23, `docs/client-gaps.md`). A
 * touch device gets its own behaviour instead, and **nothing here may change
 * what a mouse sees**: every rule that reads this is gated on it, in script
 * (`isTouch`, `useTouch`) or in CSS (`:root[data-touch]`, whose value is
 * `narrow` on a phone held upright and `wide` otherwise).
 *
 * Asked of the device's pointer, not the window's width or the user agent: a
 * narrow desktop window is still a mouse's, and a phone in Chrome's "Desktop
 * site" mode says it is a desktop in its user agent while still reporting a
 * coarse pointer with no hover. A laptop with a touchscreen reports its
 * trackpad as the main pointer and stays on the mouse's page.
 *
 * `--touch-k` is how many CSS pixels the page spends on one of the screen's:
 * 1 where the page is as wide as the screen, about 2.4 on a phone showing a
 * 980px page shrunk to fit ("Desktop site", which the page cannot turn off:
 * the browser ignores its viewport tag there). A control a finger must hit is
 * sized by it, so it is the same size in the hand either way.
 */

const QUERY = '(hover: none) and (pointer: coarse)'

/** The most a control is enlarged: a guard against a screen size misreported. */
const MAX_SCALE = 4

export interface TouchWindow {
  /** The layout viewport's width, in CSS pixels. */
  readonly innerWidth: number
  /** The browser window's width as the device counts it; 0 where unknown. */
  readonly outerWidth: number
  readonly screenWidth: number
  readonly screenHeight: number
  /** The viewport is wider than it is tall. */
  readonly landscape: boolean
}

/**
 * CSS pixels per screen pixel across the page's width; never under 1.
 *
 * The screen's width is its long side when the page is on its side: Safari
 * reports `screen.width` as the upright width whichever way the phone is
 * held, Chrome as the width now. `outerWidth` is the window's own width where
 * the browser gives one, which is what counts for a window that doesn't fill
 * the screen (a tablet's split view).
 */
export function touchScale(w: TouchWindow): number {
  const long = Math.max(w.screenWidth, w.screenHeight)
  const short = Math.min(w.screenWidth, w.screenHeight)
  const screen = w.landscape ? long : short
  const across = w.outerWidth > 0 ? Math.min(screen, w.outerWidth) : screen
  if (!(across > 0) || !(w.innerWidth > 0)) return 1
  const k = w.innerWidth / across
  // Within a twentieth of the screen's own width is the same width: a
  // scrollbar or a rounding, not a page drawn small.
  if (k < 1.05) return 1
  return Math.min(MAX_SCALE, Math.round(k * 100) / 100)
}

/** A touch page under this many of the screen's pixels across is a phone
 * held upright: the bottom row has no room for the hand's button beside a
 * decision's banner. */
const NARROW_BELOW = 600

let touch = false
let scale = 1
let narrow = false
const listeners = new Set<() => void>()

function read(): void {
  let nowTouch = false
  let nowScale = 1
  try {
    nowTouch = window.matchMedia(QUERY).matches
    if (nowTouch) {
      nowScale = touchScale({
        innerWidth: window.innerWidth,
        outerWidth: window.outerWidth,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        landscape: window.matchMedia('(orientation: landscape)').matches,
      })
    }
  } catch {
    // No `matchMedia` (a unit test's page): a mouse.
  }
  const nowNarrow = nowTouch && window.innerWidth / nowScale < NARROW_BELOW
  if (nowTouch === touch && nowScale === scale && nowNarrow === narrow) return
  const changed = nowTouch !== touch
  touch = nowTouch
  scale = nowScale
  narrow = nowNarrow
  const root = document.documentElement
  if (touch) {
    root.setAttribute('data-touch', narrow ? 'narrow' : 'wide')
    root.style.setProperty('--touch-k', String(scale))
  } else {
    root.removeAttribute('data-touch')
    root.style.removeProperty('--touch-k')
  }
  if (changed) for (const l of listeners) l()
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  read()
  try {
    // A tablet whose keyboard and trackpad come off changes its answer.
    window.matchMedia(QUERY).addEventListener('change', read)
    window.addEventListener('resize', read)
  } catch {
    // An old browser's `MediaQueryList` has no `addEventListener`: the answer
    // read at load stands.
  }
}

/** Whether the device is worked by touch (see the module comment). */
export function isTouch(): boolean {
  return touch
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** `isTouch`, re-rendering when the answer changes. */
export function useTouch(): boolean {
  return useSyncExternalStore(subscribe, isTouch, () => false)
}
