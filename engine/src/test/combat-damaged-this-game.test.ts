/**
 * "Each opponent dealt combat damage this game by a creature named Gollum,
 * Obsessed Stalker" — the journal's whole-game record of the names of the
 * creatures that dealt each player combat damage (`Journal.combatDamagedBy`),
 * read by the `combat-damaged-this-game` condition: only the opponents so
 * dealt, turns later, whoever controlled the creature, by the name it had
 * then, and never for noncombat damage or another creature's.
 */
import { describe, expect, it } from "vitest";

import { combatDamagedByNamed } from "../journal.js";
import { A, B, C, attack, life, nextTurn, spawn, table, toStep } from "./harness.js";

const GOLLUM = "Gollum, Obsessed Stalker";

describe("Gollum, Obsessed Stalker", () => {
  it("drains only the opponents a Gollum has dealt combat damage, for the life you gained this turn", () => {
    const { game, a } = table({ players: 3 });
    const gollum = spawn(game, GOLLUM);
    attack(game, a, [gollum], B);
    expect(life(game, B)).toBe(19);
    expect(combatDamagedByNamed(game.state, B, GOLLUM)).toBe(true);
    expect(combatDamagedByNamed(game.state, C, GOLLUM)).toBe(false);
    a.declareAttackersFn = () => [];
    // No life gained: nobody loses any.
    toStep(game, "end", B);
    expect([life(game, B), life(game, C)]).toEqual([19, 20]);
    // A round later the record still stands; life lost doesn't offset life gained (the ruling).
    toStep(game, "precombat-main", A);
    game.debugApplyEffect(A, { kind: "gain-life", amount: 3 }, []);
    game.debugApplyEffect(A, { kind: "lose-life", amount: 3, who: "you" }, []);
    toStep(game, "end", B);
    expect([life(game, A), life(game, B), life(game, C)]).toEqual([20, 16, 20]);
  });

  it("counts a Gollum anyone controlled, by its name as it dealt the damage", () => {
    const { game, a, b } = table({ players: 3 });
    const mine = spawn(game, GOLLUM, A);
    const theirs = spawn(game, GOLLUM, B);
    const bears = spawn(game, "Grizzly Bears", A);
    // Alice's Bears hit Carol: not a Gollum.
    attack(game, a, [bears], C);
    expect(combatDamagedByNamed(game.state, C, GOLLUM)).toBe(false);
    // Bob's Gollum hits Carol; Alice's own never dealt her damage.
    nextTurn(game);
    attack(game, b, [theirs], C);
    expect(combatDamagedByNamed(game.state, C, GOLLUM)).toBe(true);
    expect(combatDamagedByNamed(game.state, C, "Grizzly Bears")).toBe(true);
    // Bob's Gollum is gone; Alice's still drains Carol, and not Bob.
    game.debugMove(theirs, "graveyard");
    toStep(game, "precombat-main", A);
    game.debugApplyEffect(A, { kind: "gain-life", amount: 2 }, []);
    toStep(game, "end", A);
    expect(game.state.objects[mine].zone).toBe("battlefield");
    expect([life(game, B), life(game, C)]).toEqual([20, 15]);
  });

  it("noncombat damage from a Gollum isn't it", () => {
    const { game } = table();
    const gollum = spawn(game, GOLLUM);
    game.debugApplyEffect(A, { kind: "damage", amount: 2, who: "each-opponent" }, [], { source: gollum });
    expect(life(game, B)).toBe(18);
    expect(combatDamagedByNamed(game.state, B, GOLLUM)).toBe(false);
  });
});
