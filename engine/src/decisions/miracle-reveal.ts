/**
 * Miracle's reveal (rule 702.94a): "You may reveal this card from your hand
 * as you draw it if it's the first card you've drawn this turn. When you
 * reveal this card this way, you may cast it by paying [cost] rather than its
 * mana cost."
 *
 * The draw queues the miracle trigger unrevealed (`PendingTrigger.miracle`);
 * before it would go on the stack, `placePendingTriggers` asks its owner
 * whether to reveal the card. Asked then rather than mid-draw — the same
 * answer, since nothing between the draw and the trigger's placing can see
 * whether the card was revealed, and a card that has left the hand by then
 * isn't asked about at all (its trigger couldn't cast it). Yes reveals it to
 * every player and the trigger goes on the stack; no drops the trigger. The
 * cast itself is the trigger's, offered as it resolves (`cast-now`).
 *
 * The same question, with `by` and no cost, is God-Eternal Kefnet's "you may
 * reveal the first card you draw each turn as you draw it" (a `revealsDrawn`
 * trigger, `PendingTrigger.miracle.card`): asked of a card that has left the
 * hand since too, for the reveal was as it was drawn, and the trigger copies
 * it by last-known information (the ruling).
 */

import type { Action, LegalAction } from "../actions.js";
import { defineDecision } from "./define.js";

export const miracleReveal = defineDecision({
  kind: "miracle-reveal",

  // No source: the drawn card is still a hidden card in hand, so naming it
  // to every seat (`decisionSource`) would reveal it before its owner says.
  // The asked player's own view shows it by `source`.
  hasSource: false,

  legal: (_ctx, awaiting): LegalAction[] => [
    {
      kind: "miracle-reveal",
      source: awaiting.source,
      ...(awaiting.cost !== undefined ? { cost: awaiting.cost } : {}),
      ...(awaiting.by !== undefined ? { by: awaiting.by } : {}),
    },
  ],

  whyCannot: (ctx, action, player): string | null => {
    const asked = `${player} is not being asked about a miracle`;
    if (action.type !== "miracle-reveal") return asked;
    const awaiting = ctx.state.awaiting;
    if (awaiting === null || awaiting.kind !== "miracle-reveal" || awaiting.player !== player) return asked;
    return null;
  },

  apply: (host, action): void => {
    if (action.type !== "miracle-reveal") return;
    host.applyMiracleReveal(action.player, action.reveal);
  },

  ask: (controller, view, awaiting, player): Action => ({
    type: "miracle-reveal",
    player,
    reveal: controller.revealMiracle(view, awaiting.source, awaiting.cost),
  }),

  // Both answers: revealing only offers the cast, which the trigger asks
  // again as it resolves.
  candidates: (legal, player): Action[] => {
    if (legal.kind !== "miracle-reveal") return [];
    return [true, false].map((reveal) => ({ type: "miracle-reveal", player, reveal }));
  },

  // Mostly revealed, so the fuzzer plays the miracle casts.
  randomAnswer: (_legal, player, rng): Action => ({
    type: "miracle-reveal",
    player,
    reveal: rng.random() < 0.8,
  }),
});
