/**
 * A cast prohibition judges the spell that would be cast: a split card's half
 * (rule 709.3), an Adventure (715.3a), a modal double-faced card's back face
 * (712.11c), a bestowed Aura spell (702.103b). Nikya of the Old Ways' "you
 * can't cast noncreature spells", and a mana-value prohibition of a test's.
 */

import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import { defineCard } from "../cards/define.js";
import { createDefaultRegistry } from "../cards/registry.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, lands, spawn, table, toHand } from "./harness.js";

const NO_BIG = "Spells with mana value 4 or greater can't be cast.";
const gate = defineCard({
  name: "Test Mana Gate",
  manaCost: "{1}",
  types: ["artifact"],
  text: NO_BIG,
  static: [
    {
      affects: { scope: "self" },
      prohibits: [{ act: "cast", who: "each-player", filter: { manaValue: { op: "gte", n: 4 } } }],
      text: NO_BIG,
    },
  ],
});

type Cast = Extract<LegalAction, { kind: "cast-spell" }>;
const castsOf = (game: Game, card: ObjectId): Cast[] =>
  game.legalActions(A).filter((a): a is Cast => a.kind === "cast-spell" && a.card === card);

const flooded = (game: Game): void => {
  for (const land of ["Mountain", "Island", "Plains", "Swamp", "Forest"]) lands(game, land, 4);
};

describe("a cast prohibition reads the face or half being cast", () => {
  it("a mana value 4 prohibition: Fire // Ice's halves are 2 each, so each can be cast", () => {
    const { game } = table({ registry: createDefaultRegistry().register(gate) });
    flooded(game);
    spawn(game, "Test Mana Gate");
    const card = toHand(game, "Fire // Ice");
    expect(castsOf(game, card).map((a) => a.face).sort()).toEqual([1, 2]);
  });

  it("Nikya: Bonecrusher Giant's creature half can be cast, its Adventure can't", () => {
    const { game } = table();
    flooded(game);
    spawn(game, "Nikya of the Old Ways");
    const card = toHand(game, "Bonecrusher Giant");
    const faces = castsOf(game, card).map((a) => a.face ?? 0);
    expect(faces).toEqual([0]);
  });

  it("an X spell's mana value counts the X chosen (202.3e): Blaze at X=3 is mana value 4", () => {
    const { game } = table({ registry: createDefaultRegistry().register(gate) });
    flooded(game);
    spawn(game, "Test Mana Gate");
    const blaze = toHand(game, "Blaze");
    const at = (x: number): string | null =>
      game.canDispatch({ type: "cast-spell", player: A, card: blaze, targets: [{ kind: "player", player: B }], xValue: x });
    expect(at(2)).toBeNull();
    expect(at(3)).toMatch(/can't cast/);
    expect(at(4)).toMatch(/can't cast/);
    expect(castsOf(game, blaze).map((a) => a.xCost?.maxX)).toEqual([0, 1, 2]);
  });

  it("Nikya: a bestowed Aura spell is a noncreature spell, the creature can still be cast", () => {
    const { game } = table();
    flooded(game);
    spawn(game, "Nikya of the Old Ways");
    spawn(game, "Grizzly Bears");
    const card = toHand(game, "Nyxborn Eidolon");
    const casts = castsOf(game, card);
    expect(casts.some((a) => a.overload === true)).toBe(false);
    expect(casts.some((a) => a.overload !== true)).toBe(true);
  });

  it("Nikya: a modal double-faced card's noncreature back face can't be cast, its creature front can", () => {
    const { game } = table();
    flooded(game);
    spawn(game, "Nikya of the Old Ways");
    const card = toHand(game, "Kazandu Mammoth");
    expect(castsOf(game, card).length).toBeGreaterThan(0);
    const card2 = toHand(game, "Valakut Awakening");
    expect(castsOf(game, card2).map((a) => a.face ?? 0)).not.toContain(0);
  });
});
