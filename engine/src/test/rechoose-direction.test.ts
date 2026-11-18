/**
 * "Choose left or right" again and again: Mystic Barrier's "when this
 * enchantment enters and at the beginning of your upkeep, choose left or
 * right. Each player may attack only the nearest opponent in the last chosen
 * direction and planeswalkers controlled by that opponent." Each choice is a
 * resolution-time `modal` (rule 608.2d) whose mode notes its word on the
 * enchantment (`note`'s `word`), replacing the one before; Pramikon's
 * `attackOnlyNearestOpponent` static reads it. Left is onward in turn order.
 */

import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import { nearestOpponentRule } from "../combat/eligibility.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, C, D, enter, pickModes, registryOf, spawn, table, toStep } from "./harness.js";

const BARRIER = "Mystic Barrier";

const defendersFor = (game: Game, player: PlayerId, attacker: ObjectId): readonly (PlayerId | ObjectId)[] => {
  const offer = game
    .legalActions(player)
    .find((o): o is Extract<LegalAction, { kind: "declare-attackers" }> => o.kind === "declare-attackers");
  return offer?.defendersFor[attacker] ?? [];
};

describe("Mystic Barrier", () => {
  it("asks as its enters trigger resolves, and every player attacks that way", () => {
    const { game, a } = table({ players: 4 });
    pickModes(a, 0);
    const barrier = enter(game, BARRIER);
    expect(game.state.objects[barrier].chosenOnEnter).toBe("left");
    // Left is onward in turn order: Bob's nearest is Carol, Dave's is Alice.
    expect(nearestOpponentRule(game.state, registryOf(game), B)).toEqual([C]);
    expect(nearestOpponentRule(game.state, registryOf(game), D)).toEqual([A]);
  });

  it("does nothing until the enters trigger has resolved", () => {
    const { game } = table({ players: 4 });
    const barrier = enter(game, BARRIER, A, { settle: false });
    expect(game.state.objects[barrier].chosenOnEnter).toBeUndefined();
    expect(nearestOpponentRule(game.state, registryOf(game), B)).toBeNull();
  });

  it("chooses again at the beginning of your upkeep: the last chosen direction counts", () => {
    const { game, a } = table({ players: 4 });
    pickModes(a, 0);
    const barrier = enter(game, BARRIER);
    pickModes(a, 1);
    // Not on another player's upkeep: Bob's turn comes and goes as left.
    toStep(game, "precombat-main", B);
    expect(game.state.objects[barrier].chosenOnEnter).toBe("left");
    toStep(game, "precombat-main", A);
    expect(game.state.objects[barrier].chosenOnEnter).toBe("right");
    // Right is back: Bob's nearest is Alice now, Alice's Dave.
    expect(nearestOpponentRule(game.state, registryOf(game), B)).toEqual([A]);
    expect(nearestOpponentRule(game.state, registryOf(game), A)).toEqual([D]);
  });

  it("limits the attack declaration to that opponent and their planeswalkers", () => {
    const { game, a } = table({ players: 4 });
    pickModes(a, 1);
    enter(game, BARRIER);
    const walker = spawn(game, "Ajani, Caller of the Pride", D);
    const carolWalker = spawn(game, "Ajani, Caller of the Pride", C);
    const bears = spawn(game, "Grizzly Bears", A);
    game.advanceUntil((s) => s.awaiting?.kind === "attackers");
    // Right of Alice is Dave: Dave and his planeswalker, not Carol's.
    const defenders = defendersFor(game, A, bears);
    expect([...defenders].sort()).toEqual([D, walker].sort());
    expect(defenders).not.toContain(carolWalker);
  });

  // The ruling: two with different directions leave only an opponent nearest
  // both ways — nobody at four players, the other player at two.
  it("two that disagree: nobody at four players, the opponent at two", () => {
    const four = table({ players: 4 });
    pickModes(four.a, 0);
    enter(four.game, BARRIER);
    pickModes(four.a, 1);
    enter(four.game, BARRIER);
    expect(nearestOpponentRule(four.game.state, registryOf(four.game), B)).toEqual([]);

    const two = table();
    pickModes(two.a, 0);
    enter(two.game, BARRIER);
    pickModes(two.a, 1);
    enter(two.game, BARRIER);
    expect(nearestOpponentRule(two.game.state, registryOf(two.game), A)).toEqual([B]);
  });

  it("loses its abilities, loses the rule", () => {
    const { game, a } = table({ players: 4 });
    pickModes(a, 0);
    enter(game, BARRIER);
    spawn(game, "Humility");
    spawn(game, "Opalescence");
    expect(nearestOpponentRule(game.state, registryOf(game), B)).toBeNull();
  });
});
