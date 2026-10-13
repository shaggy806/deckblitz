import { describe, expect, it } from 'vitest'
import type { GameEvent, PlayerId } from 'engine/client'
import { NO_EVENT_LOG, appendEvents, receiveFrame } from './eventLog.ts'
import type { EventLog } from './eventLog.ts'

const alice = 'alice' as PlayerId

/** Events numbered `from` up to (not including) `to`. */
const events = (from: number, to: number): GameEvent[] =>
  Array.from({ length: to - from }, (_, i) => ({ type: 'priority-passed', player: alice, seq: from + i }) as GameEvent)

const log = (n: number, game = 1, roomId = 'ROOM1'): EventLog => ({ roomId, game, events: events(0, n) })

describe('appendEvents', () => {
  it('takes a whole log as it comes, over whatever it had', () => {
    const whole = events(0, 5)
    expect(appendEvents(null, { roomId: 'ROOM1', game: 1, eventsFrom: 0, events: whole })).toEqual({
      roomId: 'ROOM1',
      game: 1,
      events: whole,
    })
    // A shorter log, sent whole — a tutorial's retry, a builder's rebuild.
    const shorter = appendEvents(log(40), { roomId: 'ROOM1', game: 1, eventsFrom: 0, events: events(0, 3) })
    expect(shorter?.events).toHaveLength(3)
  })

  it('reads a frame without eventsFrom (a server older than it) as the whole log', () => {
    const next = appendEvents(log(5), { roomId: 'ROOM1', game: 1, events: events(0, 7) })
    expect(next?.events).toEqual(events(0, 7))
  })

  it("appends a frame's new events to a new array, leaving the old log as it was", () => {
    const before = log(5)
    const next = appendEvents(before, { roomId: 'ROOM1', game: 1, eventsFrom: 5, events: events(5, 8) })
    expect(next?.events).toEqual(events(0, 8))
    expect(before.events).toHaveLength(5)
    expect(next?.events).not.toBe(before.events)
  })

  it('keeps the same log when a frame brings no events', () => {
    const before = log(5)
    expect(appendEvents(before, { roomId: 'ROOM1', game: 1, eventsFrom: 5, events: [] })).toBe(before)
  })

  it("refuses a frame that doesn't follow on: a gap, an overlap, or nothing to follow on from", () => {
    expect(appendEvents(log(5), { roomId: 'ROOM1', game: 1, eventsFrom: 7, events: events(7, 9) })).toBeNull()
    expect(appendEvents(log(5), { roomId: 'ROOM1', game: 1, eventsFrom: 3, events: events(3, 9) })).toBeNull()
    expect(appendEvents(null, { roomId: 'ROOM1', game: 1, eventsFrom: 4, events: events(4, 6) })).toBeNull()
  })

  it("refuses another game's slice: a rematch's or another room's", () => {
    // The new game's first frame always comes whole; a slice of it can only
    // follow that.
    expect(appendEvents(log(5, 1), { roomId: 'ROOM1', game: 2, eventsFrom: 5, events: events(5, 6) })).toBeNull()
    expect(appendEvents(log(5, 1), { roomId: 'ROOM2', game: 1, eventsFrom: 5, events: events(5, 6) })).toBeNull()
    // And a stale slice of the game before, once the rematch's log is in.
    expect(appendEvents(log(5, 2), { roomId: 'ROOM1', game: 1, eventsFrom: 5, events: events(5, 6) })).toBeNull()
    const rematch = appendEvents(log(50, 1), { roomId: 'ROOM1', game: 2, eventsFrom: 0, events: events(0, 4) })
    expect(rematch).toEqual({ roomId: 'ROOM1', game: 2, events: events(0, 4) })
  })
})

describe('receiveFrame', () => {
  it('shows frames that follow on, the whole log on each', () => {
    const first = receiveFrame(NO_EVENT_LOG, { roomId: 'ROOM1', game: 1, eventsFrom: 0, events: events(0, 4) })
    if (first.kind !== 'show') throw new Error('dropped')
    const second = receiveFrame(first.state, { roomId: 'ROOM1', game: 1, eventsFrom: 4, events: events(4, 6) })
    expect(second.kind === 'show' && second.log.events).toEqual(events(0, 6))
  })

  it("drops a frame with a gap before it, asks once for the whole log, and takes it when it comes", () => {
    const shown = receiveFrame(NO_EVENT_LOG, { roomId: 'ROOM1', game: 1, eventsFrom: 0, events: events(0, 4) })
    if (shown.kind !== 'show') throw new Error('dropped')
    // A frame went missing: this one starts at 6.
    const gap = receiveFrame(shown.state, { roomId: 'ROOM1', game: 1, eventsFrom: 6, events: events(6, 8) })
    expect(gap).toMatchObject({ kind: 'drop', resync: true })
    // Another before the answer: dropped, but not asked for again.
    const again = receiveFrame(gap.state, { roomId: 'ROOM1', game: 1, eventsFrom: 8, events: events(8, 9) })
    expect(again).toMatchObject({ kind: 'drop', resync: false })
    // The answer: the whole log.
    const answer = receiveFrame(again.state, { roomId: 'ROOM1', game: 1, eventsFrom: 0, events: events(0, 9) })
    expect(answer.kind).toBe('show')
    expect(answer.state).toEqual({ log: { roomId: 'ROOM1', game: 1, events: events(0, 9) }, resyncing: false })
    // A later gap asks again.
    const later = receiveFrame(answer.state, { roomId: 'ROOM1', game: 1, eventsFrom: 12, events: events(12, 13) })
    expect(later).toMatchObject({ kind: 'drop', resync: true })
  })

  it("starts afresh on a rematch's first frame", () => {
    const old = receiveFrame(NO_EVENT_LOG, { roomId: 'ROOM1', game: 1, eventsFrom: 0, events: events(0, 30) })
    const next = receiveFrame(old.state, { roomId: 'ROOM1', game: 2, eventsFrom: 0, events: events(0, 2) })
    expect(next.kind === 'show' && next.log).toEqual({ roomId: 'ROOM1', game: 2, events: events(0, 2) })
  })
})
