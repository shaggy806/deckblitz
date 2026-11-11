/**
 * `may.costSacrifice` — "you may pay {2} **and sacrifice a token**. If you
 * do, …" (Killer Service): the mana and the sacrifice are one cost, paid in
 * full or not at all (rule 118.3), so the question is only asked when a token
 * would still be there to sacrifice once the mana is paid — a Treasure the
 * mana needs can't pay twice.
 */

import { describe, expect, it } from "vitest";

import { A, enter, lands, named, pickModes, spawn, table, tokensNamed, toStep, zone } from "./harness.js";
import type { ScriptedController } from "../controller.js";
import type { Game } from "../game.js";

/** Counts the yes/no questions the seat is asked, answering each `answer`. */
function countAsks(seat: ScriptedController, ...answer: number[]): { asked: number } {
  const seen = { asked: 0 };
  seat.chooseModesFn = () => {
    seen.asked += 1;
    return [...answer];
  };
  return seen;
}

/** Real Treasure tokens for alice (a spawned card isn't a token). */
const treasures = (game: Game, count: number): void =>
  game.debugApplyEffect(A, { kind: "create-token", token: "Treasure Token", count });

describe("Killer Service — pay {2} and sacrifice a token", () => {
  it("makes a Food for each opponent as it enters", () => {
    const { game } = table({ players: 4 });
    enter(game, "Killer Service");
    expect(tokensNamed(game, "Food Token", A)).toBe(3);
  });

  it("paid in full: the mana is spent, the token sacrificed, the Rhino made", () => {
    const { game, a } = table();
    enter(game, "Killer Service");
    const wastes = lands(game, "Wastes", 2);
    const [food] = named(game, "Food Token", A);
    pickModes(a, 0);
    toStep(game, "end");
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null);
    expect(game.state.objects[food]?.zone ?? "gone").not.toBe("battlefield");
    expect(wastes.every((id) => game.state.objects[id].tapped)).toBe(true);
    expect(tokensNamed(game, "Rhino Warrior Token", A)).toBe(1);
  });

  it("declined: nothing is paid", () => {
    const { game, a } = table();
    enter(game, "Killer Service");
    const wastes = lands(game, "Wastes", 2);
    const asks = countAsks(a);
    toStep(game, "end");
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null);
    expect(asks.asked).toBe(1);
    expect(tokensNamed(game, "Food Token", A)).toBe(1);
    expect(wastes.some((id) => game.state.objects[id].tapped)).toBe(false);
    expect(tokensNamed(game, "Rhino Warrior Token", A)).toBe(0);
  });

  it("isn't asked with no token to sacrifice, though the mana is there", () => {
    const { game, a } = table();
    spawn(game, "Killer Service");
    const wastes = lands(game, "Wastes", 2);
    const asks = countAsks(a, 0);
    toStep(game, "end");
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null);
    expect(asks.asked).toBe(0);
    expect(wastes.some((id) => game.state.objects[id].tapped)).toBe(false);
    expect(tokensNamed(game, "Rhino Warrior Token", A)).toBe(0);
  });

  it("isn't asked with a token but no mana", () => {
    const { game, a } = table();
    enter(game, "Killer Service");
    const asks = countAsks(a, 0);
    toStep(game, "end");
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null);
    expect(asks.asked).toBe(0);
    expect(tokensNamed(game, "Food Token", A)).toBe(1);
  });

  it("isn't asked when the only tokens are the Treasures the mana needs", () => {
    const { game, a } = table();
    spawn(game, "Killer Service");
    treasures(game, 2);
    const asks = countAsks(a, 0);
    toStep(game, "end");
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null);
    expect(asks.asked).toBe(0);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(2);
    expect(tokensNamed(game, "Rhino Warrior Token", A)).toBe(0);
  });

  it("a third Treasure pays the sacrifice once two have paid the mana", () => {
    const { game, a } = table();
    spawn(game, "Killer Service");
    treasures(game, 3);
    const asks = countAsks(a, 0);
    toStep(game, "end");
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null);
    expect(asks.asked).toBe(1);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(0);
    expect(tokensNamed(game, "Rhino Warrior Token", A)).toBe(1);
  });

  it("lands pay before a token does, and the player chooses which token goes", () => {
    const { game, a } = table();
    enter(game, "Killer Service");
    lands(game, "Wastes", 2);
    treasures(game, 1);
    const [treasure] = named(game, "Treasure Token", A);
    const [food] = named(game, "Food Token", A);
    pickModes(a, 0);
    let offered: readonly string[] = [];
    a.chooseSacrificesFn = (_view, eligible) => {
      offered = eligible;
      return [treasure];
    };
    toStep(game, "end");
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null);
    expect([...offered].sort()).toEqual([food, treasure].sort());
    expect(zone(game, food)).toBe("battlefield");
    expect(game.state.objects[treasure]?.zone ?? "gone").not.toBe("battlefield");
    expect(tokensNamed(game, "Rhino Warrior Token", A)).toBe(1);
  });
});
