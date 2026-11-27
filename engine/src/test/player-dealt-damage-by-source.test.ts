/**
 * The `player-dealt-damage-by-source` target: "target player dealt damage by
 * this creature this turn" (Wicked Akuba) and "target opponent previously
 * dealt damage by it" (Diseased Vermin, `ever` and `opponent`) — by the
 * source in its stint (rule 400.7). Hope of Ghirapur's `combat` is in
 * player-dealt-combat-damage-by-source.test.ts.
 */
import { describe, expect, it } from "vitest";

import { A, B, C, activate, attack, counters, lands, life, nextTurn, ref, spawn, table, toStep } from "./harness.js";

describe("Wicked Akuba: target player dealt damage by this creature this turn", () => {
  it("targets the player it hit this turn, and no one else", () => {
    const seats = table({ players: 3 });
    const { game } = seats;
    const akuba = spawn(game, "Wicked Akuba");
    lands(game, "Swamp", 2);
    expect(() => activate(game, akuba, 0, { targets: [ref(B)] })).toThrow(/target/i);
    attack(game, seats.a, [akuba]);
    expect(life(game, B)).toBe(18);
    expect(() => activate(game, akuba, 0, { targets: [ref(C)] })).toThrow(/target/i);
    activate(game, akuba, 0, { targets: [ref(B)] });
    expect(life(game, B)).toBe(17);
  });

  it("only this turn", () => {
    const seats = table();
    const { game } = seats;
    const akuba = spawn(game, "Wicked Akuba");
    attack(game, seats.a, [akuba]);
    nextTurn(game);
    nextTurn(game);
    lands(game, "Swamp", 1);
    expect(() => activate(game, akuba, 0, { targets: [ref(B)] })).toThrow(/target/i);
  });
});

describe("Diseased Vermin: target opponent previously dealt damage by it", () => {
  it("hits the opponent it dealt combat damage to, on each later upkeep", () => {
    const seats = table({ players: 3 });
    const { game } = seats;
    const vermin = spawn(game, "Diseased Vermin");
    attack(game, seats.a, [vermin]);
    expect(counters(game, vermin, "infection")).toBe(1);
    expect(life(game, B)).toBe(19);
    seats.a.declareAttackersFn = () => [];
    // Alice's next upkeep: one infection counter, so 1 damage to Bob alone.
    nextTurn(game);
    nextTurn(game);
    toStep(game, "draw");
    expect(life(game, B)).toBe(18);
    expect(life(game, C)).toBe(20);
    // And the one after: "previously" isn't only last turn.
    nextTurn(game);
    nextTurn(game);
    toStep(game, "draw");
    expect(life(game, B)).toBe(17);
    expect(life(game, A)).toBe(20);
  });

  it("has no target before it has dealt damage, nor once it is a new object", () => {
    const seats = table();
    const { game } = seats;
    const vermin = spawn(game, "Diseased Vermin");
    game.state.objects[vermin].counters = { infection: 2 };
    nextTurn(game);
    toStep(game, "draw");
    expect(life(game, B)).toBe(20);
    attack(game, seats.a, [vermin]);
    expect(life(game, B)).toBe(19);
    seats.a.declareAttackersFn = () => [];
    // A new object (rule 400.7): the damage the old one dealt isn't its own.
    game.debugMove(vermin, "hand");
    game.debugMove(vermin, "battlefield");
    game.state.objects[vermin].counters = { infection: 2 };
    nextTurn(game);
    toStep(game, "draw");
    expect(life(game, B)).toBe(19);
  });
});
