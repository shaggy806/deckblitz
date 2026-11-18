/**
 * Rangers of Ithilien: "gain control of up to one target creature with
 * lesser power for as long as you control this creature. Then the Ring
 * tempts you." — the target's power is compared with the source's
 * (`power: { op: "lt", n: { amount: { powerOf: "source" } } }`) as it's
 * chosen and as it resolves (the ruling); no target still tempts, an illegal
 * one stops it all (rule 608.2b).
 */
import { describe, expect, it } from "vitest";

import { A, B, controller, enter, ref, spawn, table, watchTargets } from "./harness.js";

describe("Rangers of Ithilien", () => {
  it("offers only creatures with lesser power, takes one, and the Ring tempts you", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    const seen = watchTargets(a, () => [bears]);
    const rangers = enter(game, "Rangers of Ithilien");
    expect(seen.asked).toBe(1);
    expect(seen.offered[0]).toContain(bears);
    expect(seen.offered[0]).not.toContain(giant);
    expect(seen.offered[0]).not.toContain(rangers);
    expect(controller(game, bears)).toBe(A);
    expect(game.state.players[A].ringTemptations).toBe(1);
    // For as long as you control the Rangers.
    game.debugApplyEffect(B, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [ref(rangers)]);
    expect(controller(game, bears)).toBe(B);
  });

  it("with no target chosen, the Ring still tempts you", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    watchTargets(a);
    enter(game, "Rangers of Ithilien");
    expect(controller(game, bears)).toBe(B);
    expect(game.state.players[A].ringTemptations).toBe(1);
  });

  it("a target whose power is no longer lesser as it resolves: nothing happens, and no temptation", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    watchTargets(a, () => [bears]);
    enter(game, "Rangers of Ithilien", A, { settle: false });
    game.advanceUntil((s) => s.zones.shared.stack.length > 0 && s.priority.holder === A);
    game.debugApplyEffect(B, { kind: "modify-pt", target: 0, power: 1, toughness: 0, duration: "end-of-turn" }, [ref(bears)]);
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null && s.pendingTriggers.length === 0);
    expect(controller(game, bears)).toBe(B);
    expect(game.state.players[A].ringTemptations ?? 0).toBe(0);
  });
});
