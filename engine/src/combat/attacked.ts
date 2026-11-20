/**
 * Who is being attacked: the players, not their planeswalkers or battles
 * (rule 802.4 tells "more than one player is being attacked" apart from
 * "controls a planeswalker that's being attacked").
 *
 * A player the active player declared a creature attacking at this combat
 * (rule 508.1b; `PlayerState.attackedThisCombat`, melee's record) stays
 * attacked though that creature leaves combat — rule 506.4 lets a
 * planeswalker or battle stop being attacked, never a player. A creature put
 * onto the battlefield attacking a player (rule 508.4) makes that player one
 * too, from then on, though it never "attacked" (508.3b).
 */

import type { PlayerId } from "../primitives.js";
import { activePlayerOf } from "../state.js";
import type { GameState } from "../state.js";
import { PHASE_OF_STEP } from "../turn.js";

/** The players being attacked now, in turn order from the active player,
 * leaving out any who have lost. Nobody outside a combat phase, or in a
 * combat before its attackers are declared. */
export function playersBeingAttacked(state: GameState): PlayerId[] {
  const turn = state.turn;
  if (PHASE_OF_STEP[turn.step] !== "combat") return [];
  const active = activePlayerOf(state);
  const attacked = new Set<PlayerId>();
  const record = state.players[active]?.attackedThisCombat;
  if (record !== undefined && record.combat.turn === turn.number && record.combat.phase === (turn.combatPhases ?? 1)) {
    for (const p of record.players) attacked.add(p);
  }
  for (const id of state.zones.shared.battlefield) {
    const at = state.objects[id]?.attacking;
    if (at !== null && at !== undefined && state.players[at as PlayerId] !== undefined) attacked.add(at as PlayerId);
  }
  const from = state.turnOrder.indexOf(active);
  const order = [...state.turnOrder.slice(from), ...state.turnOrder.slice(0, from)];
  return order.filter((p) => attacked.has(p) && state.players[p]?.hasLost === false);
}
