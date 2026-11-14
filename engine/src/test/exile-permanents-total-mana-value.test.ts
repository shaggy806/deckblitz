/**
 * "Exile one or more other artifacts you control with total mana value X" as
 * an activated ability's cost (Fabrication Foundry): `AbilityCost.do`'s
 * `choose-permanents` with a `totalManaValue: "x"` rule. X is announced as
 * it's activated (rules 107.3, 601.2b), offered only where some set adds up
 * to exactly it; the permanents are chosen and exiled as the cost is paid
 * (601.2h), all in one event.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { pickInBand } from "../zone-choice-together.js";

import { A, activate, lands, pickPermanents, ref, spawn, table, toGraveyard, zone } from "./harness.js";

/** The X values the Foundry's return ability is offered at. */
const offeredX = (game: Game, foundry: ObjectId): number[] =>
  game
    .legalActions(A)
    .flatMap((l) => (l.kind === "activate-ability" && l.source === foundry && l.abilityIndex === 1 && l.xCost !== undefined ? [l.xCost.maxX] : []))
    .sort((a, b) => a - b);

describe("exile permanents with total mana value X, as a cost", () => {
  it("returns an artifact card of mana value X or less, exiling a set that adds up to X", () => {
    const { game, a } = table();
    const foundry = spawn(game, "Fabrication Foundry");
    lands(game, "Plains", 3);
    const ring = spawn(game, "Sol Ring"); // 1
    const stone = spawn(game, "Mind Stone"); // 2
    const signet = toGraveyard(game, "Arcane Signet"); // 2
    const solemn = toGraveyard(game, "Solemn Simulacrum"); // 4
    pickPermanents(a, ring, stone);
    // X = 3: the Simulacrum's 4 is too much.
    expect(() => activate(game, foundry, 1, { x: 3, targets: [ref(solemn)] })).toThrow(/target/i);
    activate(game, foundry, 1, { x: 3, targets: [ref(signet)] });
    expect(zone(game, ring)).toBe("exile");
    expect(zone(game, stone)).toBe("exile");
    expect(zone(game, signet)).toBe("battlefield");
    expect(zone(game, foundry)).toBe("battlefield");
  });

  it("is offered only at an X some set of the other artifacts adds up to", () => {
    const { game } = table();
    const foundry = spawn(game, "Fabrication Foundry");
    lands(game, "Plains", 3);
    spawn(game, "Sol Ring"); // 1
    spawn(game, "Solemn Simulacrum"); // 4
    toGraveyard(game, "Ornithopter"); // 0: a target at every X
    // 1, 4 and 5 — never 2 or 3, and never the Foundry's own 2.
    expect(offeredX(game, foundry)).toEqual([1, 4, 5]);
    expect(() => activate(game, foundry, 1, { x: 2, targets: [null] })).toThrow();
  });

  it("needs at least one other artifact", () => {
    const { game } = table();
    const foundry = spawn(game, "Fabrication Foundry");
    lands(game, "Plains", 3);
    toGraveyard(game, "Ornithopter");
    expect(offeredX(game, foundry)).toEqual([]);
  });
});

describe("pickInBand", () => {
  it("finds a set in the band, the earlier values first, within the counts", () => {
    expect(pickInBand([1, 4, 2], 3, 3, 1, 3)).toEqual([0, 2]);
    expect(pickInBand([1, 4], 2, 3, 1, 2)).toBeNull();
    expect(pickInBand([0, 5], 0, 0, 1, 2)).toEqual([0]);
    expect(pickInBand([1, 1, 1], 3, 3, 1, 2)).toBeNull();
  });
});
