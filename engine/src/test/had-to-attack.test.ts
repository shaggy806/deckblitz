/**
 * "Had to attack" (rule 508.1d): each attacker's journal entry records
 * whether it was under a requirement to attack as it was declared — the
 * `"had-to-attack"` journal word, read by a `journaled` filter clause, with
 * `thisCombat` for "this combat". Firkraag, Cunning Instigator is the proving
 * card: its Dragons' attack goads, and a creature that had to attack dealing
 * combat damage to one of its controller's opponents grows it and draws.
 */

import { describe, expect, it } from "vitest";

import { matchesFilter } from "../filter.js";
import { goadersOf } from "../goad.js";
import { entriesThisTurn } from "../journal.js";
import { A, B, C, attack, counters, hand, pickTargets, spawn, table, watchTargets } from "./harness.js";

describe("the attack's journal entry records a requirement to attack", () => {
  it("a must-attack creature's entry is required, a free attacker's isn't", () => {
    const { game, a } = table();
    const juggernaut = spawn(game, "Juggernaut", A);
    const bears = spawn(game, "Grizzly Bears", A);
    attack(game, a, [juggernaut, bears]);
    const attacks = entriesThisTurn(game.state, "attacked");
    expect(attacks.find((e) => e.object === juggernaut)?.how).toBe("required");
    expect(attacks.find((e) => e.object === bears)?.how).toBeUndefined();
    const filter = { journaled: { what: "had-to-attack", thisCombat: true } } as const;
    expect(matchesFilter(game.state, game.registry, juggernaut, filter, { you: A })).toBe(true);
    expect(matchesFilter(game.state, game.registry, bears, filter, { you: A })).toBe(false);
  });

  it("a goaded creature had to attack", () => {
    const { game, b } = table({ players: 3 });
    const bears = spawn(game, "Grizzly Bears", B);
    game.debugApplyEffect(A, { kind: "goad", target: 0 }, [{ kind: "object", object: bears }]);
    attack(game, b, [bears], C);
    expect(entriesThisTurn(game.state, "attacked").find((e) => e.object === bears)?.how).toBe("required");
  });
});

describe("Firkraag, Cunning Instigator", () => {
  it("a Dragon attacking an opponent goads a creature that player controls", () => {
    const { game, a } = table({ players: 3 });
    const firkraag = spawn(game, "Firkraag, Cunning Instigator", A);
    const bobs = spawn(game, "Grizzly Bears", B);
    const bobsOther = spawn(game, "Grizzly Bears", B);
    spawn(game, "Grizzly Bears", C);
    const seen = watchTargets(a, () => [bobs]);
    attack(game, a, [firkraag], B);
    // Only the attacked player's creatures: Carol's Bears aren't offered.
    expect([...(seen.offered[0] ?? [])].sort()).toEqual([bobs, bobsOther].sort());
    expect(goadersOf(game.state, game.registry, bobs)).toEqual([A]);
    expect(goadersOf(game.state, game.registry, bobsOther)).toEqual([]);
  });

  it("not when only non-Dragons attack", () => {
    const { game, a } = table({ players: 3 });
    spawn(game, "Firkraag, Cunning Instigator", A);
    const bears = spawn(game, "Grizzly Bears", A);
    const bobs = spawn(game, "Grizzly Bears", B);
    attack(game, a, [bears], B);
    expect(goadersOf(game.state, game.registry, bobs)).toEqual([]);
  });

  it("grows and draws when a creature that had to attack deals combat damage to an opponent", () => {
    const { game, a } = table();
    const firkraag = spawn(game, "Firkraag, Cunning Instigator", A);
    const juggernaut = spawn(game, "Juggernaut", A);
    const before = hand(game, A).length;
    attack(game, a, [juggernaut], B);
    expect(counters(game, firkraag)).toBe(1);
    expect(hand(game, A).length).toBe(before + 1);
  });

  it("not for a creature that attacked freely", () => {
    const { game, a } = table();
    const firkraag = spawn(game, "Firkraag, Cunning Instigator", A);
    const bears = spawn(game, "Grizzly Bears", A);
    const before = hand(game, A).length;
    attack(game, a, [bears], B);
    expect(counters(game, firkraag)).toBe(0);
    expect(hand(game, A).length).toBe(before);
  });

  it("an opponent's goaded creature hitting another opponent counts", () => {
    const { game, a, b } = table({ players: 3 });
    const firkraag = spawn(game, "Firkraag, Cunning Instigator", A);
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    attack(game, a, [firkraag], B);
    expect(counters(game, firkraag)).toBe(0);
    const before = hand(game, A).length;
    attack(game, b, [bears], C);
    expect(game.state.players[C].life).toBe(18);
    expect(counters(game, firkraag)).toBe(1);
    expect(hand(game, A).length).toBe(before + 1);
  });
});
