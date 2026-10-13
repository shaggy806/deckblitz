import { useSyncExternalStore } from 'react'

/**
 * How far this device has got with the tutorials, in one `localStorage` key,
 * `mtg.tutorials` — a tiny store in the style of `game/passSettings.ts`:
 *
 * ```
 * {
 *   seenIntro: boolean,                    // the first-visit callout was shown and answered
 *   tour: { done: boolean,                 // the site tour was finished at least once
 *           at: string | null },           // the step it's open at (a step id), null when not running
 *   lessons: { [lessonId]: 'done' },       // Learn Commander's lessons (phase 2+)
 * }
 * ```
 *
 * `tour.at` is what carries the site tour across the full page loads to
 * `/library` and `/deck-builder` (they aren't client-routed): the step is
 * recorded before the page goes, and the `CoachLayer` on the next one picks
 * it up. Every access is wrapped: a storage that throws (a private window,
 * blocked site data) or holds junk just means a fresh start, and a write that
 * fails still applies for the life of the page.
 */

export const STORAGE_KEY = 'mtg.tutorials'

export interface TutorialProgress {
  readonly seenIntro: boolean
  readonly tour: { readonly done: boolean; readonly at: string | null }
  readonly lessons: Readonly<Record<string, 'done'>>
}

export const FRESH: TutorialProgress = { seenIntro: false, tour: { done: false, at: null }, lessons: {} }

/** What a stored value says, anything unreadable falling back to {@link FRESH}. */
export function parseProgress(raw: string | null): TutorialProgress {
  if (raw === null) return FRESH
  try {
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return FRESH
    const p = parsed as { seenIntro?: unknown; tour?: { done?: unknown; at?: unknown }; lessons?: unknown }
    const lessons: Record<string, 'done'> = {}
    if (typeof p.lessons === 'object' && p.lessons !== null) {
      for (const [id, v] of Object.entries(p.lessons)) if (v === 'done') lessons[id] = 'done'
    }
    return {
      seenIntro: p.seenIntro === true,
      tour: {
        done: p.tour?.done === true,
        at: typeof p.tour?.at === 'string' ? p.tour.at : null,
      },
      lessons,
    }
  } catch {
    return FRESH
  }
}

/** The part of `Storage` the store uses. */
export interface StorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

export interface ProgressStore {
  get(): TutorialProgress
  update(change: (p: TutorialProgress) => TutorialProgress): void
  subscribe(fn: () => void): () => void
}

/** A store over `storage` — a getter, since merely reading
 * `window.localStorage` can throw. */
export function createProgressStore(storage: () => StorageLike | null): ProgressStore {
  let current: TutorialProgress = FRESH
  try {
    current = parseProgress(storage()?.getItem(STORAGE_KEY) ?? null)
  } catch {
    // Unreadable: a fresh start.
  }
  const listeners = new Set<() => void>()
  return {
    get: () => current,
    update(change) {
      current = change(current)
      try {
        storage()?.setItem(STORAGE_KEY, JSON.stringify(current))
      } catch {
        // Not remembered past this page load; still applies now.
      }
      for (const l of listeners) l()
    },
    subscribe(fn) {
      listeners.add(fn)
      return () => listeners.delete(fn)
    },
  }
}

const browserStorage = (): StorageLike | null =>
  typeof window === 'undefined' ? null : window.localStorage

export const progressStore: ProgressStore = createProgressStore(browserStorage)

export function useTutorialProgress(): TutorialProgress {
  return useSyncExternalStore(progressStore.subscribe, progressStore.get)
}

/** Records the site tour's place (`null`: not running). Starting it counts as
 * having seen the intro. */
export function setTourAt(at: string | null): void {
  progressStore.update((p) => ({ ...p, seenIntro: p.seenIntro || at !== null, tour: { ...p.tour, at } }))
}

/** The site tour reached its last card. */
export function finishTour(): void {
  progressStore.update((p) => ({ ...p, seenIntro: true, tour: { done: true, at: null } }))
}

/** The first-visit callout was dismissed or followed. */
export function markIntroSeen(): void {
  if (progressStore.get().seenIntro) return
  progressStore.update((p) => ({ ...p, seenIntro: true }))
}
