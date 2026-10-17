/**
 * Time travel (rule 701.56a) — for each permanent you control with a time
 * counter on it and each suspended card you own with one, put a time counter
 * on it, remove one from it, or leave it be.
 *
 * One decision for every object, not one per object: the rulings say the
 * changes "all happen simultaneously", so nothing may happen between one
 * choice and the next. The answer is two disjoint subsets of `eligible`,
 * either or both empty — leaving everything alone is a legal answer.
 *
 * No `candidates`: v2 takes v1's answer (`chooseTimeTravel` — a suspended
 * card closer to being cast, a vanishing permanent kept longer).
 */

import type { Action, LegalAction } from "../actions.js";
import type { ObjectId } from "../primitives.js";
import { defineDecision } from "./define.js";

export const timeTravel = defineDecision({
  kind: "time-travel",

  hasSource: true,

  legal: (_ctx, awaiting): LegalAction[] => [{ kind: "time-travel", eligible: [...awaiting.eligible] }],

  whyCannot: (ctx, action, player): string | null => {
    if (action.type !== "time-travel") return `${player} is not being asked to time travel`;
    const awaiting = ctx.state.awaiting;
    if (awaiting === null || awaiting.kind !== "time-travel" || awaiting.player !== player) {
      return `${player} is not being asked to time travel`;
    }
    const eligible = new Set(awaiting.eligible);
    const seen = new Set<string>();
    for (const id of [...action.add, ...action.remove]) {
      if (!eligible.has(id)) return `${id} has no time counter to time travel with`;
      if (seen.has(id)) return `${player} chose ${id} twice`;
      seen.add(id);
    }
    // No length check: "you may" for each, so none at all is an answer.
    return null;
  },

  apply: (host, action): void => {
    if (action.type !== "time-travel") return;
    host.applyTimeTravel(action.player, action.add, action.remove);
  },

  ask: (controller, view, awaiting, player): Action => ({
    type: "time-travel",
    player,
    ...controller.chooseTimeTravel(view, awaiting.eligible),
  }),

  // Each object independently: add, remove or neither, a third each.
  randomAnswer: (legal, player, rng): Action => {
    const add: ObjectId[] = [];
    const remove: ObjectId[] = [];
    for (const id of legal.eligible) {
      const roll = rng.random();
      if (roll < 1 / 3) add.push(id);
      else if (roll < 2 / 3) remove.push(id);
    }
    return { type: "time-travel", player, add, remove };
  },
});
