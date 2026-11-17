import { describe, expect, it } from "vitest";

import { A, B, C, cast, lands, life, ref, settle, spawn, table, toHand, zone } from "./harness.js";
import { activePlayerOf } from "../state.js";

/**
 * A rules audit (2026-11-17), second slice: how a multiplayer game carries on
 * when a player is lost in the middle of things — the turn's owner, an
 * attacker's controller, several players at once.
 */
describe("a multiplayer game going on past a loss", () => {
  it("finishes the turn of a player who lost during it, then gives the next player theirs (rule 800.4j)", () => {
    const { game } = table({ players: 3 });
    lands(game, "Mountain", 1);
    game.state.players[A].life = 2;
    cast(game, toHand(game, "Shock"), { targets: [ref(A)] });
    expect(game.state.players[A].hasLost).toBe(true);
    expect(game.state.result.over).toBe(false);
    // Still turn 1, with nobody its active player's priority: bob holds it.
    expect(game.state.turn.number).toBe(1);
    expect(game.state.priority.holder).toBe(B);
    game.advanceUntil((s) => s.turn.number === 2 || s.result.over);
    expect(game.state.result.over).toBe(false);
    expect(activePlayerOf(game.state)).toBe(B);
  });

  it("takes an attack with it when the attacking player loses in their own combat", () => {
    const { game, a } = table({ players: 3 });
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 1);
    game.state.players[A].life = 2;
    const shock = toHand(game, "Shock");
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    game.advanceUntil((s) => s.turn.step === "declare-attackers" && s.awaiting === null && s.priority.holder === A);
    const bob = life(game, B);
    cast(game, shock, { targets: [ref(A)] });
    expect(game.state.players[A].hasLost).toBe(true);
    game.advanceUntil((s) => s.turn.number === 2 || s.result.over);
    expect(game.state.result.over).toBe(false);
    expect(life(game, B)).toBe(bob);
    expect(activePlayerOf(game.state)).toBe(B);
  });

  it("is won by the one player left when the others lose together", () => {
    const { game } = table({ players: 3 });
    game.state.players[B].life = 1;
    game.state.players[C].life = 1;
    lands(game, "Mountain", 1);
    game.debugApplyEffect(A, { kind: "damage", amount: 1, who: "each-opponent" });
    // State-based actions run as a player would next get priority.
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(game.state.result).toMatchObject({ over: true, winner: A });
  });

  it("is a draw when every player loses at once (rule 104.4a)", () => {
    const { game } = table({ players: 3 });
    for (const p of [A, B, C]) game.state.players[p].life = 1;
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 1);
    game.debugApplyEffect(A, { kind: "damage", amount: 1, who: "each-player" });
    cast(game, toHand(game, "Shock"), { targets: [ref(bears)] });
    settle(game);
    expect(game.state.result.over).toBe(true);
    expect(game.state.result.winner ?? null).toBe(null);
    expect(zone(game, bears)).toBeDefined();
  });
});
