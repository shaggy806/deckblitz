/**
 * "The second spell cast this turn" (`CardFilter.castNthThisTurn`): a spell on
 * the stack, or a permanent that entered as that spell resolved, numbered by
 * the journal's `spell-cast` entries this turn — every player's (Second
 * Guess), or with `byCaster` its caster's own (Codespell Cleric's "if it was
 * the second spell you cast this turn", an intervening if, rule 603.4).
 */
import { describe, expect, it } from "vitest";

import { A, B, cast, counters, enter, lands, life, pickTargets, ref, settle, spawn, table, toHand, zone } from "./harness.js";

describe("Codespell Cleric", () => {
  it("cast as your second spell this turn: a +1/+1 counter on target creature", () => {
    const { game, a } = table();
    lands(game, "Plains", 1, A);
    const thopter = toHand(game, "Ornithopter", A);
    cast(game, thopter);
    pickTargets(a, thopter);
    const cleric = toHand(game, "Codespell Cleric", A);
    cast(game, cleric);
    expect(counters(game, thopter)).toBe(1);
    expect(counters(game, cleric)).toBe(0);
  });

  it("cast as your first or third spell: no trigger", () => {
    const { game, a } = table();
    lands(game, "Plains", 2, A);
    const bears = spawn(game, "Grizzly Bears", A);
    pickTargets(a, bears);
    cast(game, toHand(game, "Codespell Cleric", A));
    expect(counters(game, bears)).toBe(0);
    cast(game, toHand(game, "Ornithopter", A));
    cast(game, toHand(game, "Codespell Cleric", A));
    expect(counters(game, bears)).toBe(0);
  });

  it("another player's spell between yours doesn't count", () => {
    const { game, a } = table();
    lands(game, "Plains", 1, A);
    lands(game, "Mountain", 1, B);
    const thopter = toHand(game, "Ornithopter", A);
    cast(game, thopter, { settle: false });
    game.dispatch({ type: "pass-priority", player: A });
    cast(game, toHand(game, "Shock", B), { player: B, targets: [ref(A)] });
    expect(life(game, A)).toBe(18);
    pickTargets(a, thopter);
    cast(game, toHand(game, "Codespell Cleric", A));
    expect(counters(game, thopter)).toBe(1);
  });

  it("put onto the battlefield without being cast: no trigger", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", A);
    cast(game, toHand(game, "Ornithopter", A));
    pickTargets(a, bears);
    enter(game, "Codespell Cleric", A);
    settle(game);
    expect(counters(game, bears)).toBe(0);
  });
});

describe("Second Guess", () => {
  it("counters the second spell cast this turn", () => {
    const { game } = table();
    lands(game, "Island", 2, B);
    lands(game, "Forest", 2, A);
    cast(game, toHand(game, "Ornithopter", A));
    const bears = toHand(game, "Grizzly Bears", A);
    cast(game, bears, { settle: false });
    game.dispatch({ type: "pass-priority", player: A });
    cast(game, toHand(game, "Second Guess", B), { player: B, targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("can't target the first or the third", () => {
    const { game } = table();
    lands(game, "Island", 2, B);
    lands(game, "Forest", 2, A);
    const first = toHand(game, "Ornithopter", A);
    cast(game, first, { settle: false });
    game.dispatch({ type: "pass-priority", player: A });
    expect(() => cast(game, toHand(game, "Second Guess", B), { player: B, targets: [ref(first)] })).toThrow();
    settle(game);
    cast(game, toHand(game, "Ornithopter", A));
    const third = toHand(game, "Grizzly Bears", A);
    cast(game, third, { settle: false });
    game.dispatch({ type: "pass-priority", player: A });
    expect(() => cast(game, toHand(game, "Second Guess", B), { player: B, targets: [ref(third)] })).toThrow();
  });
});
