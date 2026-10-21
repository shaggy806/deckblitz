/**
 * The pointer's path through the hand fan, filled in between its move events
 * (the user, 2026-10-20): a pointer swept quickly across the fan reaches the
 * page as a few points a frame apart, so `:hover` lands on one card in three
 * and the rest never stir. Here the path between two events — the browser's
 * coalesced points, then straight lines between them, sampled every few
 * pixels — is hit-tested as the browser would have, and each card it crossed
 * gets the hover's grow for as long as the pointer was over it (a frame at
 * least), in the order it was crossed, a frame behind the pointer. So the fan
 * rises in a wave under a fast sweep, as it would at a much higher rate.
 *
 * A crossed card is marked `data-sweep`, which App.css grows as it does a
 * hovered card, but without lifting it out of the fan's stacking or letting
 * it take the pointer: it's only drawn, never the hover itself, so it never
 * steals the hover from the card the pointer has really reached.
 */
import { motionPrefs } from '../game/motionPrefs.ts'

/** A point on the pointer's path: viewport px, and when (ms, the event clock). */
export interface PathPoint {
  readonly x: number
  readonly y: number
  readonly t: number
}

/** One stretch of the path over one thing: when the pointer came onto it and
 * when it left (or the path ended on it). */
export interface SweepRun<K> {
  readonly key: K
  readonly enter: number
  readonly leave: number
}

/** How far apart (px) the path is sampled: under the narrowest sliver of a
 * card a crowded fan shows. */
const SAMPLE_PX = 6
/** At most this many hit tests a move, however far the pointer jumped. */
const MAX_SAMPLES = 160
/** A display frame at 60 Hz (ms): the most one move's jump can have taken. */
const FRAME_MS = 1000 / 60

/**
 * The runs of `path` over what `hit` finds at each sample, in the order the
 * pointer crossed them: consecutive samples over one key make one run, and a
 * sample over nothing (`null`) ends the run before it. Each segment is
 * sampled at `SAMPLE_PX` steps (fewer past `MAX_SAMPLES` in all), its times
 * interpolated along it.
 */
export function sweepRuns<K>(path: readonly PathPoint[], hit: (x: number, y: number) => K | null): SweepRun<K>[] {
  let length = 0
  for (let i = 1; i < path.length; i += 1) length += Math.hypot(path[i].x - path[i - 1].x, path[i].y - path[i - 1].y)
  const step = Math.max(SAMPLE_PX, length / MAX_SAMPLES)
  const runs: SweepRun<K>[] = []
  // The run the path is on, if it's over anything.
  const at: { open: { key: K; enter: number } | null } = { open: null }
  const sample = (x: number, y: number, t: number): void => {
    const key = hit(x, y)
    if (at.open !== null && key === at.open.key) return
    if (at.open !== null) runs.push({ ...at.open, leave: t })
    at.open = key === null ? null : { key, enter: t }
  }
  if (path.length > 0) sample(path[0].x, path[0].y, path[0].t)
  for (let i = 1; i < path.length; i += 1) {
    const a = path[i - 1]
    const b = path[i]
    const n = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / step))
    for (let k = 1; k <= n; k += 1) {
      const f = k / n
      sample(a.x + (b.x - a.x) * f, a.y + (b.y - a.y) * f, a.t + (b.t - a.t) * f)
    }
  }
  const last = path.at(-1)
  if (at.open !== null && last !== undefined) runs.push({ ...at.open, leave: last.t })
  return runs
}

/** When each swept card grows and settles back, on `performance.now()`'s
 * clock; `shown` the frame it was first drawn grown. */
interface Pulse {
  on: number
  off: number
  shown?: number
}

/** The fan the pointer sweeps: the viewer's own hand, not the mulligan
 * popup's (which never grows a card) or the grid's (which has no fan). */
function fanRow(): HTMLElement | null {
  for (const row of document.querySelectorAll<HTMLElement>('.hand-cards')) {
    if (row.closest('.mulligan-modal') === null) return row
  }
  return null
}

/**
 * Watches the pointer for sweeps across the hand fan, for as long as the game
 * screen is up; returns what stops it.
 */
export function watchHandSweep(): () => void {
  // Where the pointer was at the last move, and the card it really hovered.
  let last: PathPoint | null = null
  let lastCard: Element | null = null
  const pulses = new Map<HTMLElement, Pulse>()
  let raf = 0

  const tick = (now: number): void => {
    for (const [el, p] of pulses) {
      if (!el.isConnected) {
        pulses.delete(el)
      } else if (p.shown === undefined) {
        if (now >= p.on) {
          el.dataset.sweep = ''
          p.shown = now
        }
      } else if (now >= p.off && now > p.shown) {
        // Drawn for a frame at least, or it never moved at all.
        delete el.dataset.sweep
        pulses.delete(el)
      }
    }
    raf = pulses.size > 0 ? requestAnimationFrame(tick) : 0
  }

  const onMove = (e: PointerEvent): void => {
    const coalesced = typeof e.getCoalescedEvents === 'function' ? e.getCoalescedEvents() : []
    const points = (coalesced.length > 0 ? coalesced : [e]).map((ev) => ({ x: ev.clientX, y: ev.clientY, t: ev.timeStamp }))
    const before = last
    const beforeCard = lastCard
    last = points.at(-1) ?? null
    lastCard = e.target instanceof Element ? e.target.closest('.hand-card') : null
    // A drag (a card pulled out to play), a touch, or motion turned down.
    if (before === null || e.buttons !== 0 || e.pointerType === 'touch' || motionPrefs().reduced) return
    const row = fanRow()
    if (row === null) return
    // A pointer that sat still before this move set off at most a frame
    // before it arrived, not when it last moved.
    const path = [{ ...before, t: Math.max(before.t, points[0].t - FRAME_MS) }, ...points]
    // Nowhere near the fan: no hit tests. A grown card reaches up to about
    // a card's height over the row.
    const r = row.getBoundingClientRect()
    const reach = r.height
    const xs = path.map((p) => p.x)
    const ys = path.map((p) => p.y)
    if (
      Math.max(...xs) < r.left ||
      Math.min(...xs) > r.right ||
      Math.max(...ys) < r.top - reach ||
      Math.min(...ys) > r.bottom
    )
      return
    const runs = sweepRuns(path, (x, y) => {
      const card = document.elementFromPoint(x, y)?.closest<HTMLElement>('.hand-card') ?? null
      return card !== null && row.contains(card) ? card : null
    })
    // Replayed from now, so the sweep plays out a frame behind the pointer.
    const shift = performance.now() - path[0].t
    for (const [i, run] of runs.entries()) {
      // The cards the browser hovered itself: the one it left and the one
      // it's on now.
      if ((i === 0 && run.key === beforeCard) || run.key === lastCard) continue
      const on = run.enter + shift
      const off = run.leave + shift
      const pulse = pulses.get(run.key)
      if (pulse === undefined) pulses.set(run.key, { on, off })
      else pulse.off = Math.max(pulse.off, off)
    }
    if (pulses.size > 0 && raf === 0) raf = requestAnimationFrame(tick)
  }
  const onLeave = (e: MouseEvent): void => {
    if (e.relatedTarget === null) last = null
  }

  window.addEventListener('pointermove', onMove, { passive: true })
  document.addEventListener('mouseout', onLeave)
  return () => {
    window.removeEventListener('pointermove', onMove)
    document.removeEventListener('mouseout', onLeave)
    if (raf !== 0) cancelAnimationFrame(raf)
    for (const el of pulses.keys()) delete el.dataset.sweep
    pulses.clear()
  }
}
