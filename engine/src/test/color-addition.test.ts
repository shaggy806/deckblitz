/**
 * Colours added "in addition to its other colors" (rule 105.3, layer 5) —
 * for a duration (Indigo Faerie's `become` with `inAddition`), with a
 * type (Unctus, Grand Metatect's `become` with `addColors`), as an
 * animation (Phantasmal Form's `become` with `addColors`), or as a static on
 * what it's attached to (Ghoulflesh's `addColors`).
 */

import { describe, expect, it } from "vitest";

import { computeCharacteristics } from "../characteristics.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { B, activate, attack, cast, graveyard, lands, nextTurn, pt, ref, registryOf, spawn, subtypes, table, toHand, toLibrary, types } from "./harness.js";

const colors = (game: Game, id: ObjectId): string[] => [
  ...computeCharacteristics(game.state, registryOf(game), id).colors,
].sort();

describe("a colour added for a duration (Indigo Faerie)", () => {
  it("adds blue to a red creature until end of turn, keeping red", () => {
    const { game } = table();
    lands(game, "Island", 1);
    const faerie = spawn(game, "Indigo Faerie");
    const goblin = spawn(game, "Raging Goblin", B);
    activate(game, faerie, 0, { targets: [ref(goblin)] });
    expect(colors(game, goblin)).toEqual(["R", "U"]);
    nextTurn(game);
    expect(colors(game, goblin)).toEqual(["R"]);
  });

  it("is under a later 'becomes black' and over an earlier one (timestamp order, 613.7)", () => {
    const { game } = table();
    lands(game, "Island", 1);
    lands(game, "Swamp", 1);
    const faerie = spawn(game, "Indigo Faerie");
    const goblin = spawn(game, "Raging Goblin", B);
    cast(game, toHand(game, "Deathlace"), { targets: [ref(goblin)] });
    activate(game, faerie, 0, { targets: [ref(goblin)] });
    expect(colors(game, goblin)).toEqual(["B", "U"]);
    lands(game, "Swamp", 1);
    cast(game, toHand(game, "Deathlace"), { targets: [ref(goblin)] });
    expect(colors(game, goblin)).toEqual(["B"]);
  });
});

describe("a colour added with a type (Unctus, Grand Metatect)", () => {
  it("makes a green creature a blue artifact too, which then has Unctus's granted loot and its +1/+1", () => {
    const { game, a } = table();
    lands(game, "Island", 1);
    const unctus = spawn(game, "Unctus, Grand Metatect");
    const bear = spawn(game, "Grizzly Bears");
    expect(pt(game, bear)).toEqual({ power: 2, toughness: 2 });
    activate(game, unctus, 0, { targets: [ref(bear)] });
    expect(colors(game, bear)).toEqual(["G", "U"]);
    expect(types(game, bear)).toEqual(expect.arrayContaining(["artifact", "creature"]));
    expect(subtypes(game, bear)).toEqual(["Bear"]);
    expect(pt(game, bear)).toEqual({ power: 3, toughness: 3 });
    // Blue now: tapping it (by attacking) loots.
    toLibrary(game, "Grizzly Bears");
    toHand(game, "Forest");
    const before = graveyard(game).length;
    attack(game, a, [bear]);
    expect(graveyard(game).length).toBe(before + 1);
    nextTurn(game);
    expect(colors(game, bear)).toEqual(["G"]);
    expect(types(game, bear)).toEqual(["creature"]);
  });
});

describe("a colour added by an animation (Phantasmal Form)", () => {
  it("each target is a blue 3/3 flying Illusion in addition, until end of turn", () => {
    const { game } = table();
    lands(game, "Island", 3);
    const bear = spawn(game, "Grizzly Bears", B);
    const goblin = spawn(game, "Raging Goblin");
    cast(game, toHand(game, "Phantasmal Form"), { targets: [ref(bear), ref(goblin)] });
    expect(colors(game, bear)).toEqual(["G", "U"]);
    expect(colors(game, goblin)).toEqual(["R", "U"]);
    expect(pt(game, bear)).toEqual({ power: 3, toughness: 3 });
    expect(subtypes(game, goblin)).toEqual(expect.arrayContaining(["Goblin", "Illusion"]));
    nextTurn(game);
    expect(colors(game, bear)).toEqual(["G"]);
    expect(pt(game, bear)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("a colour added by a static to what it's attached to (Ghoulflesh)", () => {
  it("makes the enchanted creature a black Zombie in addition, -1/-1", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    const bear = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Ghoulflesh"), { targets: [ref(bear)] });
    expect(colors(game, bear)).toEqual(["B", "G"]);
    expect(subtypes(game, bear)).toEqual(["Bear", "Zombie"]);
    expect(pt(game, bear)).toEqual({ power: 1, toughness: 1 });
  });
});
