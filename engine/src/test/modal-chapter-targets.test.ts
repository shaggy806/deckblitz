/**
 * A Saga's modal chapter ability whose modes have targets (rules 714.2c,
 * 603.3c, 700.2): the chapter announces its mode as it goes on the stack, the
 * chosen mode bringing its target, and a shared "I, II" ability fires at each
 * of its lore counts.
 *
 * Cards: Life of Toshiro Umezawa // Memory of Toshiro.
 */

import { describe, expect, it } from "vitest";

import { A, B, life, named, nextTurn, pickModes, pickTargets, pt, settle, spawn, subtypes, table, types } from "./harness.js";

describe("Life of Toshiro Umezawa", () => {
  it("chapter I: the +2/+2 mode pumps the creature it targets", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    pickModes(a, 0);
    pickTargets(a, bears);
    spawn(game, "Life of Toshiro Umezawa");
    settle(game);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
  });

  it("chapter I: the -1/-1 mode shrinks an opponent's creature", () => {
    const { game, a } = table();
    const theirs = spawn(game, "Grizzly Bears", B);
    pickModes(a, 1);
    pickTargets(a, theirs);
    spawn(game, "Life of Toshiro Umezawa");
    settle(game);
    expect(pt(game, theirs)).toEqual({ power: 1, toughness: 1 });
  });

  it("chapter I: the life mode asks for no target", () => {
    const { game, a } = table();
    a.chooseTargetsFn = () => {
      throw new Error("no target to choose");
    };
    spawn(game, "Grizzly Bears");
    pickModes(a, 2);
    spawn(game, "Life of Toshiro Umezawa");
    settle(game);
    expect(life(game)).toBe(22);
  });

  it("chapter II fires the same ability; chapter III returns it as Memory of Toshiro, whose mana costs 1 life", () => {
    const { game, a } = table();
    spawn(game, "Grizzly Bears");
    pickModes(a, 2);
    spawn(game, "Life of Toshiro Umezawa");
    settle(game);
    expect(life(game)).toBe(22);
    nextTurn(game);
    nextTurn(game);
    settle(game);
    expect(life(game)).toBe(24);
    nextTurn(game);
    nextTurn(game);
    settle(game);
    // A transformed permanent keeps its card's name as `cardName`; its
    // characteristics are the back face's (rule 712.8e).
    const [memory] = named(game, "Life of Toshiro Umezawa", A);
    expect(memory).toBeDefined();
    expect(types(game, memory)).toEqual(["enchantment", "creature"]);
    expect(subtypes(game, memory)).toContain("Samurai");
    expect(pt(game, memory)).toEqual({ power: 2, toughness: 3 });
  });
});
