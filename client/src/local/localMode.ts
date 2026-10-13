/**
 * Whether this tab plays its games locally — in a Web Worker in this browser
 * (`localSocket.ts`) — instead of on the room server (`docs/plans/local-rooms.md`).
 *
 * Off unless asked for, while it's being built: `?local=1` turns it on for the
 * tab (kept in `sessionStorage`, so the room URLs the game navigates to, which
 * drop the parameter, stay local), and `?local=0` turns it off again.
 */

const KEY = 'mtg.local'

/** Reads, and remembers, the tab's choice. */
export function localMode(href: string = window.location.href): boolean {
  try {
    const flag = new URL(href).searchParams.get('local')
    if (flag === '1') sessionStorage.setItem(KEY, '1')
    else if (flag === '0') sessionStorage.removeItem(KEY)
    return sessionStorage.getItem(KEY) === '1'
  } catch {
    // No storage (a locked-down browser): only an explicit `?local=1` counts.
    try {
      return new URL(href).searchParams.get('local') === '1'
    } catch {
      return false
    }
  }
}
