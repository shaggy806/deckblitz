/**
 * Unbound Flourishing: "Whenever you cast a permanent spell with a mana cost
 * that contains {X}, double the value of X" (`double-x`: the trigger spell's
 * X, rule 107.3a, still that spell on the stack, 400.7 — its permanent keeps
 * it, 107.3m), and "whenever you cast an instant or sorcery spell or activate
 * an ability, if that spell's mana cost or that ability's activation cost
 * contains {X}, copy that spell or ability" (`xInManaCost`, and the
 * `activates-ability` trigger's `xInCost`).
 */
import { describe, expect, it } from "vitest";

import { A, B, activate, cast, counters, lands, life, ref, settle, spawn, table, toHand } from "./harness.js";

describe("Unbound Flourishing", () => {
  it("doubles X of a permanent spell with {X} in its mana cost: Endless One cast for 2 enters with 4 counters", () => {
    const { game } = table();
    spawn(game, "Unbound Flourishing");
    const one = toHand(game, "Endless One");
    lands(game, "Wastes", 2);
    cast(game, one, { x: 2, settle: false });
    // The trigger is above the spell; the spell's X is 2 until it resolves.
    expect(game.state.objects[one].xValue).toBe(2);
    settle(game);
    expect(game.state.objects[one].zone).toBe("battlefield");
    expect(counters(game, one)).toBe(4);
  });

  it("two of them multiply it by four; X of 0 stays 0", () => {
    const { game } = table();
    spawn(game, "Unbound Flourishing");
    spawn(game, "Unbound Flourishing");
    const ballista = toHand(game, "Walking Ballista");
    lands(game, "Wastes", 2);
    cast(game, ballista, { x: 1 });
    expect(counters(game, ballista)).toBe(4);
    const one = toHand(game, "Endless One");
    cast(game, one, { x: 0 });
    // A 0/0 with no counters dies to state-based actions.
    expect(game.state.objects[one].zone).toBe("graveyard");
  });

  it("doesn't double an opponent's spell", () => {
    const { game } = table();
    spawn(game, "Unbound Flourishing", B);
    const one = toHand(game, "Endless One");
    lands(game, "Wastes", 2);
    cast(game, one, { x: 2 });
    expect(counters(game, one)).toBe(2);
  });

  it("copies an instant or sorcery with {X} in its mana cost, X and all", () => {
    const { game } = table();
    spawn(game, "Unbound Flourishing");
    const blaze = toHand(game, "Blaze");
    lands(game, "Mountain", 3);
    const before = life(game, B);
    cast(game, blaze, { x: 2, targets: [ref(B)] });
    expect(life(game, B)).toBe(before - 4);
  });

  it("doesn't copy a spell without {X}", () => {
    const { game } = table();
    spawn(game, "Unbound Flourishing");
    const bolt = toHand(game, "Lightning Bolt");
    lands(game, "Mountain", 1);
    const before = life(game, B);
    cast(game, bolt, { targets: [ref(B)] });
    expect(life(game, B)).toBe(before - 3);
  });

  it("copies an activated ability with {X} in its activation cost, and not one without", () => {
    const { game } = table();
    spawn(game, "Unbound Flourishing");
    const pinnacle = spawn(game, "Helix Pinnacle");
    lands(game, "Forest", 3);
    activate(game, pinnacle, 0, { x: 3 });
    expect(counters(game, pinnacle, "tower")).toBe(6);
    // Walking Ballista's {4} counter ability has no {X}: one counter.
    const ballista = spawn(game, "Walking Ballista");
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 }, [ref(ballista)]);
    lands(game, "Wastes", 4);
    activate(game, ballista, 0);
    expect(counters(game, ballista)).toBe(2);
  });
});
