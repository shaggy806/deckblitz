/**
 * "If this ability has been activated four or more times this turn" on a mana
 * ability (Initiates of the Ebon Hand, Farrelite Priest): it never uses the
 * stack (rule 605.3b), so each activation is counted as it resolves, by hand
 * or by the auto-payer, this one among them, per object (rule 400.7).
 */
import { describe, expect, it } from "vitest";

import { A, activate, cast, lands, nextTurn, spawn, table, toHand, zone } from "./harness.js";
import type { Game } from "../game.js";

const delayed = (game: Game): number => (game.state.delayedTriggers ?? []).length;

describe("a mana ability's activations this turn (Initiates of the Ebon Hand)", () => {
  it("three activations: mana made, no sacrifice", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const initiates = spawn(game, "Initiates of the Ebon Hand");
    for (let i = 0; i < 3; i += 1) activate(game, initiates);
    expect(game.state.players[A].manaPool.filter((u) => u.type === "B").length).toBeGreaterThanOrEqual(1);
    expect(delayed(game)).toBe(0);
    nextTurn(game);
    expect(zone(game, initiates)).toBe("battlefield");
  });

  it("the fourth sets up the sacrifice at the next end step", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    const initiates = spawn(game, "Initiates of the Ebon Hand");
    for (let i = 0; i < 3; i += 1) activate(game, initiates);
    expect(delayed(game)).toBe(0);
    activate(game, initiates);
    expect(delayed(game)).toBe(1);
    activate(game, initiates);
    expect(delayed(game)).toBe(2);
    expect(zone(game, initiates)).toBe("battlefield");
    nextTurn(game);
    expect(zone(game, initiates)).toBe("graveyard");
  });

  it("an activation the auto-payer makes counts too", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    const initiates = spawn(game, "Initiates of the Ebon Hand");
    // Only the Initiates can make {B}: the payment activates it once.
    const rats = toHand(game, "Typhoid Rats");
    cast(game, rats);
    expect(zone(game, rats)).toBe("battlefield");
    for (let i = 0; i < 2; i += 1) activate(game, initiates);
    expect(delayed(game)).toBe(0);
    activate(game, initiates);
    expect(delayed(game)).toBe(1);
  });

  it("the count restarts each turn and with a new object", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    const priest = spawn(game, "Farrelite Priest");
    for (let i = 0; i < 3; i += 1) activate(game, priest);
    nextTurn(game);
    nextTurn(game);
    for (let i = 0; i < 3; i += 1) activate(game, priest);
    expect(delayed(game)).toBe(0);
    const other = spawn(game, "Farrelite Priest");
    activate(game, other);
    expect(delayed(game)).toBe(0);
  });
});
