import { describe, expect, it } from "vitest";

import { A, B, C, activate, controller, named, pickModes, pickPermanents, spawn, table, toStep } from "./harness.js";
import type { Game } from "../game.js";
import type { ScriptedController } from "../controller.js";
import type { ObjectId, PlayerId } from "../primitives.js";

// Rule 508.4: "if an effect states that a creature is attacking", it attacks
// what the effect names (or what its controller chooses). It was never
// declared (508.3a: no "attacks" trigger), no attack restriction applies
// (508.4c), and only the attacking player's creature, in combat, attacks at
// all (506.3b) — `is-attacking`. Midnight Crusader Shuttle's villainous
// choice is its card.

/** Alice crews the Shuttle with a Grizzly Bears and attacks `defender` with
 * it; the game runs until the villainous choice has resolved (declare
 * attackers step, priority back with her). */
function shuttleAttacks(game: Game, a: ScriptedController, defender: PlayerId = B): ObjectId {
  const shuttle = spawn(game, "Midnight Crusader Shuttle", A);
  spawn(game, "Grizzly Bears", A);
  activate(game, shuttle, 0);
  a.declareAttackersFn = () => [{ attacker: shuttle, defender }];
  game.advanceUntil(
    (s) =>
      s.turn.step === "declare-attackers" &&
      s.awaiting === null &&
      s.zones.shared.stack.length === 0 &&
      s.priority.holder === A,
  );
  return shuttle;
}

describe("is-attacking — Midnight Crusader Shuttle", () => {
  it("the villain takes a creature of their choice, taps it, and it's attacking that player", () => {
    const { game, a, b } = table({ players: 2 });
    const ogre = spawn(game, "Hill Giant", B);
    const elf = spawn(game, "Llanowar Elves", B);
    pickModes(b, 1); // Bob chooses the second option.
    const seen = pickPermanents(a, ogre);
    const before = game.events.length;
    shuttleAttacks(game, a);
    expect([...seen.offered].sort()).toEqual([ogre, elf].sort());
    expect(controller(game, ogre)).toBe(A);
    expect(game.state.objects[ogre].tapped).toBe(true);
    expect(game.state.objects[ogre].attacking).toBe(B);
    // Stated to be attacking, never declared (508.3a).
    const declared = game.events.slice(before).filter((e) => e.type === "attacker-declared").map((e) => e.attacker);
    expect(declared).not.toContain(ogre);
    // It deals its combat damage to bob, the Shuttle beside it.
    toStep(game, "postcombat-main");
    expect(game.state.players[B].life).toBe(20 - 3 - 3);
    // Until end of turn: bob has it back next turn.
    game.advanceUntil((s) => s.turn.number === 2);
    expect(controller(game, ogre)).toBe(B);
  });

  it("the other option: that player sacrifices a creature of their choice, and nothing is taken", () => {
    const { game, a, b } = table({ players: 2 });
    const ogre = spawn(game, "Hill Giant", B);
    pickModes(b, 0);
    pickPermanents(b, ogre);
    shuttleAttacks(game, a);
    expect(named(game, "Hill Giant")).toEqual([]);
  });

  it("at four players it attacks the defending player of the Shuttle, not another", () => {
    const { game, a, c } = table({ players: 4 });
    spawn(game, "Hill Giant", B);
    const elf = spawn(game, "Llanowar Elves", C);
    pickModes(c, 1);
    const seen = pickPermanents(a, elf);
    shuttleAttacks(game, a, C);
    expect(seen.offered).toEqual([elf]);
    expect(controller(game, elf)).toBe(A);
    expect(game.state.objects[elf].attacking).toBe(C);
  });

  it("outside combat, or for a player who isn't attacking, nothing attacks (rule 506.3b)", () => {
    const { game } = table({ players: 2 });
    const bears = spawn(game, "Grizzly Bears", A);
    game.debugApplyEffect(A, { kind: "is-attacking", target: 0, at: "choose" }, [{ kind: "object", object: bears }]);
    expect(game.state.objects[bears].attacking ?? null).toBe(null);
  });
});
