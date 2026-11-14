/**
 * "If they were attacked this turn by an Assassin you controlled": the
 * `turn-history` condition's `against`, only the journal entries done to one
 * player — here the attacks at them, each attacker matched as it was declared
 * and its controller then (rule 508.1; a planeswalker of theirs isn't them,
 * and one put onto the battlefield attacking never attacked, 508.4). Ramses,
 * Assassin Lord is the proving card.
 */

import { describe, expect, it } from "vitest";

import { A, B, C, attack, settle, spawn, table } from "./harness.js";

describe("Ramses, Assassin Lord", () => {
  it("you win when a player an Assassin of yours attacked this turn loses", () => {
    const { game, a } = table({ players: 3 });
    const ramses = spawn(game, "Ramses, Assassin Lord", A);
    game.state.players[B].life = 4;
    attack(game, a, [ramses], B);
    expect(game.state.players[B].hasLost).toBe(true);
    expect(game.state.result.over).toBe(true);
    expect(game.state.result.winner).toBe(A);
  });

  it("whatever makes them lose, after the attack", () => {
    const { game, a } = table({ players: 3 });
    const ramses = spawn(game, "Ramses, Assassin Lord", A);
    attack(game, a, [ramses], B);
    expect(game.state.result.over).toBe(false);
    game.debugApplyEffect(A, { kind: "lose-game", target: 0 }, [{ kind: "player", player: B }]);
    settle(game);
    expect(game.state.players[B].hasLost).toBe(true);
    expect(game.state.result.winner).toBe(A);
  });

  it("not when only a non-Assassin attacked them", () => {
    const { game, a } = table({ players: 3 });
    spawn(game, "Ramses, Assassin Lord", A);
    const bears = spawn(game, "Grizzly Bears", A);
    game.state.players[B].life = 2;
    attack(game, a, [bears], B);
    expect(game.state.players[B].hasLost).toBe(true);
    expect(game.state.result.over).toBe(false);
  });

  it("not for a player the Assassin didn't attack", () => {
    const { game, a } = table({ players: 3 });
    const ramses = spawn(game, "Ramses, Assassin Lord", A);
    attack(game, a, [ramses], B);
    game.debugApplyEffect(A, { kind: "lose-game", target: 0 }, [{ kind: "player", player: C }]);
    settle(game);
    expect(game.state.players[C].hasLost).toBe(true);
    expect(game.state.result.over).toBe(false);
  });

  it("not an Assassin an opponent controlled", () => {
    const { game, b } = table({ players: 3 });
    spawn(game, "Ramses, Assassin Lord", A);
    const theirs = spawn(game, "Ramses, Assassin Lord", B);
    game.state.players[C].life = 4;
    attack(game, b, [theirs], C);
    expect(game.state.players[C].hasLost).toBe(true);
    // Bob's own Ramses wins him the game; Alice's doesn't.
    expect(game.state.result.winner).toBe(B);
  });
});
