import { describe, expect, it } from 'vitest'
import type { GameEvent, ObjectId, PlayerId } from 'engine/client'
import type { SeatStatus } from 'protocol'
import { HIDDEN_CARD } from '../format.ts'
import { logFileName, logText } from './logExport.ts'

const p1 = 'alice' as PlayerId
const p2 = 'bob' as PlayerId
const seats = [
  { player: p1, displayName: 'Toby' },
  { player: p2, displayName: 'Meren' },
] as unknown as readonly SeatStatus[]

const event = (seq: number, fields: Record<string, unknown>) => ({ seq, ...fields }) as unknown as GameEvent

/** A game's first lines: the start, a draw each (one this seat can't see),
 * and the priority passing the concise view leaves out. */
const events = [
  event(0, { type: 'game-started', players: [p1, p2], startingPlayer: p2, seed: 4022047087 }),
  event(1, { type: 'card-drawn', player: p1, object: 'obj-1' }),
  event(2, { type: 'card-drawn', player: p2, object: 'obj-2' }),
  event(3, { type: 'priority-received', player: p2 }),
  event(4, { type: 'priority-passed', player: p2 }),
]
const nameAt = (id: ObjectId, _seq: number, heldBy?: PlayerId) =>
  heldBy !== undefined && heldBy !== p1 ? HIDDEN_CARD : `card:${id}`

describe('the log as a text file', () => {
  it('is every event, one a line, its number first', () => {
    // The file used to be made by hand: the Detailed view selected and
    // pasted, which put each number on a line of its own (a bug report,
    // 2026-11-17: "the Export log button is missing").
    expect(logText(events, nameAt, seats)).toBe(
      [
        '0\tToby vs Meren · Meren first · seed 4022047087',
        '1\tToby draws card:obj-1',
        `2\tMeren draws ${HIDDEN_CARD}`,
        '3\t→ Meren',
        '4\tMeren passes',
        '',
      ].join('\n'),
    )
  })

  it('names each card as the log named it for that line', () => {
    // The name a card went by then, not now (`NameAt`'s `seq`).
    const byLine = (id: ObjectId, seq: number) => `${id}@${seq}`
    expect(logText(events.slice(1, 2), byLine, seats)).toBe('1\tToby draws obj-1@1\n')
  })

  it('is empty for a log with nothing in it', () => {
    expect(logText([], nameAt, seats)).toBe('')
  })
})

describe("the file's name", () => {
  it('is the room and the seed of the game', () => {
    expect(logFileName('TWOAA', events)).toBe('gamelog-TWOAA-4022047087.txt')
  })

  it('leaves out what it has not got, and anything a file name cannot hold', () => {
    expect(logFileName(null, events)).toBe('gamelog-4022047087.txt')
    expect(logFileName('AB/..\\C D', events.slice(1))).toBe('gamelog-ABCD.txt')
    expect(logFileName(null, [])).toBe('gamelog.txt')
  })
})
