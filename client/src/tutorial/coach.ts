import { useSyncExternalStore } from 'react'
import { finishTour, setTourAt } from './progress.ts'
import type { Advance, PageId, Step, Tour } from './types.ts'

/**
 * Which tour is running and which of its steps is open — one per page, a
 * module-level store `CoachLayer` draws from. Anything can start a tour
 * (`startTour`): the "?" menu, a first-visit callout, or — later — a tutorial
 * room handing the client its lesson's steps.
 *
 * The moves between steps are pure functions of the tour, the step and the
 * page (`moveTo`, `resumeAt`, `continueFrom`, `backFrom`), unit-tested apart
 * from the store that applies them.
 */

// --- the pure part -------------------------------------------------------

/** A step that waits on the player lets clicks in its spotlight through;
 * one with a Next button doesn't, unless it says so. */
export function isInteractive(step: Step): boolean {
  return step.interactive ?? step.advance !== 'next'
}

/** Whether a step moves on by itself this frame: what it waits for has
 * appeared, or its predicate holds. `click` and `next` never do — they wait
 * for the player. */
export function autoAdvanced(advance: Advance, exists: (selector: string) => boolean): boolean {
  if (advance === 'next' || 'click' in advance) return false
  if ('visible' in advance) return exists(advance.visible)
  try {
    return advance.when()
  } catch {
    return false
  }
}

/** The page a step is on, or — for a step that names none — the page the
 * tour is on now. */
const pageOf = (step: Step | undefined, page: PageId | null): PageId | null => step?.page ?? page

export type Move =
  /** Open step `index` here (waiting for its page, if it's not this one). */
  | { readonly kind: 'show'; readonly index: number }
  /** Record step `index` and load `path`, where it is. */
  | { readonly kind: 'navigate'; readonly index: number; readonly path: string }
  /** The tour is over. */
  | { readonly kind: 'finish' }

/**
 * Moving on to step `to` from `page`. Pressing Next onto a step on another
 * page loads that page (`navigate`); a click advance doesn't, since what was
 * clicked — a link — goes there itself, and a step reached by creating a
 * room has no path: it waits for the room to appear.
 */
export function moveTo(tour: Tour, to: number, page: PageId | null, how: 'next' | 'click' | 'auto'): Move {
  const step = tour.steps[to]
  if (step === undefined) return { kind: 'finish' }
  const target = pageOf(step, page)
  if (how === 'next' && target !== page && target !== null) {
    const path = tour.pages?.[target]?.path
    if (path !== undefined) return { kind: 'navigate', index: to, path }
  }
  return { kind: 'show', index: to }
}

/** Back is only offered within a page: going back across a page load (or out
 * of a room) to re-read a card costs more than it gives. */
export function backFrom(tour: Tour, index: number, page: PageId | null): number | null {
  if (index <= 0) return null
  return pageOf(tour.steps[index - 1], page) === pageOf(tour.steps[index], page) ? index - 1 : null
}

export type Resume =
  | { readonly kind: 'show'; readonly index: number }
  /** On another page than its step: ask whether to go on. */
  | { readonly kind: 'offer'; readonly index: number }
  /** In a game: say nothing until it's over. */
  | { readonly kind: 'quiet' }
  /** The step is no longer in the tour (its copy changed): drop it. */
  | { readonly kind: 'gone' }

/** A tour found open in the progress store as a page loads. */
export function resumeAt(tour: Tour, at: string, page: PageId): Resume {
  const index = tour.steps.findIndex((s) => s.id === at)
  if (index === -1) return { kind: 'gone' }
  const stepPage = tour.steps[index].page
  if (stepPage === undefined || stepPage === page) return { kind: 'show', index }
  if (page === 'game') return { kind: 'quiet' }
  return { kind: 'offer', index }
}

/**
 * "Continue" on the offer: go where step `index` is. A page with no path (a
 * room's lobby) is reached through its `via` step instead, which may be
 * here, or behind a path of its own.
 */
export function continueFrom(tour: Tour, index: number, page: PageId): Move {
  let target = index
  const stepPage = tour.steps[index]?.page
  const how = stepPage === undefined ? undefined : tour.pages?.[stepPage]
  if (how !== undefined && how.path === undefined && how.via !== undefined) {
    const via = tour.steps.findIndex((s) => s.id === how.via)
    if (via !== -1) target = via
  }
  const targetPage = tour.steps[target]?.page
  if (targetPage === undefined || targetPage === page) return { kind: 'show', index: target }
  const path = tour.pages?.[targetPage]?.path
  return path !== undefined ? { kind: 'navigate', index: target, path } : { kind: 'show', index: target }
}

/** Where "Tour the site" starts: the first step on this page, so the tour
 * opened from a room's lobby tours the lobby; otherwise the beginning. */
export function startIndex(tour: Tour, page: PageId | null): number {
  const here = tour.steps.findIndex((s) => s.page === page)
  return here === -1 ? 0 : here
}

// --- the store -----------------------------------------------------------

export interface CoachState {
  readonly tour: Tour | null
  readonly index: number
  /** Picked up from storage on a page its step isn't on: the layer asks
   * before going on. */
  readonly offer: boolean
}

const IDLE: CoachState = { tour: null, index: 0, offer: false }
let state: CoachState = IDLE
let page: PageId | null = null
const listeners = new Set<() => void>()

function set(next: CoachState): void {
  state = next
  if (next.tour?.persist === true) {
    const step = next.tour.steps[next.index]
    if (step !== undefined) setTourAt(step.id)
  }
  for (const l of listeners) l()
}

export function getCoach(): CoachState {
  return state
}

export function useCoach(): CoachState {
  return useSyncExternalStore(
    (fn) => {
      listeners.add(fn)
      return () => listeners.delete(fn)
    },
    () => state,
  )
}

/** The screen the layer is on — `CoachLayer` keeps it current. */
export function setCoachPage(p: PageId): void {
  page = p
}

export function coachPage(): PageId | null {
  return page
}

/** Opens `tour` at step `index` (by default where it starts on this page). */
export function startTour(tour: Tour, index: number = startIndex(tour, page)): void {
  apply(tour, moveTo(tour, index, page, 'next'))
}

/** Offers to pick up a tour found open in storage. */
export function offerTour(tour: Tour, index: number): void {
  set({ tour, index, offer: true })
}

/** Leaves the tour (Skip, Exit, Escape). A persisted tour forgets its place. */
export function stopTour(): void {
  const persist = state.tour?.persist === true
  state = IDLE
  if (persist) setTourAt(null)
  for (const l of listeners) l()
}

/** Applies a move: open a step, load its page, or finish. */
export function apply(tour: Tour, move: Move): void {
  if (move.kind === 'finish') {
    if (tour.persist === true) finishTour()
    state = IDLE
    for (const l of listeners) l()
    return
  }
  set({ tour, index: move.index, offer: false })
  if (move.kind === 'navigate') window.location.assign(move.path)
}

/** Moves the open tour on one step. `fromIndex` guards against a second
 * advance for the same step (a click and a frame landing together). */
export function advance(fromIndex: number, how: 'next' | 'click' | 'auto'): void {
  const { tour, index } = state
  if (tour === null || index !== fromIndex) return
  apply(tour, moveTo(tour, index + 1, page, how))
}

export function back(): void {
  const { tour, index } = state
  if (tour === null) return
  const to = backFrom(tour, index, page)
  if (to !== null) set({ tour, index: to, offer: false })
}

/** "Continue" on the offer to pick a tour back up. */
export function continueTour(): void {
  const { tour, index } = state
  if (tour === null || page === null) return
  apply(tour, continueFrom(tour, index, page))
}
