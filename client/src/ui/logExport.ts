/**
 * The game's log as a plain text file — the History panel's "Export log".
 *
 * A log used to leave the page only by selecting the Detailed view and
 * pasting it somewhere, which put each line's number on a line of its own
 * (the user's saved logs, 2026-11-14 and 2026-11-17). The file is that view,
 * whatever the panel is showing: **every** event, one a line, its number
 * first and a tab after it, so a bug report can name a line and a search can
 * find one. Names are the log's own (`NameAt`): a card this seat never saw
 * stays hidden in the file too.
 *
 * `logText` and `logFileName` are pure (tested without a page);
 * `downloadText` is the one place that touches the document. `exportLog`
 * adds the game's replay after the lines (`replay/replayFile.ts`).
 */

import type { GameEvent, ObjectId, PlayerId } from 'engine/client'
import type { SeatStatus } from 'protocol'
import { describeEvent } from '../format.ts'
import { replayTrailer } from '../replay/recorder.ts'

/** `EventLog`'s `NameAt`: what a line about event `seq` calls object `id`. */
type NameAt = (id: ObjectId, seq: number, heldBy?: PlayerId) => string

/** Every event as `<number>\t<sentence>`, a line each, in order. A sentence
 * is kept to its line whatever it holds. */
export function logText(events: readonly GameEvent[], nameAt: NameAt, seats: readonly SeatStatus[]): string {
  return events
    .map((event) => {
      const sentence = describeEvent(event, (id, heldBy) => nameAt(id, event.seq, heldBy), seats)
      return `${event.seq}\t${sentence.replace(/\s*[\r\n]+\s*/g, ' ')}\n`
    })
    .join('')
}

/** The file a log downloads as: the room and the game's seed, which is how
 * a game is named everywhere else (a rematch in the same room has another),
 * with anything a file name can't hold dropped. */
export function logFileName(roomId: string | null, events: readonly GameEvent[]): string {
  const started = events.find((event) => event.type === 'game-started')
  const parts = ['gamelog', roomId ?? '', started === undefined ? '' : String(started.seed)]
  return `${parts
    .map((part) => part.replace(/[^A-Za-z0-9]+/g, ''))
    .filter((part) => part !== '')
    .join('-')}.txt`
}

/** Saves the log `text` as `fileName`, with the game's replay after it when
 * this tab kept one (`replay/recorder.ts`): the same file opens in Settings'
 * "Watch a replay". The log's own lines come first and are unchanged, so a
 * bug report still names a line by its number. */
export async function exportLog(fileName: string, text: string, roomId: string | null): Promise<void> {
  downloadText(fileName, text + (await replayTrailer(roomId)))
}

/** Hand the browser `text` to save as `fileName`. */
export function downloadText(fileName: string, text: string): void {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.click()
  URL.revokeObjectURL(url)
}
