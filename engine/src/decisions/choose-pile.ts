/**
 * Choosing one of two piles (rule 700.3) — the second half of a
 * `separate-into-piles` effect: Fact or Fiction's "put one pile into your
 * hand", Liliana of the Veil's "the pile of their choice". With a face-down
 * pile (Curator of Destinies), the chooser sees what's in it only if they
 * looked at the cards.
 *
 * Raised by `Game`'s `askChoosePile`; the answer waits in
 * `GameState.pilesAnswer` for the effect to resume.
 */

import type { Action, LegalAction } from "../actions.js";
import { defineDecision } from "./define.js";
import { pileWhose, pileWorth } from "./shared/piles.js";

type Offer = Extract<LegalAction, { kind: "choose-pile" }>;

export const choosePile = defineDecision({
  kind: "choose-pile",

  hasSource: true,

  legal: (ctx, awaiting, player): LegalAction[] => {
    const all = awaiting.piles.flat();
    // A face-down pile is worth what the chooser can't see only to those
    // who looked (rule 700.3 leaves it face down).
    const hidden =
      awaiting.faceDown === true && !awaiting.lookers.includes(player) ? new Set(awaiting.piles[0]) : new Set<string>();
    const seen = all.filter((id) => !hidden.has(id));
    return [
      {
        kind: "choose-pile",
        source: awaiting.source,
        piles: awaiting.piles.map((pile) => [...pile]),
        separator: awaiting.separator,
        ...(awaiting.faceDown === true ? { faceDown: true } : {}),
        fates: awaiting.fates,
        worth: pileWorth(ctx, seen),
        whose: pileWhose(ctx, all),
      },
    ];
  },

  whyCannot: (ctx, action, player): string | null => {
    const asked = `${player} is not being asked to choose a pile`;
    if (action.type !== "choose-pile") return asked;
    const awaiting = ctx.state.awaiting;
    if (awaiting === null || awaiting.kind !== "choose-pile" || awaiting.player !== player) return asked;
    return Number.isInteger(action.pile) && action.pile >= 0 && action.pile < awaiting.piles.length
      ? null
      : `${action.pile} is not one of the piles`;
  },

  apply: (host, action): void => {
    if (action.type !== "choose-pile") return;
    host.applyChoosePile(action.player, action.pile);
  },

  ask: (controller, view, _awaiting, player): Action => {
    const offer = view.legalActions().find((a): a is Offer => a.kind === "choose-pile");
    if (offer === undefined) throw new Error(`${player} has no choose-pile offer`);
    return { type: "choose-pile", player, pile: controller.choosePile(view, offer) };
  },

  /** Each pile: the search sees what taking it does. */
  candidates: (legal, player): Action[] => {
    if (legal.kind !== "choose-pile") return [];
    return legal.piles.map((_, pile) => ({ type: "choose-pile", player, pile }));
  },

  randomAnswer: (legal, player, rng): Action => ({
    type: "choose-pile",
    player,
    pile: rng.pickIndex(legal.piles.length),
  }),
});
