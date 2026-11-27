/**
 * "Whenever this creature and another creature attack different players"
 * (Canal Courier): the `attacks` trigger's `anotherAttacksDifferentPlayer`.
 * It attacks a player and another attacker attacks another player; a
 * planeswalker attacked isn't a player (the card's ruling).
 */

import { describe, expect, it } from "vitest";

import { restrictionsOf } from "../characteristics.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import type { ScriptedController } from "../controller.js";
import { A, B, C, enter, spawn, table } from "./harness.js";

/** `attacks` declared; whether the Courier can't be blocked once the
 * declaration's triggers have resolved. */
function unblockableAfter(game: Game, a: ScriptedController, courier: ObjectId, attacks: readonly [ObjectId, PlayerId | ObjectId][]): boolean {
  a.declareAttackersFn = () => attacks.map(([attacker, defender]) => ({ attacker, defender }));
  game.advanceUntil((s) => s.turn.step === "declare-blockers");
  return restrictionsOf(game.state, game.registry, courier).has("cant-be-blocked");
}

describe("Canal Courier", () => {
  it("makes you the monarch as it enters", () => {
    const { game } = table();
    enter(game, "Canal Courier");
    expect(game.state.monarch).toBe(A);
  });

  it("attacking one player while another creature attacks another: can't be blocked", () => {
    const { game, a } = table({ players: 3 });
    const courier = spawn(game, "Canal Courier");
    const bears = spawn(game, "Grizzly Bears");
    expect(unblockableAfter(game, a, courier, [[courier, B], [bears, C]])).toBe(true);
  });

  it("is blocked as usual next combat", () => {
    const { game, a } = table({ players: 3 });
    const courier = spawn(game, "Canal Courier");
    const bears = spawn(game, "Grizzly Bears");
    unblockableAfter(game, a, courier, [[courier, B], [bears, C]]);
    game.advanceUntil((s) => s.turn.step === "postcombat-main");
    expect(restrictionsOf(game.state, game.registry, courier).has("cant-be-blocked")).toBe(false);
  });

  it("both attacking the same player: no trigger", () => {
    const { game, a } = table({ players: 3 });
    const courier = spawn(game, "Canal Courier");
    const bears = spawn(game, "Grizzly Bears");
    expect(unblockableAfter(game, a, courier, [[courier, B], [bears, B]])).toBe(false);
  });

  it("the other creature attacking a planeswalker isn't attacking a player", () => {
    const { game, a } = table({ players: 3 });
    const courier = spawn(game, "Canal Courier");
    const bears = spawn(game, "Grizzly Bears");
    const walker = spawn(game, "Ajani, Caller of the Pride", C);
    expect(unblockableAfter(game, a, courier, [[courier, B], [bears, walker]])).toBe(false);
  });

  it("attacking alone: no trigger", () => {
    const { game, a } = table({ players: 3 });
    const courier = spawn(game, "Canal Courier");
    expect(unblockableAfter(game, a, courier, [[courier, B]])).toBe(false);
  });
});
