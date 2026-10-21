import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, cast, destroy, hand, lands, life, ref, spawn, table, toHand, tokensNamed, zone } from "./harness.js";

// Spectacle (rule 702.137a): "You may pay [cost] rather than pay this
// spell's mana cost" if an opponent lost life this turn — an alternative cost
// whose spell then answers "if its spectacle cost was paid". Afterlife N
// (702.135a): "When this permanent dies, create N 1/1 white and black Spirit
// creature tokens with flying."

const altOffers = (game: Game, card: ObjectId) =>
  game.legalActions(A).filter((a) => a.kind === "cast-spell" && a.card === card && a.altCost === true);

describe("spectacle", () => {
  it("is offered only once an opponent has lost life this turn, labelled with its cost", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    const skewer = toHand(game, "Skewer the Critics");
    expect(altOffers(game, skewer)).toHaveLength(0);
    const shock = toHand(game, "Shock");
    lands(game, "Mountain", 1);
    cast(game, shock, { targets: [ref(B)] });
    expect(life(game, B)).toBe(18);
    const offer = altOffers(game, skewer);
    expect(offer).toHaveLength(1);
    expect(offer[0]).toMatchObject({ altCostText: "spectacle {R}" });
    lands(game, "Mountain", 1);
    cast(game, skewer, { targets: [ref(B)], altCost: true });
    expect(life(game, B)).toBe(15);
  });

  it("Rafter Demon: the enters trigger needs its spectacle cost to have been paid", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    lands(game, "Mountain", 3);
    const demon = toHand(game, "Rafter Demon");
    const before = hand(game, B).length;
    cast(game, demon);
    expect(zone(game, demon)).toBe("battlefield");
    expect(hand(game, B).length).toBe(before);
    // A second Demon for its spectacle cost after the opponent lost life.
    game.debugApplyEffect(A, { kind: "lose-life", amount: 1, who: "each-opponent" });
    const second = toHand(game, "Rafter Demon");
    lands(game, "Swamp", 2);
    lands(game, "Mountain", 3);
    cast(game, second, { altCost: true });
    expect(hand(game, B).length).toBe(before - 1);
  });
});

describe("afterlife", () => {
  it("makes N flying Spirits when it dies", () => {
    const { game } = table();
    const transport = spawn(game, "Debtors' Transport");
    destroy(game, transport);
    expect(tokensNamed(game, "Spirit Token (White-Black)", A)).toBe(2);
  });
});
