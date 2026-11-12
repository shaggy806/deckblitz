import { useEffect, useState } from 'react'

/**
 * The stack's card seen through (docs/client-gaps.md's option the user
 * picked, 2026-11-11): at 1366x768 in a four-player room the pile's top card
 * covers most of a right-hand board. Holding Alt, or the eye tab on the pile,
 * fades it and lets clicks through to the board under it — nothing moves.
 */
export interface StackSeeThrough {
  /** Faded right now: Alt held, or the tab pinned. */
  readonly on: boolean
  /** The tab is pinned on (for this stack: it lets go once the stack empties). */
  readonly pinned: boolean
  readonly toggle: () => void
}

/** Whether Alt is held down. Let go on blur too: an Alt+Tab away never sends
 * its keyup here. Alt's own keydown is kept from the browser, which would
 * otherwise move focus to its menu bar on the keyup (Firefox). */
export function useAltHeld(): boolean {
  const [held, setHeld] = useState(false)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'Alt') {
        e.preventDefault()
        setHeld(true)
      } else if (!e.altKey) setHeld(false)
    }
    const up = (e: KeyboardEvent) => {
      if (e.key === 'Alt') setHeld(false)
    }
    const away = () => setHeld(false)
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    window.addEventListener('blur', away)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      window.removeEventListener('blur', away)
    }
  }, [])
  return held
}

/**
 * The see-through state for the stack shown, kept in `GameScreen` (`Table`
 * remounts every frame). The tab pins it to the stack it was pressed on — by
 * that stack's bottom object — so it lets go by itself once that stack is
 * gone and a new one starts, with no effect resetting it.
 */
export function useStackSeeThrough(stack: readonly string[]): StackSeeThrough {
  const altHeld = useAltHeld()
  const [pinnedFor, setPinnedFor] = useState<string | null>(null)
  const bottom = stack[0] ?? 'no stack'
  const pinned = pinnedFor === bottom
  return {
    on: altHeld || pinned,
    pinned,
    toggle: () => setPinnedFor(pinned ? null : bottom),
  }
}
