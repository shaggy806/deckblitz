import type { ObjectId } from 'engine/client'
import { useCardArt } from './useCardArt.ts'
import { useArtCreditText } from './artistCredit.ts'
import type { SeatClass } from '../format.ts'

/** A Curse attached to a player, as their panel shows it. */
export interface CurseOnPlayer {
  readonly id: ObjectId
  readonly name: string
  readonly art: string | null
  /** The Curse's controller's seat colour class and display name. */
  readonly controllerClass: SeatClass
  readonly controllerLabel: string
}

/**
 * A Curse on this player (rule 303.4 — "Enchant player"), as a chip in their
 * panel's header: the card's art in a ring of its controller's seat colour,
 * like a commander-damage chip. The Curse itself is a permanent on its
 * controller's board, where it's hovered, targeted and clicked like any
 * other; this is so the player it's on can be seen to be cursed, and by whom.
 */
export function CurseChip({ curse }: { readonly curse: CurseOnPlayer }) {
  const art = useCardArt(curse.art, curse.name)
  const credit = useArtCreditText(curse.art, curse.name)
  const title = `${curse.name} (${curse.controllerLabel}'s) is enchanting this player
${credit}`
  return (
    <span className={`cmdr-dmg pp-curse ${curse.controllerClass}`} title={title} aria-label={title}>
      <span className="cmdr-dmg-art">
        {art.ready ? <img src={art.src} alt="" loading="lazy" onError={art.onError} /> : null}
      </span>
      <span className="pp-curse-mark" aria-hidden="true">
        ✶
      </span>
    </span>
  )
}
