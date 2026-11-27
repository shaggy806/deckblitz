/**
 * "An opponent chooses a permanent you control other than this creature and
 * exiles it" — `choose-opponent` then the opponent's `choose-permanents` over
 * the controller's permanents (`controlledByPlayer: "you"`), the exile linked
 * to the source (rule 607.2a). Proven on Wormfang Crab.
 */
import { describe, expect, it } from "vitest";

import { B, destroy, enter, keywords, lands, pickModes, pickPermanents, spawn, table, zone } from "./harness.js";

describe("Wormfang Crab", () => {
  it("has the opponent choose one of your other permanents, and exile it until the Crab leaves", () => {
    const { game, b } = table();
    const bears = spawn(game, "Grizzly Bears");
    const [island] = lands(game, "Island", 1);
    spawn(game, "Hill Giant", B);
    const seen = pickPermanents(b, island);
    const crab = enter(game, "Wormfang Crab");
    // Only Alice's permanents, never the Crab itself.
    expect([...seen.offered].sort()).toEqual([bears, island].sort());
    expect(zone(game, island)).toBe("exile");
    expect(zone(game, bears)).toBe("battlefield");
    destroy(game, crab);
    expect(zone(game, island)).toBe("battlefield");
  });

  it("exiles nothing when the Crab is your only permanent", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant", B);
    const crab = enter(game, "Wormfang Crab");
    expect(zone(game, crab)).toBe("battlefield");
    expect(zone(game, giant)).toBe("battlefield");
  });

  it("lets its controller pick which opponent chooses, at three players", () => {
    const { game, a, b, c } = table({ players: 3 });
    const bears = spawn(game, "Grizzly Bears");
    const elves = spawn(game, "Llanowar Elves");
    pickModes(a, 1); // the second opponent in turn order: Carol
    pickPermanents(b, bears);
    pickPermanents(c, elves);
    enter(game, "Wormfang Crab");
    expect(zone(game, elves)).toBe("exile");
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("can't be blocked", () => {
    const { game } = table();
    const crab = spawn(game, "Wormfang Crab");
    expect(keywords(game, crab).has("unblockable")).toBe(true);
  });
});
