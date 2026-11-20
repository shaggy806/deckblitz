/**
 * A flicker's delayed return, tapped and attacking, at the declare attackers
 * step of the controller's next turn (`returnAt` `which: "next-turn"`,
 * `attacking: "choose"`) — Meandering Towershell's "whenever this creature
 * attacks, exile it. Return it to the battlefield under your control tapped
 * and attacking at the beginning of the declare attackers step on your next
 * turn" (rule 508.4: it was never declared as an attacker).
 */
import { describe, expect, it } from "vitest";

import { A, B, life, named, spawn, table, toStep, zone } from "./harness.js";

describe("Meandering Towershell", () => {
  it("is exiled as it attacks and returns attacking on your next turn, not this one or theirs", () => {
    const { game, a } = table();
    const shell = spawn(game, "Meandering Towershell");
    a.declareAttackersFn = () => (game.state.turn.number === 1 ? [{ attacker: shell, defender: B }] : []);
    toStep(game, "postcombat-main");
    expect(zone(game, shell)).toBe("exile");
    expect(life(game, B)).toBe(20);
    // Bob's turn: it stays in exile through his combat.
    toStep(game, "postcombat-main", B);
    expect(named(game, "Meandering Towershell")).toEqual([]);
    // Alice's next turn: back once attackers are declared, tapped and attacking.
    game.advanceUntil((s) => s.turn.step === "declare-blockers" && s.turn.number === 3);
    const back = named(game, "Meandering Towershell")[0];
    expect(back).toBeDefined();
    expect(game.state.objects[back].tapped).toBe(true);
    expect(game.state.objects[back].attacking).toBe(B);
    expect(game.state.objects[back].controller).toBe(A);
    toStep(game, "postcombat-main");
    expect(life(game, B)).toBe(15);
    // It was put onto the battlefield attacking, not declared: no new trigger.
    expect(zone(game, back)).toBe("battlefield");
  });
});
