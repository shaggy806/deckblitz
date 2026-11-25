/**
 * Whether a newer build of the site is out than the one this page runs.
 *
 * A page left open across a deploy keeps running the build it loaded, and a
 * solo game runs in the page's own worker, so nothing ever reloads it: a
 * friend's exile button wasn't lit on the day that shipped, on a page opened
 * before the deploy (a bug report, 2026-11-25). The build writes its own id
 * into `version.json` beside `index.html` (`vite.config.ts`, the same
 * `__PAGE_BUILD__` this page was built with; never cached, as `index.html`
 * isn't), and the page reads it when it comes back into view and every few
 * minutes. A different id there is a newer build: nothing reloads by itself,
 * the page only says so (`NewVersionNotice`, the Game menu).
 */

import { useSyncExternalStore } from 'react'

/** How often an open page asks, and the least time between two asks. */
const EVERY_MS = 5 * 60 * 1000
const AT_LEAST_MS = 60 * 1000

/**
 * The build `version.json` names, when it isn't this page's: `payload` is
 * that file's content, whatever came back. Anything that isn't a build id
 * (the site's fallback page, a proxy's error) says nothing.
 */
export function newerBuild(own: string, payload: unknown): string | null {
  if (typeof payload !== 'object' || payload === null) return null
  const build = (payload as { build?: unknown }).build
  return typeof build === 'string' && build !== '' && build !== own ? build : null
}

let available = false
let started = false
let lastAsked = 0
const listeners = new Set<() => void>()

async function ask(): Promise<void> {
  if (available || Date.now() - lastAsked < AT_LEAST_MS) return
  lastAsked = Date.now()
  try {
    // The time in the address too: a cache between here and the site that
    // ignores `no-store` still has nothing for an address it hasn't seen.
    const response = await fetch(`/version.json?${lastAsked.toString(36)}`, { cache: 'no-store' })
    if (!response.ok) return
    if (newerBuild(__PAGE_BUILD__, await response.json()) === null) return
    available = true
    for (const listener of listeners) listener()
  } catch {
    // Offline, or not JSON: ask again next time.
  }
}

function start(): void {
  // A dev server has no build to compare, and its page reloads itself.
  if (started || import.meta.env.DEV) return
  started = true
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') void ask()
  })
  window.addEventListener('focus', () => void ask())
  window.setInterval(() => {
    if (document.visibilityState === 'visible') void ask()
  }, EVERY_MS)
}

function subscribe(listener: () => void): () => void {
  start()
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** True once a newer build than this page's is out; it stays true. */
export function useNewVersion(): boolean {
  return useSyncExternalStore(subscribe, () => available)
}

/** Loads the new build. A solo game is kept by the page's worker
 * (`local/savedRooms.ts`) and a room's seat by its token, so the game is
 * there again afterwards. */
export function reloadForNewVersion(): void {
  window.location.reload()
}
