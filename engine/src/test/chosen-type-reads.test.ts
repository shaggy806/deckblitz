/**
 * "Of the chosen type" read by a static's other halves — an entering
 * replacement (Metallic Mimic's "each other creature you control of the
 * chosen type enters with an additional +1/+1 counter") and a trigger doubler
 * keyed on whose ability it is (Roaming Throne's "a triggered ability of
 * another creature you control of the chosen type triggers an additional
 * time") — both now handed the static's permanent as the filter's source,
 * and "this creature is the chosen type in addition to its other types".
 */
import { describe, expect, it } from "vitest";
import { A, B, cast, enter, hand, lands, spawn, subtypes, table, toHand, counters } from "./harness.js";

describe("Metallic Mimic", () => {
  it("is the chosen type too, and creatures you cast of that type enter with a +1/+1 counter", () => {
    const { game, a } = table();
    a.chooseCreatureTypeFn = () => "Elf";
    lands(game, "Forest", 4);
    const mimic = toHand(game, "Metallic Mimic");
    cast(game, mimic);
    expect(game.state.objects[mimic].chosenCreatureType).toBe("Elf");
    expect(subtypes(game, mimic)).toEqual(expect.arrayContaining(["Shapeshifter", "Elf"]));
    const elves = toHand(game, "Llanowar Elves");
    cast(game, elves);
    expect(counters(game, elves)).toBe(1);
  });

  it("gives nothing to a creature of another type, nor to an opponent's", () => {
    const { game } = table();
    const mimic = spawn(game, "Metallic Mimic");
    game.state.objects[mimic].chosenCreatureType = "Elf";
    lands(game, "Mountain", 1);
    const goblin = toHand(game, "Raging Goblin");
    cast(game, goblin);
    expect(counters(game, goblin)).toBe(0);
    const theirs = enter(game, "Llanowar Elves", B);
    expect(counters(game, theirs)).toBe(0);
  });
});

describe("Roaming Throne", () => {
  it("makes a triggered ability of a creature you control of the chosen type trigger twice", () => {
    const { game } = table();
    const throne = spawn(game, "Roaming Throne");
    game.state.objects[throne].chosenCreatureType = "Elf";
    const before = hand(game, A).length;
    enter(game, "Elvish Visionary");
    expect(hand(game, A).length).toBe(before + 2);
  });

  it("leaves other types alone", () => {
    const { game } = table();
    const throne = spawn(game, "Roaming Throne");
    game.state.objects[throne].chosenCreatureType = "Goblin";
    const before = hand(game, A).length;
    enter(game, "Elvish Visionary");
    expect(hand(game, A).length).toBe(before + 1);
  });

  it("is the chosen type in addition to Golem", () => {
    const { game } = table();
    const throne = spawn(game, "Roaming Throne");
    game.state.objects[throne].chosenCreatureType = "Elf";
    expect(subtypes(game, throne)).toEqual(expect.arrayContaining(["Golem", "Elf"]));
  });
});
