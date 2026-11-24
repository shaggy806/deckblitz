import { describe, expect, it } from 'vitest'
import type { GameEvent, PlayerId, PlayerView } from 'engine/client'
import type { SeatStatus } from 'protocol'
import {
  REPLAY_MARKER,
  ReplayFileError,
  ReplayRecorder,
  applyPatch,
  decodeReplay,
  diffValue,
  encodeReplay,
  expandReplay,
  frameOfEvent,
  turnStarts,
  viewAt,
} from './replayFile.ts'

const P1 = 'p1' as PlayerId

function event(seq: number, type = 'card-drawn'): GameEvent {
  return { seq, type } as unknown as GameEvent
}

/** A board with only what the replay reads, cast to a view. */
function board(turn: number, life: number, events: readonly GameEvent[], extra: Record<string, unknown> = {}): PlayerView {
  return {
    turn: { number: turn, step: 'main1', activePlayerIndex: 0 },
    players: { p1: { life, hand: [1, 2, 3] }, p2: { life: 20 } },
    objects: { a: { name: 'Island', tapped: false }, b: { name: 'Forest', tapped: true } },
    events,
    ...extra,
  } as unknown as PlayerView
}

const seats = [{ player: P1, displayName: 'Toby', isBot: false }] as unknown as readonly SeatStatus[]

function recorded(view: PlayerView, extra: { replaced?: boolean; seats?: readonly SeatStatus[] } = {}) {
  return {
    roomId: 'ROOM1',
    game: 1,
    seat: P1,
    spectating: false,
    view,
    seats: extra.seats ?? seats,
    replaced: extra.replaced ?? false,
  }
}

describe('diffValue / applyPatch', () => {
  it('keeps only what changed, and puts it back', () => {
    const a = { x: 1, y: { z: [1, 2, 3], w: 'k' }, gone: true }
    const b = { x: 1, y: { z: [1, 5], w: 'k' }, added: { deep: null } }
    const patch = diffValue(a, b)
    expect(patch).toEqual({ y: { z: { length: [2], 1: [5] } }, added: [{ deep: null }], gone: [] })
    expect(applyPatch(a, patch!)).toEqual(b)
  })

  it('says nothing of a value that is the same, and shares what is unchanged', () => {
    const a = { keep: { big: [1, 2] }, n: 1 }
    expect(diffValue(a, JSON.parse(JSON.stringify(a)))).toBeUndefined()
    const next = applyPatch(a, diffValue(a, { keep: { big: [1, 2] }, n: 2 })!) as typeof a
    expect(next.keep).toBe(a.keep)
    expect(a.n).toBe(1)
  })

  it('treats a key holding undefined as absent', () => {
    expect(diffValue({ a: 1 }, { a: 1, b: undefined })).toBeUndefined()
  })

  it('replaces a value whose kind changed', () => {
    expect(applyPatch({ a: [1] }, diffValue({ a: [1] }, { a: { 0: 1 } })!)).toEqual({ a: { 0: 1 } })
    expect(applyPatch({ a: null }, diffValue({ a: null }, { a: { b: 1 } })!)).toEqual({ a: { b: 1 } })
  })
})

describe('ReplayRecorder', () => {
  it('keeps a game as patches and gives every board back', async () => {
    let clock = 1000
    const recorder = new ReplayRecorder('test-build', () => clock)
    const e = [event(0, 'game-started'), event(1), event(2, 'turn-began'), event(3)]
    const views = [
      board(0, 20, e.slice(0, 2)),
      board(1, 20, e.slice(0, 3)),
      board(1, 17, e.slice(0, 3), { awaiting: { kind: 'x' } }),
      board(2, 17, e.slice(0, 4)),
    ]
    for (const view of views) {
      recorder.record(recorded(view))
      clock += 250
    }
    const data = recorder.data('ROOM1')!
    expect(data.frames).toHaveLength(4)
    // The board is set once, then only its changes; the log once, then only
    // what each frame added.
    expect(data.frames[1]!.d).toEqual({ v: { turn: { number: [1] } } })
    expect(data.frames[2]!.a).toBeUndefined()
    expect(data.frames[3]!.a).toEqual([event(3)])
    expect(data.frames[3]!.t).toBe(750)
    expect(recorder.data('OTHER')).toBeNull()

    const text = await encodeReplay(data)
    expect(text.startsWith(`\n${REPLAY_MARKER}\n`)).toBe(true)
    const back = await decodeReplay(`0\tthe log's lines\n1\tanother${text}`)
    const replay = expandReplay(back)
    expect(replay.frames).toHaveLength(4)
    views.forEach((view, i) => expect(viewAt(replay, i)).toEqual(view))
    // Unchanged parts are the same objects frame to frame.
    expect(replay.frames[1]!.board.objects).toBe(replay.frames[0]!.board.objects)

    expect(turnStarts(replay)).toEqual([0, 1, 3])
    expect(frameOfEvent(replay, 2, 0)).toBe(1)
    expect(frameOfEvent(replay, 3, 0)).toBe(3)
    expect(frameOfEvent(replay, 99, 0)).toBe(3)
  })

  it('starts a new log where a take-back replaced the game', () => {
    const recorder = new ReplayRecorder('b', () => 0)
    recorder.record(recorded(board(1, 20, [event(0), event(1), event(2)])))
    recorder.record(recorded(board(1, 20, [event(0), event(1)]), { replaced: true }))
    recorder.record(recorded(board(1, 19, [event(0), event(1), event(2, 'life-lost')])))
    const replay = expandReplay(recorder.data()!)
    expect(replay.logs).toHaveLength(2)
    expect(replay.frames.map((f) => [f.log, f.events])).toEqual([
      [0, 3],
      [1, 2],
      [1, 3],
    ])
    expect(viewAt(replay, 2).events[2]!.type).toBe('life-lost')
  })

  it('starts again for another game in the room', () => {
    const recorder = new ReplayRecorder('b', () => 0)
    recorder.record(recorded(board(3, 20, [event(0)])))
    recorder.record({ ...recorded(board(0, 20, [event(0)])), game: 2 })
    const data = recorder.data()!
    expect(data.game).toBe(2)
    expect(data.frames).toHaveLength(1)
  })

  it('keeps the seats as they change', () => {
    const recorder = new ReplayRecorder('b', () => 0)
    recorder.record(recorded(board(1, 20, [event(0)])))
    const later = [{ player: P1, displayName: 'Toby', isBot: true }] as unknown as readonly SeatStatus[]
    recorder.record(recorded(board(1, 20, [event(0)]), { seats: later }))
    const replay = expandReplay(recorder.data()!)
    expect(replay.frames[1]!.seats).toEqual(later)
  })
})

describe('decodeReplay', () => {
  it('says a plain log has no replay', async () => {
    await expect(decodeReplay('0\tToby draws a card\n')).rejects.toBeInstanceOf(ReplayFileError)
  })

  it('says a damaged replay cannot be read', async () => {
    await expect(decodeReplay(`log\n${REPLAY_MARKER}\nnot-base64!!`)).rejects.toThrow(/couldn't be read/)
  })
})
