/**
 * Whether this tab can play a multiplayer game as a **table**: each player's
 * browser holding a copy of the game in its room worker, the server only
 * putting their inputs in order (`docs/plans/replicated-rooms.md`, step 4).
 *
 * **On wherever local mode is** (the user, 2026-11-18, after playing it:
 * "it plays very cleanly, I think it is good to push as the default"; behind
 * `?tables=1` until then, while the plan's step 8 measured it on a slow
 * laptop). `?tables=0` turns it off for the tab and `?tables=1` back on, the
 * choice kept in `sessionStorage` as local mode's is (`localMode.ts`). It
 * needs local mode, since the copy runs in the same worker a solo game does:
 * so it is on in a production build, and under `vite dev` only with
 * `?local=1`. A tab with it on says so to the server once its worker is up
 * (`table-capable`, `localSocket.ts`); a waiting room starts as a table only
 * when every page in it has, on one build, and as a game on the server
 * otherwise.
 */

import { localMode } from './localMode.ts'

const KEY = 'mtg.tables'

/** Reads, and remembers, the tab's choice. */
export function tablesMode(href: string = window.location.href): boolean {
  // Both read, so each remembers what the address says of it whatever the
  // other answers.
  const local = localMode(href)
  return chosen(href) && local
}

function chosen(href: string): boolean {
  let flag: string | null = null
  try {
    flag = new URL(href).searchParams.get('tables')
  } catch {
    // Not a URL: the tab's stored choice.
  }
  try {
    if (flag === '1' || flag === '0') sessionStorage.setItem(KEY, flag)
    // On unless the tab said otherwise.
    return sessionStorage.getItem(KEY) !== '0'
  } catch {
    // No storage (a locked-down browser): the parameter, else on.
    return flag !== '0'
  }
}

/** A dev build's test hook: `?build=<name>` has this tab name another build
 * than the one it is, kept for the tab as the other flags are, to stand in
 * for a page loaded before or after a deploy. Never read in production. */
function namedBuild(): string | null {
  if (!import.meta.env.DEV) return null
  try {
    const flag = new URL(window.location.href).searchParams.get('build')
    if (flag !== null) sessionStorage.setItem('mtg.build', flag)
    return sessionStorage.getItem('mtg.build')
  } catch {
    return null
  }
}

/** This build of the page, as Vite stamped it (`vite.config.ts`): copies of
 * one game must run the same engine and the same cards, so a table starts
 * only among pages that name the same one. A page on another build can still
 * come to a table that is under way: it is dealt the host's state, and its
 * copy is checked against the host's as everyone's is. */
export const PAGE_BUILD: string = namedBuild() ?? __PAGE_BUILD__
