/**
 * A `become` with no duration that names its permanent, makes it legendary,
 * sets its base P/T and grants it a static ability over other permanents — all
 * one patch (`name`, `addSupertypes`, `power`/`toughness`, `static`).
 *
 * Proving card: Tenth District Hero.
 */

import { describe, expect, it } from "vitest";

import { effectiveSupertypes } from "../characteristics.js";
import { nameOf } from "../state.js";
import {
  A,
  activate,
  cast,
  keywords,
  lands,
  pickFromZone,
  pt,
  registryOf,
  spawn,
  subtypes,
  table,
  toGraveyard,
  toHand,
  zone,
} from "./harness.js";

const board = () => {
  const t = table();
  const { game } = t;
  const hero = spawn(game, "Tenth District Hero", A);
  const bears = spawn(game, "Grizzly Bears", A);
  lands(game, "Plains", 5);
  const yard = [
    toGraveyard(game, "Grizzly Bears"),
    toGraveyard(game, "Grizzly Bears"),
    toGraveyard(game, "Grizzly Bears"),
  ];
  return { ...t, hero, bears, yard };
};

describe("Tenth District Hero", () => {
  it("collect evidence 2: a 4/4 Human Detective with vigilance, for good", () => {
    const { game, a, hero, yard } = board();
    pickFromZone(a, yard[0]!);
    activate(game, hero, 0);
    expect(zone(game, yard[0]!)).toBe("exile");
    expect(pt(game, hero)).toEqual({ power: 4, toughness: 4 });
    expect([...subtypes(game, hero)].sort()).toEqual(["Detective", "Human"]);
    expect(keywords(game, hero).has("vigilance")).toBe(true);
  });

  it("then: legendary, named Mileva, the Stalwart, 5/5, and other creatures it controls are indestructible", () => {
    const { game, a, hero, bears, yard } = board();
    pickFromZone(a, yard[0]!);
    activate(game, hero, 0);
    pickFromZone(a, yard[1]!, yard[2]!);
    lands(game, "Plains", 3);
    activate(game, hero, 1);
    expect(nameOf(game.state.objects[hero]!)).toBe("Mileva, the Stalwart");
    expect(effectiveSupertypes(game.state, registryOf(game), game.state.objects[hero]!)).toContain("legendary");
    expect(pt(game, hero)).toEqual({ power: 5, toughness: 5 });
    // Its creature types stay: only the supertype is added.
    expect([...subtypes(game, hero)].sort()).toEqual(["Detective", "Human"]);
    expect(keywords(game, hero).has("vigilance")).toBe(true);
    expect(keywords(game, bears).has("indestructible")).toBe(true);
    expect(keywords(game, hero).has("indestructible")).toBe(false);
    // Indestructible does its work: a wrath leaves the Bears.
    lands(game, "Plains", 4);
    cast(game, toHand(game, "Wrath of God"));
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, hero)).toBe("graveyard");
  });

  it("the second ability does nothing if it isn't a Detective as it resolves", () => {
    const { game, a, hero, bears, yard } = board();
    pickFromZone(a, yard[0]!, yard[1]!);
    activate(game, hero, 1);
    expect(nameOf(game.state.objects[hero]!)).toBe("Tenth District Hero");
    expect(pt(game, hero)).toEqual({ power: 2, toughness: 3 });
    expect(keywords(game, bears).has("indestructible")).toBe(false);
  });
});
