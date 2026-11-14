/**
 * Choosing one permanent or player as an effect resolves, with no targeting
 * — Comet, Stellar Pup's "Comet deals damage equal to the number of loyalty
 * counters on him to a creature or player". An instruction that doesn't say
 * "target" is carried out as it applies (rule 608.2c), so the choice is made
 * then, among whatever qualifies then: a hexproof creature or a shrouded
 * player can be chosen, and nothing chosen can make the ability fizzle.
 *
 * The raise is `Game.beginChoosePermanentOrPlayer`, reached from a
 * `choose-permanents` effect with `orPlayers`; the answer applies that
 * effect's `then` to the one chosen as target 0.
 */

import type { Action, LegalAction } from "../actions.js";
import { sameTargetRef } from "../target.js";
import { slotPolarities } from "../target-polarity.js";
import { defineDecision } from "./define.js";

type Offer = Extract<LegalAction, { kind: "choose-permanent-or-player" }>;

export const choosePermanentOrPlayer = defineDecision({
  kind: "choose-permanent-or-player",

  hasSource: true,

  legal: (_ctx, awaiting): LegalAction[] => [
    {
      kind: "choose-permanent-or-player",
      source: awaiting.source,
      eligible: [...awaiting.eligible],
      prompt: awaiting.prompt,
      polarity: slotPolarities(awaiting.then, 1)[0] ?? "either",
    },
  ],

  whyCannot: (ctx, action, player): string | null => {
    const asked = `${player} is not being asked to choose a permanent or player`;
    if (action.type !== "choose-permanent-or-player") return asked;
    const awaiting = ctx.state.awaiting;
    if (awaiting === null || awaiting.kind !== "choose-permanent-or-player" || awaiting.player !== player) {
      return asked;
    }
    return awaiting.eligible.some((ref) => sameTargetRef(ref, action.choice))
      ? null
      : `${action.choice.kind === "player" ? action.choice.player : action.choice.kind === "object" ? action.choice.object : "that"} can't be chosen`;
  },

  apply: (host, action): void => {
    if (action.type !== "choose-permanent-or-player") return;
    host.applyChoosePermanentOrPlayer(action.player, action.choice);
  },

  ask: (controller, view, _awaiting, player): Action => {
    const offer = view.legalActions().find((a): a is Offer => a.kind === "choose-permanent-or-player");
    if (offer === undefined) throw new Error(`${player} has no choose-permanent-or-player offer`);
    return { type: "choose-permanent-or-player", player, choice: controller.choosePermanentOrPlayer(view, offer) };
  },

  /** Which one is the whole question: each, in the offer's ranking for the
   * effect's side (an opponent and their best permanents first for harm),
   * as many as the search allows. */
  candidates: (legal, player, limit, helpers): Action[] => {
    if (legal.kind !== "choose-permanent-or-player") return [];
    const objects = legal.eligible.flatMap((ref) => (ref.kind === "object" ? [ref.object] : []));
    const ordered = helpers.order(objects);
    const players = legal.eligible.filter((ref) => ref.kind === "player");
    const mine = players.filter((ref) => ref.kind === "player" && ref.player === player);
    const theirs = players.filter((ref) => ref.kind === "player" && ref.player !== player);
    const objectRefs = ordered.map((object) => ({ kind: "object" as const, object }));
    const ranked =
      legal.polarity === "help"
        ? [...mine, ...objectRefs.filter((r) => helpers.controllerOf(r.object) === player), ...objectRefs, ...theirs]
        : [...theirs, ...objectRefs.filter((r) => helpers.controllerOf(r.object) !== player), ...objectRefs, ...mine];
    const seen: typeof ranked = [];
    for (const ref of ranked) if (!seen.some((s) => sameTargetRef(s, ref))) seen.push(ref);
    return seen
      .slice(0, Math.max(2, limit))
      .map((choice) => ({ type: "choose-permanent-or-player", player, choice }));
  },

  randomAnswer: (legal, player, rng): Action => ({
    type: "choose-permanent-or-player",
    player,
    choice: legal.eligible[rng.pickIndex(legal.eligible.length)],
  }),
});
