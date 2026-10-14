/**
 * The widest tile width at which a board's rows still fit its quadrant: a
 * binary search over `fits`, which must be monotonic — a wider tile never
 * makes the rows shorter — so "fits at w" holds up to one width and fails past
 * it. Pure, so it's unit-tested; `App.tsx`'s `recomputeBoardMiniW` gives it a
 * `fits` that lays the board out at a width and measures it.
 *
 * Each `fits` call there is a forced layout, so a search starting from
 * `before`, the width the board last settled on, checks that first: if it
 * still fits and a pixel more doesn't, it's still the answer — two calls, not
 * a dozen. Otherwise it narrows the range by what it learned and searches on,
 * always landing where a search from scratch would.
 *
 * Returns `lo` when even `lo` doesn't fit (the board scrolls) and `hi` when
 * `hi` does.
 */
export function fitWidth(fits: (width: number) => boolean, lo: number, hi: number, before?: number): number {
  hi = Math.max(lo, hi)
  if (before !== undefined && before >= lo && before <= hi) {
    if (fits(before)) {
      if (before === hi || !fits(before + 1)) return before
      lo = before + 1
    } else if (before === lo) {
      return lo
    } else {
      hi = before
    }
  }
  if (!fits(lo)) return lo
  if (fits(hi)) return hi
  // `lo` fits and `hi` doesn't, from here on.
  while (hi - lo > 1) {
    const mid = Math.floor((lo + hi) / 2)
    if (fits(mid)) lo = mid
    else hi = mid
  }
  return lo
}
