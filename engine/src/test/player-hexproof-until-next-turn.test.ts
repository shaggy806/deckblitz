/**
 * "You gain hexproof until your next turn" (rule 702.11d on a player): a timed
 * static of the caster's with `playerKeywords`, lasting through the other
 * players' turns and ending as the caster's next turn begins (Blossoming
 * Calm). Rebound (702.88a) then grants it afresh at that upkeep.
 */
import { describe, expect, it } from "vitest";

import { playerHasKeyword } from "../characteristics.js";
import type { ScriptedController } from "../controller.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

import { A, B, cast, lands, life, ref, registryOf, settle, table, toHand, toStep, zone } from "./harness.js";

const hexproof = (game: Game, player: PlayerId): boolean => playerHasKeyword(game.state, registryOf(game), player, "hexproof");

const calm = (game: Game): ObjectId => {
  lands(game, "Plains", 1);
  const card = toHand(game, "Blossoming Calm");
  cast(game, card);
  return card;
};

const takeRebound = (seat: ScriptedController, card: ObjectId): void => {
  seat.chooseCastNowFn = (_view, offer) => {
    const way = offer.casts.find((c) => c.card === card);
    if (way === undefined) return null;
    return { type: "cast-spell", player: seat.playerId, card, targets: [], via: way.via, ...(offer.free ? { free: true } : {}) };
  };
};

describe("Blossoming Calm: you gain hexproof until your next turn", () => {
  it("gives its caster hexproof and 2 life, and only its caster", () => {
    const { game } = table();
    calm(game);
    expect(hexproof(game, A)).toBe(true);
    expect(hexproof(game, B)).toBe(false);
    expect(life(game, A)).toBe(22);
  });

  it("lasts through an opponent's turn: their Lightning Bolt can't target its caster", () => {
    const { game, a } = table();
    const card = calm(game);
    a.chooseCastNowFn = () => null;
    toStep(game, "precombat-main", B);
    expect(hexproof(game, A)).toBe(true);
    lands(game, "Mountain", 1, B);
    const bolt = toHand(game, "Lightning Bolt", B);
    expect(() => cast(game, bolt, { player: B, targets: [ref(A)] })).toThrow();
    // Ends as Alice's next turn begins; the declined rebound stays in exile.
    toStep(game, "upkeep", A);
    settle(game);
    expect(zone(game, card)).toBe("exile");
    expect(hexproof(game, A)).toBe(false);
  });

  it("rebound casts it again at that upkeep, for another round", () => {
    const { game, a } = table();
    const card = calm(game);
    expect(zone(game, card)).toBe("exile");
    takeRebound(a, card);
    toStep(game, "precombat-main", B);
    toStep(game, "upkeep", A);
    settle(game);
    expect(zone(game, card)).toBe("graveyard");
    expect(life(game, A)).toBe(24);
    toStep(game, "precombat-main", B);
    expect(hexproof(game, A)).toBe(true);
  });
});
