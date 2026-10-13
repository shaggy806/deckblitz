/**
 * The game's event log, put back together from the server's frames. A frame
 * carries only the events this connection hasn't been sent yet (`state`'s
 * `eventsFrom`, once the socket has said `event-deltas`), so the whole log —
 * what the History panel lists, what the game's numbers are worked out of,
 * what playback counts its way through — exists only here. Pure, so it can
 * be tested without a socket or a page.
 */

import type { GameEvent } from 'engine/client'

/** The log as this client holds it, and which game of which room it's from. */
export interface EventLog {
  readonly roomId: string
  readonly game: number
  readonly events: readonly GameEvent[]
}

/** What one `state` frame brings to it. */
export interface EventSlice {
  readonly roomId: string
  readonly game: number
  /** Where in the log `events` starts (`state.eventsFrom`). 0 — or absent,
   * from a server older than it — is the whole log. */
  readonly eventsFrom?: number
  readonly events: readonly GameEvent[]
}

/**
 * The log with `slice`'s events in it: the slice itself when it's the whole
 * log, else the slice appended to `log` — or `null` when it doesn't follow
 * on from `log` (it starts somewhere other than where `log` ends, or it's
 * another game's), which only a frame this client never got, or the server
 * losing track, could cause: the caller then asks for the whole log again
 * (`resync`) rather than show a log with a hole in it.
 *
 * A new array whenever events are added — never `log`'s own grown in place,
 * since boards already shown still hold it and must keep the log they were
 * drawn with — and `log` itself back when there are none, so nothing keyed on
 * the array sees a change that isn't one.
 */
export function appendEvents(log: EventLog | null, slice: EventSlice): EventLog | null {
  const from = slice.eventsFrom ?? 0
  if (from === 0) return { roomId: slice.roomId, game: slice.game, events: slice.events }
  if (log === null || log.roomId !== slice.roomId || log.game !== slice.game || log.events.length !== from) {
    return null
  }
  if (slice.events.length === 0) return log
  return { roomId: log.roomId, game: log.game, events: log.events.concat(slice.events) }
}

/** What the socket keeps between frames: the log, and whether it has asked
 * for the whole of it again and is waiting for the answer. */
export interface EventLogState {
  readonly log: EventLog | null
  readonly resyncing: boolean
}

export const NO_EVENT_LOG: EventLogState = { log: null, resyncing: false }

/** What to do with a frame, as `receiveFrame` decides. */
export type FrameVerdict =
  /** Show it, with `log` as its whole event log. */
  | { readonly kind: 'show'; readonly state: EventLogState; readonly log: EventLog }
  /** Drop it: its events don't follow on. Send a `resync` if `resync` — only
   * for the first such frame, not each one until the answer comes (the
   * answer is the current frame again, whole, so nothing is lost). */
  | { readonly kind: 'drop'; readonly state: EventLogState; readonly resync: boolean }

/** One `state` frame through the log: `appendEvents`, plus the asking again. */
export function receiveFrame(state: EventLogState, slice: EventSlice): FrameVerdict {
  const log = appendEvents(state.log, slice)
  if (log === null) return { kind: 'drop', state: { log: state.log, resyncing: true }, resync: !state.resyncing }
  // A whole log is the answer to any resync outstanding, or makes it moot.
  const resyncing = state.resyncing && (slice.eventsFrom ?? 0) !== 0
  return { kind: 'show', state: { log, resyncing }, log }
}
