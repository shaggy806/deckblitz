/**
 * A granted "this ability triggers only once each turn" is kept per grant —
 * the granting permanent in its stint, and which of its abilities — not by
 * where the ability sits in the permanent's list (Cursed Wombat's rulings,
 * rule 603.2h's "only once each turn" being the ability's own). Two Wombats
 * grant two abilities, each once a turn; a Wombat that leaves takes its
 * ability with it, and another Wombat's is a new one, fresh this turn, even
 * when it now sits where the old one did.
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, activate, counters, lands, nextTurn, ref, settle, spawn, table } from "./harness.js";

const WOMBAT = "Cursed Wombat";

/** One +1/+1 counter put on `id` by an effect of alice's, and what follows. */
function addCounter(game: Game, id: ObjectId): void {
  game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 }, [ref(id)]);
  settle(game);
}

describe("Cursed Wombat — permanents you control have an additional-counter trigger, once each turn", () => {
  it("adapting puts two, and its own granted trigger one more; later counters this turn get none, next turn one", () => {
    const { game } = table();
    const wombat = spawn(game, WOMBAT);
    lands(game, "Swamp", 2);
    lands(game, "Forest", 2);
    activate(game, wombat, 0);
    expect(counters(game, wombat)).toBe(3);
    addCounter(game, wombat);
    expect(counters(game, wombat)).toBe(4);
    nextTurn(game);
    nextTurn(game);
    addCounter(game, wombat);
    expect(counters(game, wombat)).toBe(6);
  });

  it("reaches a permanent without power and toughness (the ruling)", () => {
    const { game } = table();
    spawn(game, WOMBAT);
    const land = spawn(game, "Forest");
    addCounter(game, land);
    expect(counters(game, land)).toBe(2);
  });

  it("two Wombats are two abilities, each once a turn (the ruling)", () => {
    const { game } = table();
    spawn(game, WOMBAT);
    spawn(game, WOMBAT);
    const bears = spawn(game, "Grizzly Bears");
    addCounter(game, bears);
    expect(counters(game, bears)).toBe(3);
    addCounter(game, bears);
    expect(counters(game, bears)).toBe(4);
  });

  it("a new Wombat's ability is a new one: it triggers for a permanent the old one's already did this turn (the ruling)", () => {
    const { game } = table();
    const first = spawn(game, WOMBAT);
    const bears = spawn(game, "Grizzly Bears");
    addCounter(game, bears);
    expect(counters(game, bears)).toBe(2);
    game.debugMove(first, "graveyard");
    spawn(game, WOMBAT);
    addCounter(game, bears);
    expect(counters(game, bears)).toBe(4);
  });

  it("the same Wombat, gone and back, grants a new ability too (rule 400.7)", () => {
    const { game } = table();
    const wombat = spawn(game, WOMBAT);
    const bears = spawn(game, "Grizzly Bears");
    addCounter(game, bears);
    game.debugMove(wombat, "exile");
    game.debugMove(wombat, "battlefield");
    addCounter(game, bears);
    expect(counters(game, bears)).toBe(4);
  });

  it("when an earlier Wombat leaves, a later one's ability moving into its place is still its own", () => {
    const { game } = table();
    const earlier = spawn(game, WOMBAT);
    const bears = spawn(game, "Grizzly Bears");
    addCounter(game, bears);
    expect(counters(game, bears)).toBe(2);
    // The later Wombat's ability hasn't triggered this turn.
    spawn(game, WOMBAT);
    game.debugMove(earlier, "graveyard");
    addCounter(game, bears);
    expect(counters(game, bears)).toBe(4);
  });
});
