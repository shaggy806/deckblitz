/**
 * "As an additional cost to cast this spell, return X Swamps you control to
 * their owner's hand" — `additionalCost.returnToHandX` (Infernal Harvest). X
 * is announced as the spell is cast though the mana cost has no {X} (rule
 * 601.2b), capped by what there is to return (118.3), and that many go back
 * as the cost is paid (601.2h), chosen by the caster when there's a choice.
 */

import { describe, expect, it } from "vitest";

import { A, B, cast, hand, lands, life, pickPermanents, ref, spawn, table, toHand, zone } from "./harness.js";

const offerOf = (game: ReturnType<typeof table>["game"], name: string) => {
  const offer = game.legalActions(A).find((la) => la.kind === "cast-spell" && la.cardName === name);
  return offer?.kind === "cast-spell" ? offer : undefined;
};

describe("additional cost — return X permanents (Infernal Harvest)", () => {
  it("offers X up to the Swamps there are, and refuses more", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    lands(game, "Wastes", 2);
    const harvest = toHand(game, "Infernal Harvest");
    spawn(game, "Grizzly Bears", B);
    // The other lands pay the mana but aren't Swamps, so they don't count.
    expect(offerOf(game, "Infernal Harvest")?.xCost?.maxX).toBe(3);
    expect(
      game.canDispatch({ type: "cast-spell", player: A, card: harvest, targets: [], xValue: 4 }),
    ).not.toBeNull();
  });

  it("returns the chosen Swamps as it's cast, and deals X divided among the targets", () => {
    const { game, a } = table();
    const swamps = lands(game, "Swamp", 4);
    const bears = spawn(game, "Grizzly Bears", B);
    const elves = spawn(game, "Llanowar Elves", B);
    const harvest = toHand(game, "Infernal Harvest");
    const before = hand(game).length;
    const seen = pickPermanents(a, swamps[1], swamps[2], swamps[3]);
    cast(game, harvest, { x: 3, targets: [ref(bears), ref(elves)], division: [2, 1] });
    expect(seen.offered).toEqual(swamps);
    expect(zone(game, swamps[0])).toBe("battlefield");
    for (const swamp of swamps.slice(1)) expect(zone(game, swamp)).toBe("hand");
    // Out went the spell; in came three Swamps.
    expect(hand(game).length).toBe(before + 2);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, elves)).toBe("graveyard");
    expect(zone(game, harvest)).toBe("graveyard");
  });

  it("may return Swamps tapped for its own mana (rule 601.2h)", () => {
    const { game } = table();
    const swamps = lands(game, "Swamp", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Infernal Harvest"), { x: 2, targets: [ref(bears)], division: [2] });
    // Both paid {1}{B} and both went back: no choice, so nothing asked.
    for (const swamp of swamps) expect(zone(game, swamp)).toBe("hand");
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("at X = 0 returns nothing and targets nothing", () => {
    const { game } = table();
    const swamps = lands(game, "Swamp", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    const harvest = toHand(game, "Infernal Harvest");
    // One target per point of X at least (rule 601.2d).
    expect(
      game.canDispatch({ type: "cast-spell", player: A, card: harvest, targets: [ref(bears)], xValue: 0 }),
    ).not.toBeNull();
    cast(game, harvest, { x: 0, targets: [] });
    for (const swamp of swamps) expect(zone(game, swamp)).toBe("battlefield");
    expect(zone(game, bears)).toBe("battlefield");
    expect(life(game, B)).toBe(20);
  });

  it("costs {1}{B} whatever X is: X is no part of its mana cost", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    spawn(game, "Grizzly Bears", B);
    toHand(game, "Infernal Harvest");
    // Two Swamps pay {1}{B} alone, and X reaches 2 besides.
    expect(offerOf(game, "Infernal Harvest")?.xCost?.maxX).toBe(2);
  });
});
