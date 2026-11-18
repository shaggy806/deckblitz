/**
 * "If a noncreature permanent under your control was destroyed this turn by a
 * spell or ability an opponent controlled": the journal's `destroyed` entries
 * (rule 701.8b — a "destroy" effect, or the lethal-damage and deathtouch
 * state-based actions, 704.5g-h; nothing else put into a graveyard), each with
 * who controlled the destroying spell or ability (`by`), read by the
 * `turn-history` condition's `by`. Cobra Trap.
 */
import { describe, expect, it } from "vitest";

import { A, B, C, cast, destroy, lands, ref, spawn, table, toHand, toStep, tokensNamed } from "./harness.js";

describe("Cobra Trap", () => {
  it("costs {G} once an opponent's spell or ability destroyed a noncreature permanent of yours this turn", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    const stone = spawn(game, "Mind Stone");
    const trap = toHand(game, "Cobra Trap");
    expect(() => cast(game, trap, { altCost: true, settle: false })).toThrow(/alternative/i);
    destroy(game, stone, B);
    cast(game, trap, { altCost: true });
    expect(tokensNamed(game, "Snake Token", A)).toBe(4);
  });

  it("isn't opened by your own destruction, a creature, or another player's permanent", () => {
    const { game } = table({ players: 3 });
    lands(game, "Forest", 1);
    const trap = toHand(game, "Cobra Trap");
    // Your own spell destroying your artifact.
    destroy(game, spawn(game, "Mind Stone"), A);
    // An opponent destroying your creature.
    destroy(game, spawn(game, "Grizzly Bears"), B);
    // One opponent destroying another's artifact.
    destroy(game, spawn(game, "Mind Stone", C), B);
    expect(() => cast(game, trap, { altCost: true, settle: false })).toThrow(/alternative/i);
  });

  it("counts a permanent destroyed as it last existed, and only this turn", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    const stone = spawn(game, "Mind Stone");
    destroy(game, stone, B);
    const entry = game.state.journal?.entries.find((e) => e.kind === "destroyed" && e.object === stone);
    expect(entry?.player).toBe(A);
    expect(entry?.by).toBe(B);
    // Bob's turn, then alice's again: last turn's destruction doesn't open it.
    game.advanceUntil((s) => s.turn.number === 3 && s.turn.step === "precombat-main" && s.priority.holder === A);
    const trap = toHand(game, "Cobra Trap");
    expect(() => cast(game, trap, { altCost: true, settle: false })).toThrow(/alternative/i);
  });

  it("records a creature destroyed by lethal damage, with no one behind it", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(B, { kind: "damage", amount: 2, target: 0 }, [ref(bears)]);
    // The state-based actions run as the game moves on.
    toStep(game, "begin-combat");
    expect(game.state.objects[bears].zone).toBe("graveyard");
    expect(game.state.turn.number).toBe(1);
    const entry = game.state.journal?.entries.find((e) => e.kind === "destroyed" && e.object === bears);
    expect(entry?.player).toBe(A);
    expect(entry?.by).toBeUndefined();
  });
});
