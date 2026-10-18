import { useEffect } from 'react'
import type { VisibleObject } from 'engine/client'
import { facesToLoad, otherFaceOf } from './otherFace.ts'
import { peekCard, requestCards, useCardData } from '../cards/cardData.ts'

/**
 * `obj`'s other face (`otherFaceOf`), fetching both faces' definitions from
 * their shards the first time it's asked: a game's views carry only the face
 * that's up, so the other one comes from the pool (`cards/cardData.ts`).
 * `null` until they've arrived, and for a card without one.
 */
export function useOtherFace(obj: VisibleObject | null): VisibleObject | null {
  const lookup = useCardData()
  // Keyed by the names, not the array: the board remounts every frame, and a
  // shard already in needs no asking.
  const missing = facesToLoad(obj)
    .filter((name) => peekCard(name) === undefined)
    .join('\n')
  useEffect(() => {
    if (missing.length > 0) requestCards(missing.split('\n'))
  }, [missing])
  return obj === null ? null : otherFaceOf(obj, lookup)
}
