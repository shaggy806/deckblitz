import { COMMANDER_DAMAGE_LETHAL } from 'engine/client'
import type { CommanderDamage } from 'engine/client'
import { useCardArt } from './useCardArt.ts'
import { useArtCreditText } from './artistCredit.ts'
import type { SeatClass } from '../format.ts'

/** Commander damage from one commander at or past which the chip warns, then
 * alarms — 21 loses (rule 903.10a), and one more hit from a typical
 * commander gets there from 15. */
const WARN_AT = 15
const DANGER_AT = 18

/**
 * Combat damage one commander has dealt this player, as a compact badge in
 * their panel's header: the commander's art in a ring of its owner's seat
 * colour, and the running total. It reads amber from 15 and red from 18 of
 * the 21 that loses the game, so a player about to die to a commander is
 * visible from across the table without reading any numbers.
 *
 * One chip per *commander*, not per opponent — Partners are counted
 * separately (see the engine's `PlayerState.commanderDamageTaken`).
 */
export function CommanderDamageChip({
  damage,
  ownerClass,
  ownerLabel,
}: {
  readonly damage: CommanderDamage
  /** The commander's owner's seat colour class. */
  readonly ownerClass: SeatClass
  readonly ownerLabel: string
}) {
  const art = useCardArt(damage.art, damage.name)
  const credit = useArtCreditText(damage.art, damage.name)

  const level =
    damage.amount >= DANGER_AT ? ' danger' : damage.amount >= WARN_AT ? ' warn' : ''
  const left = COMMANDER_DAMAGE_LETHAL - damage.amount
  const title =
    `${damage.amount} combat damage from ${damage.name} (${ownerLabel}'s commander)` +
    (left > 0 ? ` — ${left} more loses` : '') +
    `
${credit}`

  return (
    <span className={`cmdr-dmg ${ownerClass}${level}`} title={title} aria-label={title} data-tour="game-commander-damage">
      <span className="cmdr-dmg-art">
        {art.ready ? <img src={art.src} alt="" loading="lazy" onError={art.onError} /> : null}
      </span>
      <span className="cmdr-dmg-amount">{damage.amount}</span>
    </span>
  )
}
