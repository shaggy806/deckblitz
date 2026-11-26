/**
 * "… unless they pay {2} before that step" (Sabertooth Cobra, Glass Asp):
 * when a bot pays off a delayed ability it may stop (rule 116.2c,
 * `pay-delayed-deadline`). Its harm lands in the payer's own next turn, past
 * what a priority window's search plays out, so the search priced paying as
 * mana for nothing and never paid (six poison counters from three hits).
 * Every such ability punishes its payer, so the bot pays at its last window:
 * the end step of the turn before its own, or its own upkeep — with mana that
 * would untap, or go unspent, anyway.
 */

import type { Action, LegalAction } from "../actions.js";
import type { PlayerId } from "../primitives.js";
import { activePlayerOf, type GameState } from "../state.js";

/** The player whose turn comes next, as the turn order stands (an extra turn
 * aside). */
function nextInTurnOrder(state: GameState): PlayerId | undefined {
  const order = state.turnOrder.filter((p) => !state.players[p].hasLost);
  const at = order.indexOf(activePlayerOf(state));
  return at < 0 ? undefined : order[(at + 1) % order.length];
}

/** A `pay-delayed-deadline` to take now, or `null`. */
export function delayedDeadlineToPay(
  state: GameState,
  player: PlayerId,
  legal: readonly LegalAction[],
): Action | null {
  if (state.awaiting !== null || state.zones.shared.stack.length > 0) return null;
  const offer = legal.find((a) => a.kind === "pay-delayed-deadline");
  if (offer?.kind !== "pay-delayed-deadline") return null;
  const step = state.turn.step;
  const lastWindow =
    activePlayerOf(state) === player ? step === "upkeep" : step === "end" && nextInTurnOrder(state) === player;
  return lastWindow ? { type: "pay-delayed-deadline", player, delayed: offer.delayed } : null;
}
