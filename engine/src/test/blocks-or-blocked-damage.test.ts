/**
 * "Whenever this creature blocks or becomes blocked by a creature, this creature deals N
 * damage to that creature" — both halves (Ashmouth Hound and Inferno Elemental once had only
 * the "blocks" half; found in batch 199). The other creature survives, so its marked damage
 * at end of combat is the trigger's plus the combat damage.
 */
import { describe, expect, it } from "vitest";
import { A, B, nextTurn, spawn, table } from "./harness.js";

describe("blocks or becomes blocked by: damage to that creature", () => {
  for (const [card, amount, power] of [
    ["Ashmouth Hound", 1, 2],
    ["Inferno Elemental", 3, 4],
  ] as const) {
    it(`${card} damages the creature blocking it`, () => {
      const { game, a, b } = table();
      const attacker = spawn(game, card);
      const wall = spawn(game, "Wall of Stone", B); // 0/8
      a.declareAttackersFn = () => [{ attacker, defender: B }];
      b.declareBlockersFn = () => [{ blocker: wall, attacker }];
      game.advanceUntil((s) => s.turn.step === "end-combat");
      expect(game.state.objects[wall]!.damageMarked).toBe(amount + power);
    });

    it(`${card} damages the creature it blocks`, () => {
      const { game, a, b } = table();
      const blocker = spawn(game, card);
      const colossus = spawn(game, "Darksteel Colossus", B); // 11/11 indestructible
      nextTurn(game);
      b.declareAttackersFn = () => [{ attacker: colossus, defender: A }];
      a.declareBlockersFn = () => [{ blocker, attacker: colossus }];
      game.advanceUntil((s) => s.turn.number === 2 && s.turn.step === "end-combat");
      expect(game.state.objects[colossus]!.damageMarked).toBe(amount + power);
    });
  }
});
