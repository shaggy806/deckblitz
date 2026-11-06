import { describe, expect, it } from "vitest";

import { B, cast, hand, life, lands, spawn, table, toHand, toLibrary, zone } from "./harness.js";

// "As an additional cost to cast this spell, you may sacrifice one or more
// creatures. When you do, copy this spell for each creature sacrificed this
// way" (Plumb the Forbidden): a sacrifice of X, X announced as it's cast
// (rule 601.2b) and paid as the cost is (601.2h), and one reflexive trigger
// (603.12) making X copies — `additionalCost.copyForEachSacrificed`.

const stockLibrary = (game: Parameters<typeof toLibrary>[0], n: number): void => {
  for (let i = 0; i < n; i += 1) toLibrary(game, "Island");
};

describe("Plumb the Forbidden", () => {
  it("nothing sacrificed: no trigger, the spell alone", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    stockLibrary(game, 5);
    const bears = spawn(game, "Grizzly Bears");
    const before = hand(game).length;
    cast(game, toHand(game, "Plumb the Forbidden"), { x: 0 });
    expect(zone(game, bears)).toBe("battlefield");
    expect(hand(game).length).toBe(before + 1);
    expect(life(game)).toBe(19);
  });

  it("two sacrificed: two copies, three draws and 3 life", () => {
    const { game, a } = table();
    lands(game, "Swamp", 2);
    stockLibrary(game, 5);
    const kept = spawn(game, "Hill Giant");
    const fodder = [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears")];
    a.chooseSacrificesFn = () => fodder;
    const before = hand(game).length;
    cast(game, toHand(game, "Plumb the Forbidden"), { x: 2 });
    expect(fodder.map((id) => zone(game, id))).toEqual(["graveyard", "graveyard"]);
    expect(zone(game, kept)).toBe("battlefield");
    expect(hand(game).length).toBe(before + 3);
    expect(life(game)).toBe(17);
    expect(life(game, B)).toBe(20);
  });

  it("one trigger makes every copy: each copy is seen by magecraft (the ruling)", () => {
    const { game, a } = table();
    lands(game, "Swamp", 2);
    stockLibrary(game, 10);
    spawn(game, "Archmage Emeritus");
    const fodder = [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears")];
    a.chooseSacrificesFn = () => fodder;
    const before = hand(game).length;
    cast(game, toHand(game, "Plumb the Forbidden"), { x: 2 });
    // Three Plumbs (3 draws) and Archmage Emeritus's magecraft for the cast
    // and each of the two copies (3 more).
    expect(hand(game).length).toBe(before + 6);
    expect(life(game)).toBe(17);
  });
});
