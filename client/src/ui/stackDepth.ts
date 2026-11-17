// How a stack entry is drawn at its depth (0 = the top), shared by `Stack`,
// which places every entry, and `AnimationLayer`, which moves the rest of the
// pile forward as an entry leaves mid-frame (`closeStackGap`).

// Cards shift down+left with depth (mirrors a real stack of cards spreading
// out from under the one on top); the offset stops growing past this depth
// so a big stack (10+ objects) doesn't sprawl further and further off to
// the side -- scale/opacity already bottom out on their own (the Math.max
// floors below), this just makes the offset saturate the same way.
//
// A step is a share of the card's width (the stack's own `--card-w`), so the
// strip of a buried card left showing is the same part of the card at every
// window size. It was 20px across and 15px down whatever the card's size:
// that share of a card at 1366x768, and less of one as the card grew (a
// twelfth at 1920x1080, a fourteenth at 2560x1440 -- the user, 2026-11-16).
const STAGGER_X = 0.11
const STAGGER_Y = 0.08
const ROT_STEP = 3
const SCALE_STEP = 0.075
const MIN_SCALE = 0.6
const OPACITY_STEP = 0.12
const MIN_OPACITY = 0.55
const MAX_OFFSET_DEPTH = 7

/**
 * The custom properties `.stack-entry` reads for an entry at `depth` in a pile
 * of `count` — custom properties rather than `top`/`right`/`transform`/
 * `opacity`/`z-index` directly, so `.stack-entry:hover` can cancel the depth
 * styling (bringing a buried card to the front) with a plain CSS rule instead
 * of fighting an inline style.
 */
export function stackDepthVars(depth: number, count: number): Record<string, string | number> {
  const offsetDepth = Math.min(depth, MAX_OFFSET_DEPTH)
  // depth 0 (top) and depth 1 (the card directly behind it) both stay
  // upright; rotation only starts from depth 2 on.
  const rotate = depth <= 1 ? 0 : (Math.min(depth, MAX_OFFSET_DEPTH + 1) - 1) * -ROT_STEP
  // Lengths the entry resolves against its own `--card-w` (`.stack-entry`'s
  // `top` and `right`); a whole number of hundredths, not 0.33000000000000007.
  const share = (step: number): string => `calc(var(--card-w) * ${Math.round(offsetDepth * step * 100) / 100})`
  return {
    '--st-y': share(STAGGER_Y),
    '--st-x': share(STAGGER_X),
    '--st-rot': `${rotate}deg`,
    '--st-scale': Math.max(MIN_SCALE, 1 - depth * SCALE_STEP),
    '--st-opacity': Math.max(MIN_OPACITY, 1 - depth * OPACITY_STEP),
    '--st-z': count - depth,
  }
}

/**
 * An entry has left the stack mid-frame (`AnimationLayer`'s stack exit, which
 * hides it behind a flying copy): the entries still in its pile move up into
 * the gap, each to the depth it now holds, through `.stack-entry`'s own
 * transition. Without this the pile stood still until the frame's new board
 * landed — with a deep stack resolved in one frame, until every entry had
 * gone (a bug report, 2026-10-04). The next board redraws the pile anyway.
 */
export function closeStackGap(left: HTMLElement): void {
  left.dataset.left = 'true'
  const pile = left.closest('.stack-pile')
  if (pile === null) return
  const remaining = [...pile.querySelectorAll<HTMLElement>(':scope > .stack-entry')].filter(
    (el) => el.dataset.left !== 'true',
  )
  remaining.forEach((el, depth) => {
    for (const [name, value] of Object.entries(stackDepthVars(depth, remaining.length))) {
      el.style.setProperty(name, String(value))
    }
    el.classList.toggle('is-top', depth === 0)
  })
}
