import { useState } from 'react'
import type { PlayerId, PlayerView } from 'engine/client'

/** The builder's "Follow the action" (SeatSwitcher.tsx): on unless turned off, kept in
 * this browser. */
const FOLLOW_KEY = 'mtg.builder.followAction'

function readFollow(): boolean {
  try {
    return window.localStorage.getItem(FOLLOW_KEY) !== 'false'
  } catch {
    return true
  }
}

export function useFollowAction(): readonly [boolean, (on: boolean) => void] {
  const [follow, setFollow] = useState(readFollow)
  const set = (on: boolean) => {
    setFollow(on)
    try {
      window.localStorage.setItem(FOLLOW_KEY, String(on))
    } catch {
      // Not remembered; still applies now.
    }
  }
  return [follow, set] as const
}

/** Whoever the game is waiting on: a decision's player, else the priority holder. */
export function waitingOn(view: PlayerView | null): PlayerId | null {
  if (view === null || view.result.over) return null
  if (view.awaiting !== null) return view.awaiting.player
  return view.priority.active ? view.priority.holder : null
}
