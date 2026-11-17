/**
 * The `{ typeCountOf }` amount: how many supertypes, card types and subtypes
 * one object has, added up — Embiggen's "target non-Brushwagg creature gets
 * +1/+1 for each supertype, card type, and subtype it has", counted as it
 * resolves and fixed from then on (the rulings). Every subtype counts, and a
 * changeling is every creature type (rule 702.73a).
 */
import { describe, expect, it } from "vitest";

import { CREATURE_TYPES } from "../creature-types.js";
import { EVERY_CREATURE_TYPE, EVERY_LAND_TYPE, LAND_TYPES, subtypeCount } from "../subtypes.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, cast, pt, ref, spawn, table, toHand } from "./harness.js";

const embiggen = (game: Game, target: ObjectId): void => {
  spawn(game, "Forest");
  cast(game, toHand(game, "Embiggen"), { targets: [ref(target)] });
};

describe("Embiggen", () => {
  it("one card type and one subtype: +2/+2", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    embiggen(game, bears);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
  });

  it("a supertype, a card type and three subtypes: +5/+5", () => {
    const { game } = table();
    const storrev = spawn(game, "Storrev, Devkarin Lich");
    embiggen(game, storrev);
    expect(pt(game, storrev)).toEqual({ power: 10, toughness: 9 });
  });

  it("two card types and two subtypes, a land type among them (Dryad Arbor): +4/+4", () => {
    const { game } = table();
    const arbor = spawn(game, "Dryad Arbor");
    embiggen(game, arbor);
    expect(pt(game, arbor)).toEqual({ power: 5, toughness: 5 });
  });

  it("a changeling is every creature type, a Brushwagg among them: no target", () => {
    const { game } = table();
    const entity = spawn(game, "Mirror Entity");
    spawn(game, "Forest");
    expect(() => cast(game, toHand(game, "Embiggen"), { targets: [ref(entity)] })).toThrow(/target/i);
  });

  it("subtypeCount counts a marker as every type of its kind", () => {
    expect(subtypeCount(["Bear"])).toBe(1);
    expect(subtypeCount(["Forest", "Dryad"])).toBe(2);
    expect(subtypeCount(["Shapeshifter", EVERY_CREATURE_TYPE])).toBe(CREATURE_TYPES.length);
    expect(subtypeCount(["Equipment", EVERY_CREATURE_TYPE])).toBe(CREATURE_TYPES.length + 1);
    expect(subtypeCount(["Gate", EVERY_LAND_TYPE])).toBe(LAND_TYPES.length);
  });

  it("an amount read off a changeling counts every creature type", () => {
    const { game } = table();
    const entity = spawn(game, "Mirror Entity");
    game.debugApplyEffect(A, { kind: "modify-pt", target: 0, power: { typeCountOf: 0 }, toughness: 0, duration: "end-of-turn" }, [
      ref(entity),
    ]);
    // Mirror Entity is a 1/1 Creature — Shapeshifter.
    expect(pt(game, entity)).toEqual({ power: 1 + 1 + CREATURE_TYPES.length, toughness: 1 });
  });

  it("the bonus is fixed as it resolves: a subtype gained later adds nothing", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    embiggen(game, bears);
    game.debugApplyEffect(A, { kind: "become", target: 0, addSubtypes: ["Goblin"], duration: "end-of-turn" }, [
      ref(bears),
    ]);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
  });

  it("can't target a Brushwagg", () => {
    const { game } = table();
    const brushwagg = spawn(game, "Brushwagg");
    spawn(game, "Forest");
    expect(() => cast(game, toHand(game, "Embiggen"), { targets: [ref(brushwagg)] })).toThrow(/target/i);
  });
});
