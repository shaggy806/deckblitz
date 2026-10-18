import { createPortal } from 'react-dom'
import type { CardDefinition } from 'engine/client'
import { CardTile } from './CardTile.tsx'
import { defToVisible } from './defToVisible.ts'
import { previewLeft } from './otherFace.ts'
import { useOtherFace } from './useOtherFace.ts'

/** The preview's box — must match `--card-w` and the tile's 1.4 aspect in
 * `.card-hover-preview` (deck-builder.css); used to keep it on screen. */
const PREVIEW_W = 220
const PREVIEW_H = 310
const GAP = 14
/** Between a double-faced card and its other face — `.card-hover-preview`'s
 * `gap`, 6% of the card. */
const PAIR_GAP = PREVIEW_W * 0.06

export interface HoverTarget {
  readonly def: CardDefinition
  /** Where the pointer was, in viewport coordinates. */
  readonly x: number
  readonly y: number
  /** The printing this deck brings for the card, if it isn't the default. */
  readonly art?: string | null
}

/**
 * The floating card preview the deck builder shows while the pointer is over
 * a card name, with a double-faced card's other face beside it.
 *
 * Portalled to `document.body` and placed from JS rather than being an
 * absolutely-positioned child revealed on `:hover`, for the same reason
 * `MiniTile`'s board popover is: the lists it hangs off are scroll boxes, so
 * a child would be clipped by `overflow`. Placed beside the pointer, flipped
 * to the other side when it — the pair, for a double-faced card — would run
 * off the right edge (`previewLeft`), and clamped vertically so it never
 * hangs off the top or bottom. The other face is on the right of the face
 * that's up, or on its left when the pair has flipped (`to-left`), so the
 * face that's up is always the one beside the pointer.
 */
export function CardHoverPreview({ target }: { readonly target: HoverTarget | null }) {
  const card = target === null ? null : defToVisible(target.def, target.art)
  const other = useOtherFace(card)
  if (target === null || card === null) return null

  const width = other === null ? PREVIEW_W : PREVIEW_W * 2 + PAIR_GAP
  const left = previewLeft(target.x, width, window.innerWidth, GAP)
  const toLeft = left < target.x
  const top = Math.min(
    Math.max(GAP, target.y - PREVIEW_H / 2),
    Math.max(GAP, window.innerHeight - PREVIEW_H - GAP),
  )

  return createPortal(
    <div className={toLeft ? 'card-hover-preview to-left' : 'card-hover-preview'} style={{ left, top }} aria-hidden="true">
      <CardTile obj={card} />
      {other !== null ? <CardTile obj={other} /> : null}
    </div>,
    document.body,
  )
}
