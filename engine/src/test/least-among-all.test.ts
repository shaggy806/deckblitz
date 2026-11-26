/**
 * "The creature with the least power" / "target nonland permanent with the
 * lowest mana value" among everything on the battlefield — `greatestInZone`
 * with `least` (no engine code: Drop of Honey's shape), proven on Porphyry
 * Nodes and Culling Scales.
 */
import { describe, expect, it } from "vitest";

import { B, pickPermanents, spawn, table, toStep, watchTargets, zone } from "./harness.js";

describe("Porphyry Nodes", () => {
  it("destroys the creature with the least power, whoever controls it", () => {
    const { game } = table();
    spawn(game, "Porphyry Nodes");
    const bears = spawn(game, "Grizzly Bears");
    const elves = spawn(game, "Llanowar Elves", B);
    toStep(game, "draw");
    expect(zone(game, elves)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("you choose among creatures tied for least power", () => {
    const { game, a } = table();
    spawn(game, "Porphyry Nodes");
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    const wurm = spawn(game, "Craw Wurm", B);
    const seen = pickPermanents(a, theirs);
    toStep(game, "draw");
    expect(seen.offered).toEqual(expect.arrayContaining([mine, theirs]));
    expect(seen.offered).not.toContain(wurm);
    expect(zone(game, theirs)).toBe("graveyard");
    expect(zone(game, mine)).toBe("battlefield");
  });

  it("is sacrificed when there are no creatures on the battlefield", () => {
    const { game } = table();
    const nodes = spawn(game, "Porphyry Nodes");
    const elves = spawn(game, "Llanowar Elves", B);
    toStep(game, "draw");
    expect(zone(game, elves)).toBe("graveyard");
    expect(zone(game, nodes)).toBe("graveyard");
  });
});

describe("Culling Scales", () => {
  it("targets only a nonland permanent with the lowest mana value", () => {
    const { game, a } = table();
    const scales = spawn(game, "Culling Scales");
    spawn(game, "Forest");
    const bears = spawn(game, "Grizzly Bears");
    const mine = spawn(game, "Llanowar Elves");
    const theirs = spawn(game, "Llanowar Elves", B);
    const seen = watchTargets(a, () => [theirs]);
    toStep(game, "draw");
    expect(seen.asked).toBe(1);
    expect(seen.offered[0]).toHaveLength(2);
    expect(seen.offered[0]).toEqual(expect.arrayContaining([mine, theirs]));
    expect(zone(game, theirs)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, scales)).toBe("battlefield");
  });
});
