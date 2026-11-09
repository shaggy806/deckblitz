/**
 * Rule 601.2f: the total cost is fixed once targets are chosen. Where a spell
 * is affordable only with what its targets take off it, the offer says so: how
 * many of the earning targets it takes, and only targets that can pay.
 */

import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import { fitCastTargets } from "../controller.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, lands, ref, registryOf, spawn, table, toHand } from "./harness.js";

type CastOffer = Extract<LegalAction, { kind: "cast-spell" }>;

const offerOf = (game: Game, card: ObjectId): CastOffer | undefined =>
  game.legalActions(A).find((o): o is CastOffer => o.kind === "cast-spell" && o.card === card);

describe("a spell needing two target-keyed reductions at once", () => {
  /** Cone of Flame ({3}{R}{R}) and two Mountains: with two Spellwild Ouphes
   * among its targets it's {R}{R}; with one, {1}{R}{R}. */
  const board = () => {
    const { game } = table();
    const ouphes = [spawn(game, "Spellwild Ouphe", B), spawn(game, "Spellwild Ouphe", B)];
    lands(game, "Mountain", 2);
    const cone = toHand(game, "Cone of Flame");
    return { game, ouphes, cone };
  };

  it("says how many it takes", () => {
    const { game, ouphes, cone } = board();
    const offer = offerOf(game, cone)!;
    expect(offer.reducingTargets).toEqual(expect.arrayContaining(ouphes));
    expect(offer.reducingTargetsAtLeast).toBe(2);
  });

  it("lets a driver name both", () => {
    const { game, ouphes, cone } = board();
    const offer = offerOf(game, cone)!;
    const spec = registryOf(game).get("Cone of Flame").targets;
    const fitted = fitCastTargets(offer, [ref(B), null, null], offer.targetOptions, spec);
    expect(fitted).not.toBeNull();
    const named = fitted!.filter((t) => t?.kind === "object" && ouphes.includes(t.object));
    expect(named).toHaveLength(2);
    expect(game.canDispatch({ type: "cast-spell", player: A, card: cone, targets: [ref(ouphes[0]), ref(ouphes[1]), ref(B)] })).toBeNull();
  });

  it("refuses naming only one", () => {
    const { game, ouphes, cone } = board();
    expect(game.canDispatch({ type: "cast-spell", player: A, card: cone, targets: [ref(ouphes[0]), ref(B), null] })).not.toBeNull();
  });

  it("asks for one when one is enough", () => {
    const { game, cone } = board();
    lands(game, "Mountain", 1);
    expect(offerOf(game, cone)!.reducingTargetsAtLeast).toBeUndefined();
  });
});

