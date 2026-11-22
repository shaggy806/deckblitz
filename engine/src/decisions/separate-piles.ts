/**
 * Separating objects into two piles (rule 700.3) — Fact or Fiction's
 * opponent, Liliana of the Veil's −6, Curator of Destinies' face-down and
 * face-up piles — or three (`pileCount`: Whims of the Fates). The first half
 * of a `separate-into-piles` effect: every object goes into exactly one pile,
 * any may be empty (700.3a, 700.3d), and the objects stay where they are
 * meanwhile (700.3c). The chooser then chooses a pile (`choose-pile`), or one
 * is picked at random (`atRandom`).
 *
 * Raised by `Game`'s `askSeparatePiles`; the answer waits in
 * `GameState.pilesAnswer` for the effect to resume.
 */

import type { Action, LegalAction } from "../actions.js";
import type { ObjectId } from "../primitives.js";
import { defineDecision } from "./define.js";
import { bestSeparationFor, pileWhose, pileWorth, whyNotTwoPiles } from "./shared/piles.js";

type Offer = Extract<LegalAction, { kind: "separate-piles" }>;

export const separatePiles = defineDecision({
  kind: "separate-piles",

  hasSource: true,

  legal: (ctx, awaiting): LegalAction[] => [
    {
      kind: "separate-piles",
      source: awaiting.source,
      objects: [...awaiting.objects],
      chooser: awaiting.chooser,
      ...(awaiting.anOpponentChooses === true ? { anOpponentChooses: true } : {}),
      ...(awaiting.faceDown !== undefined ? { faceDown: awaiting.faceDown } : {}),
      ...(awaiting.pileCount !== undefined ? { pileCount: awaiting.pileCount } : {}),
      ...(awaiting.atRandom === true ? { atRandom: true } : {}),
      fates: awaiting.fates,
      worth: pileWorth(ctx, awaiting.objects),
      whose: pileWhose(ctx, awaiting.objects, awaiting.fates, awaiting.source),
    },
  ],

  whyCannot: (ctx, action, player): string | null => {
    const asked = `${player} is not being asked to separate piles`;
    if (action.type !== "separate-piles") return asked;
    const awaiting = ctx.state.awaiting;
    if (awaiting === null || awaiting.kind !== "separate-piles" || awaiting.player !== player) return asked;
    return whyNotTwoPiles(awaiting.objects, action.piles, player, awaiting.pileCount ?? 2);
  },

  apply: (host, action): void => {
    if (action.type !== "separate-piles") return;
    host.applySeparatePiles(action.player, action.piles);
  },

  ask: (controller, view, _awaiting, player): Action => {
    const offer = view.legalActions().find((a): a is Offer => a.kind === "separate-piles");
    if (offer === undefined) throw new Error(`${player} has no separate-piles offer`);
    return { type: "separate-piles", player, piles: controller.separatePiles(view, offer) };
  },

  /**
   * The split best against the chooser's best reply (an even one, for a
   * pile chosen at random), then everything in one pile each way — the
   * search weighs what the chooser actually does with each.
   */
  candidates: (legal, player): Action[] => {
    if (legal.kind !== "separate-piles") return [];
    const best = bestSeparationFor(legal, player);
    const count = legal.pileCount ?? 2;
    const allIn = (k: number): ObjectId[][] =>
      Array.from({ length: count }, (_, i) => (i === k ? [...legal.objects] : []));
    const answers = [best, allIn(count - 1), allIn(0)];
    const seen = new Set<string>();
    return answers
      .filter((piles) => {
        const key = piles.map((p) => [...p].sort().join(",")).join("|");
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .map((piles) => ({ type: "separate-piles", player, piles }));
  },

  randomAnswer: (legal, player, rng): Action => {
    const count = legal.pileCount ?? 2;
    if (count === 2) {
      const piles: ObjectId[][] = [[], []];
      for (const id of legal.objects) piles[rng.random() < 0.5 ? 0 : 1].push(id);
      return { type: "separate-piles", player, piles };
    }
    const piles = Array.from({ length: count }, (): ObjectId[] => []);
    for (const id of legal.objects) piles[rng.pickIndex(count)].push(id);
    return { type: "separate-piles", player, piles };
  },
});
