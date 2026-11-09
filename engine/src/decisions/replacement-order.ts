/**
 * Which of several replacement or prevention effects applies first (rule
 * 616.1), asked of the affected player or the affected object's controller,
 * one effect at a time (616.1f), and only when the order can change what
 * happens. The options are named by the cards making the effects.
 *
 * Raised by `Game` where the event can still wait: before a resolving effect
 * or a combat-damage step deals its damage, a draw, a spell leaving the
 * stack. The answer waits in `GameState.replacementAnswers` for the event.
 */

import type { Action, LegalAction } from "../actions.js";
import { defineDecision } from "./define.js";

type Offer = Extract<LegalAction, { kind: "replacement-order" }>;

export const replacementOrder = defineDecision({
  kind: "replacement-order",

  hasSource: false,

  legal: (_ctx, awaiting): LegalAction[] => [
    {
      kind: "replacement-order",
      event: awaiting.event,
      options: awaiting.options,
      best: awaiting.best,
    },
  ],

  whyCannot: (ctx, action, player): string | null => {
    const asked = `${player} is not being asked which replacement applies first`;
    if (action.type !== "replacement-order") return asked;
    const awaiting = ctx.state.awaiting;
    if (awaiting === null || awaiting.kind !== "replacement-order" || awaiting.player !== player) return asked;
    return Number.isInteger(action.option) && action.option >= 0 && action.option < awaiting.options.length
      ? null
      : `${action.option} is not one of the effects`;
  },

  apply: (host, action): void => {
    if (action.type !== "replacement-order") return;
    host.applyReplacementOrder(action.player, action.option);
  },

  ask: (controller, view, _awaiting, player): Action => {
    const offer = view.legalActions().find((a): a is Offer => a.kind === "replacement-order");
    if (offer === undefined) throw new Error(`${player} has no replacement-order offer`);
    return { type: "replacement-order", player, option: controller.chooseReplacementOrder(view, offer) };
  },

  // No `candidates`: the engine's own best order is what the searching bots
  // have always played, and the bot's evaluation can't tell a shield kept
  // from a shield spent. `AutomaticController` answers `best`.

  randomAnswer: (legal, player, rng): Action => ({
    type: "replacement-order",
    player,
    option: rng.pickIndex(legal.options.length),
  }),
});
