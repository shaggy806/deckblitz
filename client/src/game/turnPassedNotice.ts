import { useCallback, useEffect, useRef, useState } from 'react'

// "Your turn ended on its own." The server passes a priority window that has
// nothing in it for the seat, and one with only mana to tap (`PassSettings.
// skipManaOnly`, on by default) — so a turn with nothing left to play ends
// without a click. That's what the settings are for, but nothing said so: a
// first-time player played a land, and the next thing on screen was the
// opponent's turn (the site check, 2026-11-11). This says it, the first few
// times only: after that the player knows, and a line every turn is noise.

/** How many times a device is told before the notice stops for good. */
const TIMES_SHOWN = 3
const STORAGE_KEY = 'mtg.turnPassedNotice'

// The passes the player made by hand (Pass, Pass Turn, Auto-pass, Resolve
// stack), counted where they're sent (`useNetworkGame`). One game per page, so
// a module-level count does.
let handPasses = 0
export function noteHandPass(): void {
  handPasses++
}

function timesShown(): number {
  try {
    return Number(window.localStorage.getItem(STORAGE_KEY) ?? 0) || 0
  } catch {
    return TIMES_SHOWN
  }
}

/** The turn being watched: its number, whether it's the viewer's own, and the
 * hand-pass count as it began. */
export interface WatchedTurn {
  readonly number: number
  readonly mine: boolean
  readonly passesAtStart: number
}

/** Whether the turn that just ended did so on its own: it was the viewer's,
 * and they passed nothing by hand during it. */
export function endedOnItsOwn(ended: WatchedTurn, passesNow: number): boolean {
  return ended.mine && ended.number > 0 && passesNow === ended.passesAtStart
}

/**
 * Whether to show the notice, and its dismissal. `turn` and `mine` are the
 * turn on screen (the view being shown, not the newest one, so the notice
 * comes with the turn change the player sees); `watching` is false for a
 * spectator, a seat a bot is playing, a tutorial and a finished game.
 */
export function useTurnPassedNotice(
  turn: number | null,
  mine: boolean,
  watching: boolean,
): { readonly show: boolean; readonly dismiss: () => void } {
  const [show, setShow] = useState(false)
  const watched = useRef<WatchedTurn | null>(null)
  useEffect(() => {
    if (turn === null) return
    const before = watched.current
    if (before !== null && before.number === turn) return
    watched.current = { number: turn, mine, passesAtStart: handPasses }
    if (before === null || !watching || !endedOnItsOwn(before, handPasses)) return
    const shown = timesShown()
    if (shown >= TIMES_SHOWN) return
    try {
      window.localStorage.setItem(STORAGE_KEY, String(shown + 1))
    } catch {
      // Unreachable in practice: with no storage `timesShown` already said
      // "enough", so a device that can't count is never told at all.
    }
    setShow(true)
  }, [turn, mine, watching])
  const dismiss = useCallback(() => setShow(false), [])
  return { show, dismiss }
}
