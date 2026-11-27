/**
 * The mana a cumulative upkeep's payment spent (rule 702.24a), announced with
 * its `cumulative-upkeep-paid` and read by a trigger on it as the mana "spent
 * this way": Balduvian Fallen's "+1/+0 until end of turn for each {B} or {R}
 * spent this way" (`{ manaSpentOf: "this-ability" }`).
 */
import { describe, expect, it } from "vitest";
import { counters, lands, nextTurn, pickModes, pt, spawn, table, zone } from "./harness.js";

describe("Balduvian Fallen — +1/+0 for each {B} or {R} spent on its cumulative upkeep", () => {
  it("counts the black and red mana that paid it", () => {
    const { game, a } = table();
    const fallen = spawn(game, "Balduvian Fallen");
    lands(game, "Swamp", 1);
    pickModes(a, 0);
    nextTurn(game);
    nextTurn(game, "upkeep");
    game.advanceUntil((s) => s.turn.step === "draw");
    // One age counter, {1} paid with the Swamp's {B}.
    expect(counters(game, fallen, "age")).toBe(1);
    expect(pt(game, fallen)).toEqual({ power: 4, toughness: 5 });
  });

  it("counts none for other mana", () => {
    const { game, a } = table();
    const fallen = spawn(game, "Balduvian Fallen");
    lands(game, "Forest", 1);
    pickModes(a, 0);
    nextTurn(game);
    nextTurn(game, "upkeep");
    game.advanceUntil((s) => s.turn.step === "draw");
    expect(zone(game, fallen)).toBe("battlefield");
    expect(pt(game, fallen)).toEqual({ power: 3, toughness: 5 });
  });

  it("counts every {B} and {R} of a payment for several age counters", () => {
    const { game, a } = table();
    const fallen = spawn(game, "Balduvian Fallen");
    lands(game, "Swamp", 1);
    lands(game, "Mountain", 1);
    pickModes(a, 0);
    nextTurn(game);
    nextTurn(game);
    nextTurn(game);
    nextTurn(game, "upkeep");
    game.advanceUntil((s) => s.turn.step === "draw");
    // Two age counters, {2}, paid with {B}{R}: +2/+0.
    expect(counters(game, fallen, "age")).toBe(2);
    expect(pt(game, fallen)).toEqual({ power: 5, toughness: 5 });
  });
});
