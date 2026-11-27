/**
 * "Spend only colored mana on X. No more than one mana of each color may be
 * spent this way" (Emblazoned Golem's kicker {X}): `xSpendOnly: { colored:
 * true, distinct: true }` — X paid as X symbols, each any one colour, no two
 * the same (`HybridOption.distinct`, settled in `resolveHybridCost`), so X is
 * at most 5 and never paid with colorless mana.
 */
import { describe, expect, it } from "vitest";
import type { Game } from "../game.js";
import type { LegalAction } from "../actions.js";
import type { ObjectId } from "../primitives.js";
import { A, cast, counters, lands, table, toHand, zone } from "./harness.js";

const kickedOffer = (game: Game, card: ObjectId): Extract<LegalAction, { kind: "cast-spell" }> | undefined => {
  for (const action of game.legalActions(A)) {
    if (action.kind === "cast-spell" && action.card === card && action.kicked === true) return action;
  }
  return undefined;
};

const spentTypes = (game: Game, id: ObjectId): string[] =>
  (game.state.objects[id].manaSpent ?? []).map((unit) => unit.type).sort();

describe("Emblazoned Golem — kicker {X}, one mana of each colour on X", () => {
  it("X = 3 from three colours, the {2} from the rest, and three +1/+1 counters", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    lands(game, "Island", 1);
    lands(game, "Swamp", 1);
    lands(game, "Wastes", 2);
    const golem = toHand(game, "Emblazoned Golem");
    cast(game, golem,{ x: 3, kicked: true });
    expect(zone(game, golem)).toBe("battlefield");
    expect(counters(game, golem)).toBe(3);
    expect(spentTypes(game, golem)).toEqual(["B", "C", "C", "U", "W"]);
  });

  it("two mana of one colour can't both go on X", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    lands(game, "Wastes", 2);
    const golem = toHand(game, "Emblazoned Golem");
    expect(() => cast(game, golem,{ x: 2, kicked: true })).toThrow(/pay|mana|afford/i);
    // One Forest on X, the other on the {2} with a Wastes.
    cast(game, golem,{ x: 1, kicked: true });
    expect(counters(game, golem)).toBe(1);
  });

  it("colorless mana never pays X", () => {
    const { game } = table();
    lands(game, "Wastes", 4);
    const golem = toHand(game, "Emblazoned Golem");
    expect(() => cast(game, golem,{ x: 1, kicked: true })).toThrow(/pay|mana|afford/i);
  });

  it("offers X only as high as the colours there are", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    lands(game, "Mountain", 3);
    const golem = toHand(game, "Emblazoned Golem");
    // {2} from two of them, X from one Forest and one Mountain.
    expect(kickedOffer(game, golem)?.xCost?.maxX).toBe(2);
  });

  it("five colours pay X = 5", () => {
    const { game } = table();
    for (const land of ["Plains", "Island", "Swamp", "Mountain", "Forest"]) lands(game, land, 1);
    lands(game, "Forest", 2);
    const golem = toHand(game, "Emblazoned Golem");
    cast(game, golem,{ x: 5, kicked: true });
    expect(counters(game, golem)).toBe(5);
  });

  it("unkicked, it's a 1/2 for {2}", () => {
    const { game } = table();
    lands(game, "Wastes", 2);
    const golem = toHand(game, "Emblazoned Golem");
    cast(game, golem,{});
    expect(zone(game, golem)).toBe("battlefield");
    expect(counters(game, golem)).toBe(0);
  });
});
