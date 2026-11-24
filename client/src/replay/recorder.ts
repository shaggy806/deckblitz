/**
 * The page's side of replays: the one recorder every frame this tab is shown
 * goes into (`useNetworkGame`), what "Export log" adds to its file from it,
 * and the replay a player has opened to watch (Settings, "Watch a replay"),
 * which `App` shows in place of everything else until it's closed.
 */

import { useSyncExternalStore } from 'react'
import { ReplayRecorder, encodeReplay } from './replayFile.ts'
import type { RecordedFrame, ReplayData } from './replayFile.ts'

const recorder = new ReplayRecorder(__PAGE_BUILD__)

/** Keeps one frame of the game this tab is in. A failure here must never
 * reach the game: a replay is a nicety. */
export function recordFrame(frame: RecordedFrame): void {
  try {
    recorder.record(frame)
  } catch (error) {
    console.warn('replay: a frame could not be kept', error)
  }
}

/** The replay text to add after an exported log of room `roomId`'s game, or
 * '' when this tab has none of it (or it couldn't be written). */
export async function replayTrailer(roomId: string | null): Promise<string> {
  const data = recorder.data(roomId)
  if (data === null) return ''
  try {
    return await encodeReplay(data)
  } catch (error) {
    console.warn('replay: the replay could not be written', error)
    return ''
  }
}

let opened: ReplayData | null = null
const listeners = new Set<() => void>()

/** Shows `data` (or, with `null`, closes the replay and goes back). */
export function openReplay(data: ReplayData | null): void {
  opened = data
  for (const listener of listeners) listener()
}

/** The replay open to watch, if any. */
export function useOpenReplay(): ReplayData | null {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    () => opened,
  )
}
