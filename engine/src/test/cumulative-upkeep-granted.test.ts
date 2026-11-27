/**
 * Cumulative upkeep granted by a static to a set of permanents (rule
 * 702.24a): Breath of Dreams' "Green creatures have 'Cumulative upkeep {1}'"
 * — each green creature's own ability, on its controller's upkeep, the age
 * counters on the creature — beside its own printed cumulative upkeep {U}.
 */
import { describe, expect, it } from "vitest";
import { B, counters, lands, nextTurn, pickModes, spawn, table, zone } from "./harness.js";

describe("Breath of Dreams — green creatures have cumulative upkeep {1}", () => {
  it("gives every green creature, either player's, its own cumulative upkeep", () => {
    const { game, a, b } = table();
    spawn(game, "Breath of Dreams");
    lands(game, "Island", 3);
    const bears = spawn(game, "Grizzly Bears", B);
    const elves = spawn(game, "Grizzly Bears", B);
    const ogre = spawn(game, "Gray Ogre", B);
    lands(game, "Forest", 2, B);
    // B pays for one Bears only, and declines the other's.
    pickModes(a, 0);
    let asked = 0;
    b.chooseModesFn = () => (asked++ === 0 ? [0] : []);
    nextTurn(game);
    // B's upkeep: each green creature's own trigger; one was paid for.
    expect(asked).toBe(2);
    const kept = [bears, elves].filter((id) => zone(game, id) === "battlefield");
    expect(kept).toHaveLength(1);
    expect(counters(game, kept[0], "age")).toBe(1);
    // Not green: no upkeep.
    expect(zone(game, ogre)).toBe("battlefield");
    expect(counters(game, ogre, "age")).toBe(0);
  });

  it("asks nothing once the creature stops getting it, and the age counters stay", () => {
    const { game, a, b } = table();
    const breath = spawn(game, "Breath of Dreams");
    lands(game, "Island", 3);
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Forest", 3, B);
    pickModes(a, 0);
    pickModes(b, 0);
    nextTurn(game);
    nextTurn(game);
    expect(counters(game, bears, "age")).toBe(1);
    // Breath goes: the Bears keep the counter, and no upkeep triggers.
    game.debugMove(breath, "graveyard");
    pickModes(b);
    nextTurn(game);
    nextTurn(game);
    expect(zone(game, bears)).toBe("battlefield");
    expect(counters(game, bears, "age")).toBe(1);
  });

  it("keeps its own cumulative upkeep {U}", () => {
    const { game, a } = table();
    const breath = spawn(game, "Breath of Dreams");
    lands(game, "Island", 3);
    pickModes(a);
    nextTurn(game);
    nextTurn(game);
    expect(zone(game, breath)).toBe("graveyard");
  });
});
