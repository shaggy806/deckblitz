/**
 * `dealtDamageThisTurn: { to: "opponent" }` — "if this creature dealt damage
 * to an opponent this turn" (Dunerider Outlaw, Whirling Dervish), read
 * against the creature's controller now.
 */
import { describe, expect, it } from "vitest";
import { A, B, C, attack, counters, ref, settle, spawn, table, toStep } from "./harness.js";

describe("dealt damage to an opponent this turn", () => {
  it("Dunerider Outlaw gets one counter at the end step after hitting an opponent, and a creature that stayed home none", () => {
    const { game, a } = table();
    const outlaw = spawn(game, "Dunerider Outlaw", A);
    const home = spawn(game, "Dunerider Outlaw", A);
    attack(game, a, [outlaw], B);
    toStep(game, "end");
    settle(game);
    expect(counters(game, outlaw)).toBe(1);
    expect(counters(game, home)).toBe(0);
  });

  it("damage to the player who now controls it doesn't count for Whirling Dervish", () => {
    const { game, a } = table({ players: 3 });
    const dervish = spawn(game, "Whirling Dervish", A);
    attack(game, a, [dervish], C);
    // Carol, the player it hit, takes control of it before the end step.
    game.debugApplyEffect(C, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [ref(dervish)]);
    toStep(game, "end", A);
    settle(game);
    expect(counters(game, dervish)).toBe(0);
  });

  it("an opponent's damage counts for whoever controls it as the end step begins", () => {
    const { game, a } = table({ players: 3 });
    const dervish = spawn(game, "Whirling Dervish", A);
    attack(game, a, [dervish], C);
    // Bob takes it: Carol is still Bob's opponent.
    game.debugApplyEffect(B, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [ref(dervish)]);
    toStep(game, "end", A);
    settle(game);
    expect(counters(game, dervish)).toBe(1);
  });
});
