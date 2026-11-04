/**
 * "Choose up to five {P} worth of modes" (rule 700.2i): any number of modes,
 * none included, whose pawprints add up to at most the budget, a mode
 * repeatable (700.2d), each copy with its own target. Offered through the same
 * `modeSets` as spree (702.172a), so every driver takes it as it is.
 */

import { describe, expect, it } from "vitest";

import { fitModeSet } from "../actions.js";
import type { LegalAction } from "../actions.js";
import { budgetedModeSets } from "../decisions/shared/subsets.js";
import { A, B, C, cast, counters, hand, lands, life, named, ref, spawn, table, toGraveyard, toHand, tokensNamed, zone } from "./harness.js";

type CastOffer = Extract<LegalAction, { kind: "cast-spell" }>;

const offerFor = (game: ReturnType<typeof table>["game"], card: string): CastOffer | undefined =>
  game.legalActions(A).find(
    (a): a is CastOffer => a.kind === "cast-spell" && game.state.objects[a.card]?.cardName === card,
  );

describe("budgetedModeSets", () => {
  it("every multiset within the budget: sixteen for {P}, {P}{P}, {P}{P}{P} at five", () => {
    const sets = budgetedModeSets([1, 2, 3], 5, [0, 1, 2]);
    expect(sets).toHaveLength(16);
    expect(sets[0]).toEqual([]);
    expect(sets).toContainEqual([0, 0, 0, 0, 0]);
    expect(sets).toContainEqual([1, 2]);
    expect(sets).not.toContainEqual([2, 2]);
    expect(sets).not.toContainEqual([0, 1, 2]);
  });

  it("only the usable modes", () => {
    expect(budgetedModeSets([1, 2, 3], 3, [1])).toEqual([[], [1]]);
  });

  it("a driver's fullest fit is five of the one mode it wants", () => {
    expect(fitModeSet(budgetedModeSets([1, 2, 3], 5, [0, 1, 2]), [0])).toEqual([0, 0, 0, 0, 0]);
  });
});

describe("pawprint modes (rule 700.2i)", () => {
  it("the offer: the budget, each mode's pawprints, every set; a mode with no target left out", () => {
    const { game } = table();
    lands(game, "Plains", 5);
    toHand(game, "Season of the Burrow");
    const offer = offerFor(game, "Season of the Burrow")!.castModal!;
    expect(offer.pawprintBudget).toBe(5);
    expect(offer.minModes).toBe(0);
    expect(offer.modes.map((m) => m.pawprints)).toEqual([1, 2, 3]);
    // Nothing in the graveyard, and A's lands aren't nonland permanents: only rabbits.
    expect(offer.modeSets).toEqual([[], [0], [0, 0], [0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0, 0]]);
  });

  it("five rabbits for five pawprints", () => {
    const { game } = table();
    lands(game, "Plains", 5);
    const season = toHand(game, "Season of the Burrow");
    cast(game, season, { modes: [0, 0, 0, 0, 0] });
    expect(tokensNamed(game, "Rabbit Token", A)).toBe(5);
  });

  it("no modes at all is a legal cast that does nothing (the Seasons' ruling)", () => {
    const { game } = table();
    lands(game, "Plains", 5);
    const season = toHand(game, "Season of the Burrow");
    const before = life(game, B);
    cast(game, season, { modes: [] });
    expect(zone(game, season)).toBe("graveyard");
    expect(life(game, B)).toBe(before);
  });

  it("six pawprints' worth is refused, though it's few enough modes", () => {
    const { game } = table();
    lands(game, "Plains", 5);
    const bears = spawn(game, "Grizzly Bears", B);
    const cub = spawn(game, "Grizzly Bears", A);
    const yard = toGraveyard(game, "Grizzly Bears");
    const season = toHand(game, "Season of the Burrow");
    expect(() =>
      cast(game, season, { modes: [2, 2], targets: [ref(yard), ref(yard)] }),
    ).toThrow(/pawprints/);
    expect(() =>
      cast(game, season, { modes: [1, 1, 1], targets: [ref(bears), ref(cub), ref(bears)] }),
    ).toThrow(/pawprints/);
  });

  it("each copy of a mode has its own target, and 'its controller' is each one's", () => {
    const { game } = table({ players: 3 });
    lands(game, "Plains", 5);
    const bears = spawn(game, "Grizzly Bears", B);
    const hers = spawn(game, "Hill Giant", C);
    const season = toHand(game, "Season of the Burrow");
    const handB = hand(game, B).length;
    const handC = hand(game, C).length;
    cast(game, season, { modes: [1, 1], targets: [ref(bears), ref(hers)] });
    expect(zone(game, bears)).toBe("exile");
    expect(zone(game, hers)).toBe("exile");
    expect(hand(game, B).length).toBe(handB + 1);
    expect(hand(game, C).length).toBe(handC + 1);
  });

  it("the modes run in printed order: the returned card comes back with an indestructible counter", () => {
    const { game } = table();
    lands(game, "Plains", 5);
    const yard = toGraveyard(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    const season = toHand(game, "Season of the Burrow");
    // Offered in the other order, the two-pawprint mode still goes first.
    cast(game, season, { modes: [2, 1], targets: [ref(giant), ref(yard)] });
    expect(zone(game, giant)).toBe("exile");
    expect(zone(game, yard)).not.toBe("graveyard");
    const [back] = named(game, "Grizzly Bears", A);
    expect(zone(game, back)).toBe("battlefield");
    expect(counters(game, back, "indestructible")).toBe(1);
  });

  it("a card of mana value 4 isn't a target of the third mode", () => {
    const { game } = table();
    lands(game, "Plains", 5);
    toGraveyard(game, "Serra Angel");
    toHand(game, "Season of the Burrow");
    const offer = offerFor(game, "Season of the Burrow")!.castModal!;
    expect(offer.modes[2].targetOptions[0]).toEqual([]);
  });

  it("Season of Loss: each player sacrifices, then the cards for what died, then the life", () => {
    const { game } = table();
    lands(game, "Swamp", 5);
    spawn(game, "Grizzly Bears", A);
    spawn(game, "Hill Giant", B);
    const season = toHand(game, "Season of Loss");
    const handBefore = hand(game, A).length - 1;
    const lifeB = life(game, B);
    // One creature each goes, and A's is what died under A's control: a card per draw mode.
    cast(game, season, { modes: [0, 1, 1] });
    expect(hand(game, A).length).toBe(handBefore + 2);
    expect(life(game, B)).toBe(lifeB);
  });

  it("Season of Loss: X counts the creature cards in your graveyard as that mode resolves", () => {
    const { game } = table();
    lands(game, "Swamp", 5);
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Hill Giant");
    spawn(game, "Serra Angel", A);
    spawn(game, "Hill Giant", B);
    const season = toHand(game, "Season of Loss");
    const lifeB = life(game, B);
    // The sacrifice goes first, so the Angel is in the graveyard for X.
    cast(game, season, { modes: [2, 0] });
    expect(life(game, B)).toBe(lifeB - 3);
    expect(life(game, A)).toBe(20);
  });
});
