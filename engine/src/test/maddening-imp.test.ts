/**
 * Maddening Imp: "non-Wall creatures the active player controls attack this
 * turn if able", the set fixed as it resolves (rule 611.2c, `restrict`'s
 * `asItResolves`) and remembered for the delayed trigger that destroys each
 * of those creatures that didn't attack (`remember` `onBattlefield`).
 */
import { describe, expect, it } from "vitest";

import { A, B, activate, attack, spawn, table, zone } from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import type { GameState } from "../state.js";

/** Alice's priority in `step` of bob's turn 2. */
const onBobsTurn = (game: Game, step: GameState["turn"]["step"]): void => {
  game.advanceUntil((s) => s.turn.number === 2 && s.turn.step === step && s.priority.holder === A);
};

const offer = (game: Game, imp: ObjectId) =>
  game.canDispatch({ type: "activate-ability", player: A, source: imp, abilityIndex: 0 });

describe("Maddening Imp", () => {
  it("only on an opponent's turn, and only before combat", () => {
    const { game } = table();
    const imp = spawn(game, "Maddening Imp");
    expect(offer(game, imp)).not.toBeNull();
    onBobsTurn(game, "upkeep");
    expect(offer(game, imp)).toBeNull();
    onBobsTurn(game, "precombat-main");
    expect(offer(game, imp)).toBeNull();
    onBobsTurn(game, "begin-combat");
    expect(offer(game, imp)).not.toBeNull();
  });

  it("forces the attack; what attacked survives, what couldn't is destroyed, a Wall and a later arrival are left alone", () => {
    const { game, b } = table();
    const imp = spawn(game, "Maddening Imp");
    const attacker = spawn(game, "Grizzly Bears", B);
    const tapped = spawn(game, "Grizzly Bears", B);
    const wall = spawn(game, "Wall of Omens", B);
    const mine = spawn(game, "Grizzly Bears", A);
    onBobsTurn(game, "upkeep");
    activate(game, imp, 0);
    expect(game.state.objects[imp].tapped).toBe(true);
    // Tapped after it resolved, so it can't attack: the trigger asks only whether it did.
    game.state.objects[tapped].tapped = true;
    const late = spawn(game, "Grizzly Bears", B);
    game.state.objects[late].tapped = true;
    attack(game, b, [attacker], A);
    expect(game.state.objects[attacker].attackedThisTurn).toBe(true);
    game.advanceUntil((s) => s.turn.number === 3);
    expect(zone(game, attacker)).toBe("battlefield");
    expect(zone(game, tapped)).toBe("graveyard");
    expect(zone(game, wall)).toBe("battlefield");
    expect(zone(game, late)).toBe("battlefield");
    expect(zone(game, mine)).toBe("battlefield");
  });

  it("holds the active player to it: a seat naming no attackers still sends them", () => {
    const { game } = table();
    const imp = spawn(game, "Maddening Imp");
    const bears = spawn(game, "Grizzly Bears", B);
    const elves = spawn(game, "Llanowar Elves", B);
    onBobsTurn(game, "draw");
    activate(game, imp, 0);
    onBobsTurn(game, "postcombat-main");
    expect(game.state.objects[bears].attackedThisTurn).toBe(true);
    expect(game.state.objects[elves].attackedThisTurn).toBe(true);
    game.advanceUntil((s) => s.turn.number === 3);
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, elves)).toBe("battlefield");
  });
});
