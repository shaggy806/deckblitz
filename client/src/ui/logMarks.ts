import type { ObjectId } from 'engine/client'

/**
 * Card names in a history line, marked as they're substituted rather than
 * re-found in the finished sentence. `describeEvent` routes every card name
 * through `nameOf`, so wrapping that one function marks all of them — across
 * ~100 event cases — without any of those cases knowing. Searching the
 * rendered string for known card names instead would mis-hit every time a
 * name is a common word ("Fog", "Six", "Giada") or is a substring of another
 * card's.
 *
 * Control characters because no card name contains one, so the split can't
 * collide with real text. A mark carries the object's id ahead of its name
 * (`MARK_ID` between them), so a click on a name is about that card and not
 * the line's first (`EventLog`'s `onSelectCard`).
 */
const MARK_START = '\u0001'
const MARK_END = '\u0002'
const MARK_ID = '\u0003'

/** A run of a log line: plain words, or a card's name with the id of the
 * object it names. */
export interface LogPart {
  readonly text: string
  readonly card: boolean
  readonly id?: ObjectId
}

/** A card's name as it goes into a line, carrying its object's id. */
export const markCard = (id: ObjectId, name: string): string => `${MARK_START}${id}${MARK_ID}${name}${MARK_END}`

/**
 * A marked line as its runs. Odd chunks are the marked names — `split` on a
 * single-char delimiter pair alternates plain/marked as long as marks never
 * nest, which they can't: the name is a leaf substitution.
 */
export function splitMarked(marked: string): LogPart[] {
  return marked.split(MARK_START).flatMap((chunk, i): LogPart[] => {
    if (i === 0) return [{ text: chunk, card: false }]
    const [mark, ...rest] = chunk.split(MARK_END)
    const at = mark.indexOf(MARK_ID)
    const named: LogPart =
      at < 0 ? { text: mark, card: true } : { text: mark.slice(at + 1), card: true, id: mark.slice(0, at) as ObjectId }
    return [named, { text: rest.join(MARK_END), card: false }]
  })
}
