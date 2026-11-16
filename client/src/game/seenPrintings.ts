import type { ObjectId, VisibleObject } from 'engine/client'

/**
 * The printing each card of the game has been drawn in, kept so the History
 * log's card preview shows the card as the board did (the user, 2026-11-15):
 * a log line has only an object's id and the name it had then, and looking a
 * card up by its name draws the default printing, not the one its deck
 * pinned.
 *
 * Noted from every frame (`notePrintings`), so a card that has since left
 * every zone this seat can see (a token that died, a card shuffled away) is
 * still drawn as it was. Kept per object and name, because a double-faced
 * card is two names over one printing, and which image a name is
 * (`faceIsBack`) goes with it. A page reload starts it again from the cards
 * in view.
 */

/** How an object was drawn under one of its names. */
export interface SeenPrinting {
  /** The object's `art`: the printing its deck pinned. */
  readonly art: string
  /** Whether that name is the printing's second image
   * (`VisibleObject.faceIsBack`). */
  readonly faceIsBack: boolean
}

const seen = new Map<string, SeenPrinting>()
let seenGame: string | null = null

const keyOf = (id: string, name: string): string => `${id}|${name}`

/**
 * Notes the printing of every card a frame shows. `game` names the room and
 * which of its games the frame is from: another game's cards are forgotten,
 * since its object ids mean nothing in this one.
 */
export function notePrintings(game: string, objects: Readonly<Record<string, VisibleObject>>): void {
  if (game !== seenGame) {
    seen.clear()
    seenGame = game
  }
  for (const id in objects) {
    const object = objects[id]
    // No pinned printing is the default one, which a look-up by name draws.
    if (!object.art) continue
    const key = keyOf(id, object.faceName)
    const had = seen.get(key)
    if (had === undefined || had.art !== object.art || had.faceIsBack !== object.faceIsBack) {
      seen.set(key, { art: object.art, faceIsBack: object.faceIsBack })
    }
  }
}

/** The printing object `id` was drawn in while it was called `name`, if this
 * page has seen it so. */
export function printingSeen(id: ObjectId, name: string): SeenPrinting | undefined {
  return seen.get(keyOf(id, name))
}
