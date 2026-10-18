import type { CardDefinition, VisibleObject } from 'engine/client'
import { defToVisible } from './defToVisible.ts'

/** A card definition by name: `undefined` while its shard isn't loaded,
 * `null` for no such card (`cards/cardData.ts`'s `peekCard`). */
export type FaceLookup = (name: string) => CardDefinition | null | undefined

/**
 * The face a double-faced card isn't showing, as a tile of its printed
 * values — what a zone viewer turns a card over to, and what a hover card
 * shows beside the face that's up (`OtherFace`).
 *
 * `null` for a one-faced card, and for a card whose faces share one printed
 * image, so there's nothing to turn over to: an adventurer or an omen card
 * (its spell half), a split card or a Room (its halves). Also `null` for a
 * copy, which copies only the face that's up (rule 707.8), and until both
 * faces' definitions have loaded (`lookup` answers `undefined` before then),
 * so the other face appears once they have.
 */
export function otherFaceOf(obj: VisibleObject, lookup: FaceLookup): VisibleObject | null {
  if (!obj.faces || obj.faces.length !== 2 || obj.copyOf !== null) return null
  const front = lookup(obj.faces[0])
  if (!front || front.adventure || front.omen || front.split) return null
  const current = obj.faceName ?? obj.cardName
  const otherIndex = obj.faces.findIndex((name) => name !== current)
  if (otherIndex < 0) return null
  const other = lookup(obj.faces[otherIndex])
  if (!other) return null
  // A printing the card's owner chose names the whole card by id, so the
  // other face is that id's other image (`faceIsBack`). Otherwise `art` is
  // the up face's own pin — which, for a back face, can be a direct file of
  // the back image — and the other face has its own.
  const ownersPrinting = obj.art !== null && obj.art !== lookup(current)?.art
  // `defToVisible` titles a multi-face definition by its front face, so name
  // the face this is.
  return {
    ...defToVisible(other, ownersPrinting ? obj.art : other.art),
    faceName: other.name,
    faceIsBack: otherIndex > 0,
  }
}

/** The face names a hover card needs loaded to show `obj`'s other face —
 * none for a card that can't have one. */
export function facesToLoad(obj: VisibleObject | null): readonly string[] {
  if (obj === null || !obj.faces || obj.faces.length !== 2 || obj.copyOf !== null) return []
  return obj.faces
}

/**
 * Where a pointer-following preview `width` wide goes, as its left edge:
 * just right of the pointer, or just left of it when that would run past the
 * viewport's right edge — and never past the left edge either, for a
 * preview wider than the room on both sides (a two-faced card's pair on a
 * narrow window), which is then pinned at the left with its right end
 * hanging off as little as it can.
 */
export function previewLeft(pointerX: number, width: number, viewportW: number, gap: number): number {
  if (pointerX + gap + width <= viewportW) return pointerX + gap
  return Math.max(gap, pointerX - gap - width)
}
