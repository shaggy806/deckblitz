/**
 * Mutated Cultist: "remove all counters from up to one target permanent or
 * opponent", every kind a player has (rule 122.1), and the next spell costs
 * {1} less for each counter removed this way. Written from the Oracle text
 * and its rulings.
 */
import { describe, expect, it } from "vitest";

import { A, B, cast, counters, lands, pickTargets, ref, spawn, table, toHand, zone } from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

const addCounters = (game: Game, id: ObjectId, counter: string, amount: number): void =>
  game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter, amount }, [ref(id)]);

const playerCounters = (game: Game, player: typeof B): { poison: number; energy: number } => {
  const ps = game.state.players[player];
  return { poison: ps.counters.poison ?? 0, energy: ps.energy };
};

describe("Mutated Cultist", () => {
  it("removes every kind of counter from an opponent, and the next spell costs that much less", () => {
    const { game, a } = table();
    game.debugApplyEffect(A, { kind: "add-player-counters", counter: "poison", amount: 3, who: "each-opponent" });
    game.debugApplyEffect(A, { kind: "get-energy", amount: 2, who: "each-opponent" });
    expect(playerCounters(game, B)).toEqual({ poison: 3, energy: 2 });
    lands(game, "Swamp", 3);
    pickTargets(a, B);
    cast(game, toHand(game, "Mutated Cultist"));
    expect(playerCounters(game, B)).toEqual({ poison: 0, energy: 0 });
    // Five counters: Ancient Brontodon ({6}{G}{G}) for {G}{G}... less five.
    lands(game, "Forest", 3);
    const bronto = toHand(game, "Ancient Brontodon");
    cast(game, bronto);
    expect(zone(game, bronto)).toBe("battlefield");
  });

  it("removes all counters from a permanent, and the reduction is for the next spell only", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    addCounters(game, bears, "+1/+1", 1);
    addCounters(game, bears, "shield", 1);
    lands(game, "Swamp", 3);
    pickTargets(a, bears);
    cast(game, toHand(game, "Mutated Cultist"));
    expect(counters(game, bears)).toBe(0);
    expect(counters(game, bears, "shield")).toBe(0);
    // Two counters: Hill Giant ({3}{R}) for {1}{R}.
    lands(game, "Mountain", 2);
    const giant = toHand(game, "Hill Giant");
    cast(game, giant);
    expect(zone(game, giant)).toBe("battlefield");
    // The next one pays in full.
    lands(game, "Mountain", 2);
    expect(() => cast(game, toHand(game, "Hill Giant"))).toThrow();
  });

  it("can't target you", () => {
    const { game, a } = table();
    game.debugApplyEffect(A, { kind: "add-player-counters", counter: "poison", amount: 2 });
    lands(game, "Swamp", 3);
    pickTargets(a, A);
    // A target it can't have is no target: the cast goes on without one.
    try {
      cast(game, toHand(game, "Mutated Cultist"));
    } catch {
      // Refused outright is as good.
    }
    expect(playerCounters(game, A).poison).toBe(2);
  });
});
