import type { VisibleObject } from 'engine/client'
import { CardTile } from './CardTile.tsx'
import { useOtherFace } from './useOtherFace.ts'

/**
 * A double-faced card's other face, as a whole card beside the hover card
 * showing the face that's up — on the board, in the hand, the command zone, a
 * revealed library top, the history and the deck builder. Nothing for a
 * card without one. Sized by the `--card-w` it's drawn under, like the hover
 * card it sits beside.
 */
export function OtherFace({
  obj,
  className,
  layout,
}: {
  readonly obj: VisibleObject
  readonly className?: string
  /** `CardTile`'s: the hand's is 'art-first', fitted to the hand's fixed
   * box as the card beside it is. */
  readonly layout?: 'title' | 'art-first'
}) {
  const other = useOtherFace(obj)
  if (other === null) return null
  return (
    <div className={className === undefined ? 'other-face' : `other-face ${className}`} aria-label="Other face">
      <CardTile obj={other} layout={layout} />
    </div>
  )
}
