import { useLayoutEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import type { VisibleObject } from 'engine/client'
import { CardTile } from './CardTile.tsx'
import { KeywordTips } from './KeywordTips.tsx'
import { useHoverPopover } from './useHoverPopover.ts'
import { motionPrefs } from '../game/motionPrefs.ts'
import { FLIP_STEP_MS } from '../game/animationSchedule.ts'

export interface LibraryTopCardProps {
  readonly obj: VisibleObject
  /** Playable right now (the engine offers a play or a cast naming it). */
  readonly highlight: boolean
  readonly onClick: () => void
  /** A card newly on top — not the one the board before showed there: it
   * turns face up as the board appears (the user, 2026-10-10). */
  readonly flipIn?: boolean
}

/**
 * A library's revealed top card (Oracle of Mul Daya's "play with the top
 * card of your library revealed"), drawn as it would be in the hand but
 * scaled down to the face-down pile's box (`.library-top`) — too small to
 * read, so hovering it shows the card full size beside it, as hovering a
 * battlefield tile or a commander does (the user, 2026-10-07). The popover
 * is portalled and JS-placed by `useHoverPopover`, for the same reasons.
 */
export function LibraryTopCard({ obj, highlight, onClick, flipIn = false }: LibraryTopCardProps) {
  const { wrapRef, popoverRef, open, handlers } = useHoverPopover(obj)
  const backRef = useRef<HTMLDivElement>(null)
  // A card back swings edge-on and the card swings round from behind it, as
  // a transformed permanent turns (`runFlip`). Started before the board
  // paints, so the face never shows first.
  useLayoutEffect(() => {
    const back = backRef.current
    const face = wrapRef.current?.querySelector<HTMLElement>('.card-tile')
    if (!flipIn || !back || !face) return
    if (motionPrefs().reduced) {
      back.remove()
      return
    }
    const half = (FLIP_STEP_MS * motionPrefs().animScale) / 2
    back.animate([{ rotate: 'y 0deg' }, { rotate: 'y 90deg' }], { duration: half, easing: 'ease-in', fill: 'forwards' })
    face.animate(
      [
        { rotate: 'y -90deg', filter: 'brightness(1.8)' },
        { rotate: 'y 0deg', filter: 'brightness(1)' },
      ],
      { duration: half, delay: half, easing: 'ease-out', fill: 'backwards' },
    )
    // Mounted once per card on top (keyed on it), so once is all.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return (
    <div className="library-top" ref={wrapRef} {...handlers}>
      <CardTile obj={obj} layout="art-first" highlight={highlight} onClick={onClick} />
      {flipIn ? <div className="card-back library-top-back" ref={backRef} aria-hidden="true" /> : null}
      {open
        ? createPortal(
            <div className="mini-tile-popover" ref={popoverRef}>
              <CardTile obj={obj} />
              <KeywordTips obj={obj} />
            </div>,
            document.body,
          )
        : null}
    </div>
  )
}
