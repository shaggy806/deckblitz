/**
 * An "exile N cards from your graveyard" cost that may take its own source
 * (`exileFromGraveyard.includingSource`): Salvage Titan's "Exile three
 * artifact cards from your graveyard: Return this card from your graveyard
 * to your hand", whose ruling lets the Titan be one of the three, in which
 * case it isn't returned (rule 400.7: the card in exile is a new object).
 * Without the flag the source never pays (Moorland Haunt's tests).
 */
import { describe, expect, it } from "vitest";

import { A, activate, cast, hand, pickFromZone, spawn, table, toGraveyard, toHand, zone } from "./harness.js";

const canActivate = (game: ReturnType<typeof table>["game"], source: string, index = 0): boolean =>
  game.legalActions(A).some((x) => x.kind === "activate-ability" && x.source === source && x.abilityIndex === index);

describe("a graveyard exile cost that may take its source (Salvage Titan)", () => {
  it("counts the Titan itself: two other artifacts are enough, and then it stays in exile", () => {
    const { game } = table();
    const titan = toGraveyard(game, "Salvage Titan");
    const one = toGraveyard(game, "Ornithopter");
    expect(canActivate(game, titan)).toBe(false);
    const two = toGraveyard(game, "Memnite");
    toGraveyard(game, "Wastes");
    expect(canActivate(game, titan)).toBe(true);
    activate(game, titan);
    // No choice: exactly three artifact cards, the Titan among them.
    expect([zone(game, titan), zone(game, one), zone(game, two)]).toEqual(["exile", "exile", "exile"]);
    expect(hand(game)).not.toContain(titan);
  });

  it("offers the Titan among the cards, and returns it when it's left in the graveyard", () => {
    const { game, a } = table();
    const titan = toGraveyard(game, "Salvage Titan");
    const others = [toGraveyard(game, "Ornithopter"), toGraveyard(game, "Memnite"), toGraveyard(game, "Sol Ring")];
    const seen = pickFromZone(a, ...others);
    activate(game, titan);
    expect([...seen.offered].sort()).toEqual([titan, ...others].sort());
    for (const id of others) expect(zone(game, id)).toBe("exile");
    expect(zone(game, titan)).toBe("hand");
  });

  it("is cast for its alternative cost, three artifacts sacrificed", () => {
    const { game } = table();
    const fodder = [spawn(game, "Ornithopter"), spawn(game, "Memnite"), spawn(game, "Sol Ring")];
    const titan = toHand(game, "Salvage Titan");
    cast(game, titan, { altCost: true });
    expect(zone(game, titan)).toBe("battlefield");
    for (const id of fodder) expect(zone(game, id)).toBe("graveyard");
  });
});
