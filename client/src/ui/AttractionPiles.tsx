import { createPortal } from 'react-dom'
import type { PlayerId, VisibleObject } from 'engine/client'
import { CardTile } from './CardTile.tsx'
import { useCardArt } from './useCardArt.ts'
import { useHoverPopover } from './useHoverPopover.ts'
import './attraction-piles.css'

export interface AttractionPilesProps {
  readonly player: PlayerId
  /** Cards in their Attraction deck (`PublicPlayerInfo.attractionDeckSize`):
   * face down, so only the count is anyone's (rule 717.2). */
  readonly deckSize: number
  /** Their junkyard, oldest first (`PublicPlayerInfo.junkyard`), as the view
   * has each card: face up, everyone's (717.6a). */
  readonly junkyard: readonly VisibleObject[]
  /** Opens the junkyard's zone viewer. */
  readonly onOpenJunkyard: () => void
}

/**
 * A player's Attraction deck and junkyard, side by side in their command
 * zone rail (rules 717.2, 717.6a — beside the command zone, not zones of
 * their own): the deck a face-down pile with its count, the junkyard its
 * newest card face up with the count on it, opening every card in it. Each
 * half a card wide and squat, as the library is, so the rail keeps its
 * commander readable. Hovering the junkyard shows its top card full size.
 */
export function AttractionPiles({ player, deckSize, junkyard, onOpenJunkyard }: AttractionPilesProps) {
  const top = junkyard.at(-1) ?? null
  return (
    <div className="attraction-piles" data-attractions-of={player}>
      <div
        className={`card-back attraction-deck${deckSize === 0 ? ' empty' : ''}`}
        title={`Attraction deck: ${deckSize} card${deckSize === 1 ? '' : 's'} face down`}
        data-attraction-deck-count={deckSize}
      >
        <span className="card-back-count">{deckSize}</span>
      </div>
      <JunkyardPile top={top} count={junkyard.length} onOpen={onOpenJunkyard} />
    </div>
  )
}

function JunkyardPile({
  top,
  count,
  onOpen,
}: {
  readonly top: VisibleObject | null
  readonly count: number
  readonly onOpen: () => void
}) {
  const { wrapRef, popoverRef, open, handlers } = useHoverPopover<HTMLButtonElement>(top?.id)
  const name = top?.copyOf ?? top?.faceName ?? top?.cardName ?? ''
  const art = useCardArt(top?.art, name, { skip: top === null })
  return (
    <button
      type="button"
      className={`junkyard-pile${count === 0 ? ' empty' : ''}`}
      ref={wrapRef}
      title={count === 0 ? 'Junkyard: empty' : `Junkyard: ${count} card${count === 1 ? '' : 's'}`}
      data-junkyard-count={count}
      disabled={count === 0}
      onClick={onOpen}
      {...(top !== null ? handlers : {})}
    >
      {top !== null && art.ready ? <img src={art.src} alt="" loading="lazy" onError={art.onError} /> : null}
      <span className="junkyard-label">junkyard</span>
      <span className="junkyard-count">{count}</span>
      {open && top !== null
        ? createPortal(
            <div className="mini-tile-popover" ref={popoverRef}>
              <CardTile obj={top} />
            </div>,
            document.body,
          )
        : null}
    </button>
  )
}
