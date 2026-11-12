/**
 * `choose-combat`'s `thisCombat` — "you choose which creatures block this
 * combat and how those creatures block" (Odric, Master Tactician): the
 * attacker answers the defender's declaration this combat, and the choice
 * ends with that combat (rule 511.3), not the turn.
 */
import { describe, expect, it } from "vitest";

import { blockChooser } from "../player-control.js";
import { A, B, settle, spawn, table, toStep } from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

function attackWith(game: Game, attackers: readonly ObjectId[]): void {
  game.advanceUntil((s) => s.awaiting?.kind === "attackers");
  game.dispatch({ type: "declare-attackers", player: A, attackers: attackers.map((attacker) => ({ attacker, defender: B })) });
  game.advanceUntil((s) => s.awaiting?.kind === "blockers" || (s.turn.step === "declare-blockers" && s.awaiting === null));
}

describe("Odric, Master Tactician", () => {
  it("with three others attacking, Odric's controller declares the blocks", () => {
    const { game } = table();
    const odric = spawn(game, "Odric, Master Tactician");
    const bears = [1, 2, 3].map(() => spawn(game, "Grizzly Bears"));
    const wall = spawn(game, "Grizzly Bears", B);
    toStep(game, "declare-attackers");
    attackWith(game, [odric, ...bears]);
    expect(game.state.awaiting).toMatchObject({ kind: "blockers", player: B });
    expect(blockChooser(game.state, B)).toBe(A);
    game.dispatch({ type: "declare-blockers", player: B, blocks: [{ blocker: wall, attacker: odric }] });
    expect(game.state.objects[wall].blocking).toBeDefined();
    settle(game);
    // The combat over, the choice is gone.
    game.advanceUntil((s) => s.turn.step === "postcombat-main");
    expect(game.state.combatChoices ?? []).toEqual([]);
    expect(blockChooser(game.state, B)).toBeNull();
  });

  it("with only two others, nothing triggers", () => {
    const { game } = table();
    const odric = spawn(game, "Odric, Master Tactician");
    const bears = [1, 2].map(() => spawn(game, "Grizzly Bears"));
    spawn(game, "Grizzly Bears", B);
    toStep(game, "declare-attackers");
    attackWith(game, [odric, ...bears]);
    expect(blockChooser(game.state, B)).toBeNull();
  });
});
