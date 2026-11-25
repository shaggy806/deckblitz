/**
 * Where the X prompt starts for a spell: the value its Confirm takes if the
 * player changes nothing, so never one that spends what they would not have
 * spent by choice.
 *
 * - Paid in mana: as much as can be paid. The lands are there to be spent.
 * - Paid in life (Fire Covenant, Toxic Deluge): the least that does anything.
 *   Started at the most, Confirm paid a player's whole life total and ended
 *   their game (found by hand, 2026-11-22).
 * - With delve (Logic Knot), or a March's cards from hand: the most that mana
 *   alone pays. The offer's largest X counts every card delve could exile
 *   (rule 702.66a), and at that X all of them are needed, so the prompt goes
 *   straight on without asking which: Confirm exiled the whole graveyard (a
 *   bot did it in a live game, 2026-11-24, and the prompt would have for a
 *   player). Raising X is the player's choice, and asks which cards.
 */
export function startingX(
  xCost: { readonly maxX: number; readonly minX?: number; readonly paidInLife?: true },
  delve?: { readonly byX?: readonly { readonly minCards: number }[] },
): number {
  const least = xCost.minX ?? 0
  if (xCost.paidInLife === true) return Math.min(xCost.maxX, Math.max(least, 1))
  const byX = delve?.byX
  if (byX === undefined) return xCost.maxX
  let byMana = least
  for (let x = least; x <= xCost.maxX && x < byX.length; x += 1) if (byX[x].minCards <= 0) byMana = x
  return Math.min(xCost.maxX, byMana)
}
