/**
 * A new target narrower than the spell's own slot: `change-targets`
 * `newTargetIs` — Rebound's "The new target must be a player", Meddle's "change
 * that spell's target to another creature", Silver Wyvern's "The new target
 * must be a creature". The new target must still be legal for the spell (rule
 * 115.7a); with none, the target stays.
 */
import { describe, expect, it } from "vitest";

import type { ObjectId, PlayerId } from "../primitives.js";
import { activePlayerOf } from "../state.js";
import { A, B, activate, cast, lands, life, pt, ref, spawn, table, toHand, watchTargets, zone } from "./harness.js";

/** Alice's Grizzly Bears and two Islands, Bob's Llanowar Elves; Bob casts
 * `spell` at what `aim` names and passes, so Alice holds priority with it on
 * the stack. */
const setUp = (
  spell: string,
  aim: (bears: ObjectId, elves: ObjectId, mine: readonly ObjectId[]) => readonly (ObjectId | PlayerId)[],
  bobLands: readonly (readonly [string, number])[],
  alice: readonly string[] = [],
) => {
  const t = table();
  lands(t.game, "Island", 2);
  for (const [name, n] of bobLands) lands(t.game, name, n, B);
  const bears = spawn(t.game, "Grizzly Bears");
  const elves = spawn(t.game, "Llanowar Elves", B);
  const mine = alice.map((name) => spawn(t.game, name));
  t.game.dispatch({ type: "pass-priority", player: A });
  const card = toHand(t.game, spell, B);
  cast(t.game, card, { player: B, targets: aim(bears, elves, mine).map(ref), settle: false });
  t.game.dispatch({ type: "pass-priority", player: B });
  expect(t.game.state.priority.holder).toBe(A);
  return { ...t, bears, elves, card, mine };
};

describe("Meddle", () => {
  it("changes a Shock aimed at a creature to another creature, never a player", () => {
    const { game, a, bears, elves, card, mine } = setUp("Shock", (bears) => [bears], [["Mountain", 1]], ["Silver Wyvern"]);
    const seen = watchTargets(a, () => [elves]);
    cast(game, toHand(game, "Meddle"), { targets: [ref(card)] });
    expect(seen.asked).toBe(1);
    expect(seen.offered[0]).toEqual(expect.arrayContaining([elves, mine[0]]));
    expect(seen.offered[0]).not.toContain(A);
    expect(seen.offered[0]).not.toContain(B);
    expect(seen.offered[0]).not.toContain(bears);
    expect(zone(game, elves)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("does nothing to a Shock aimed at a player", () => {
    const { game, a, card } = setUp("Shock", () => [A], [["Mountain", 1]]);
    const seen = watchTargets(a, () => [B]);
    cast(game, toHand(game, "Meddle"), { targets: [ref(card)] });
    expect(seen.asked).toBe(0);
    expect(life(game, A)).toBe(18);
    expect(life(game, B)).toBe(20);
  });

  it("does nothing to a spell with more than one target, even all one creature (the ruling)", () => {
    const { game, a, bears, card } = setUp("Seeds of Strength", (bears) => [bears, bears, bears], [
      ["Forest", 1],
      ["Plains", 1],
    ]);
    const seen = watchTargets(a);
    cast(game, toHand(game, "Meddle"), { targets: [ref(card)] });
    expect(seen.asked).toBe(0);
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 5 });
  });
});

describe("Rebound", () => {
  it("changes a Shock aimed at a player to another player only", () => {
    const { game, a, card } = setUp("Shock", () => [A], [["Mountain", 1]]);
    // The one other player is the only new target, so no question is asked.
    const seen = watchTargets(a);
    cast(game, toHand(game, "Rebound"), { targets: [ref(card)] });
    expect(seen.asked).toBe(0);
    expect(life(game, A)).toBe(20);
    expect(life(game, B)).toBe(18);
  });

  it("can't target a spell aimed at a creature", () => {
    const { game, card } = setUp("Shock", (bears) => [bears], [["Mountain", 1]]);
    expect(() => cast(game, toHand(game, "Rebound"), { targets: [ref(card)] })).toThrow(/target/i);
  });

  it("can't target a spell aimed at two players: 'the target' is a single one (115.9a)", () => {
    const { game } = table();
    lands(game, "Island", 2);
    lands(game, "Swamp", 1, B);
    game.advanceUntil((s) => activePlayerOf(s) === B && s.turn.step === "precombat-main" && s.priority.holder === B);
    const symmetry = toHand(game, "Scheming Symmetry", B);
    cast(game, symmetry, { player: B, targets: [ref(A), ref(B)], settle: false });
    game.dispatch({ type: "pass-priority", player: B });
    expect(game.state.priority.holder).toBe(A);
    expect(() => cast(game, toHand(game, "Rebound"), { targets: [ref(symmetry)] })).toThrow(/target/i);
  });
});

describe("Silver Wyvern", () => {
  it("changes a Shock aimed at it to another creature, never a player", () => {
    const { game, a, bears, elves, card, mine } = setUp("Shock", (_b, _e, m) => [m[0]], [["Mountain", 1]], ["Silver Wyvern"]);
    const [wyvern] = mine;
    const seen = watchTargets(a, () => [elves]);
    activate(game, wyvern, 0, { targets: [ref(card)] });
    expect(seen.asked).toBe(1);
    expect(seen.offered[0]).toEqual(expect.arrayContaining([bears, elves]));
    expect(seen.offered[0]).not.toContain(A);
    expect(seen.offered[0]).not.toContain(B);
    expect(zone(game, elves)).toBe("graveyard");
    expect(zone(game, wyvern)).toBe("battlefield");
  });

  it("can't target a spell aimed at another creature", () => {
    const { game, card, mine } = setUp("Shock", (bears) => [bears], [["Mountain", 1]], ["Silver Wyvern"]);
    expect(() => activate(game, mine[0], 0, { targets: [ref(card)] })).toThrow(/target/i);
  });
});
