/**
 * "Until end of turn, creatures you control with toughness greater than their
 * power assign combat damage equal to their toughness rather than their power"
 * — a `timed-static` carrying the `combatDamageByToughness:
 * "if-toughness-greater"` static (rule 510.1a), proven on The Kingpin of
 * Crime: "Whenever you attack, you may pay 2 life. If you do, …".
 */
import { describe, expect, it } from "vitest";

import { combatDamageOf, computeCharacteristics } from "../characteristics.js";
import { A, B, attack, life, nextTurn, pickModes, spawn, table } from "./harness.js";

describe("The Kingpin of Crime", () => {
  it("paying 2 life makes creatures with toughness greater than power deal their toughness", () => {
    const { game, a } = table();
    const kingpin = spawn(game, "The Kingpin of Crime");
    const turtle = spawn(game, "Horned Turtle"); // 1/4
    const wurm = spawn(game, "Craw Wurm"); // 6/4: power not below toughness
    pickModes(a, 0);
    attack(game, a, [kingpin, turtle, wurm]);
    expect(life(game, A)).toBe(18);
    expect(life(game, B)).toBe(20 - 5 - 4 - 6);
  });

  it("declined, nothing changes and no life is paid", () => {
    const { game, a } = table();
    const kingpin = spawn(game, "The Kingpin of Crime");
    const turtle = spawn(game, "Horned Turtle");
    pickModes(a);
    attack(game, a, [kingpin, turtle]);
    expect(life(game, A)).toBe(20);
    expect(life(game, B)).toBe(18);
  });

  it("lasts until end of turn only", () => {
    const { game, a } = table();
    const turtle = spawn(game, "Horned Turtle");
    const kingpin = spawn(game, "The Kingpin of Crime");
    pickModes(a, 0);
    attack(game, a, [kingpin]);
    expect(life(game, B)).toBe(15);
    // Bob's turn: the turtle blocks nothing, but his own attack is not ours.
    nextTurn(game);
    nextTurn(game);
    pickModes(a);
    attack(game, a, [turtle]);
    expect(life(game, B)).toBe(14);
  });

  it("reaches a creature that comes under your control after it resolved (rules, not characteristics: 611.2c)", () => {
    const { game, a } = table();
    const kingpin = spawn(game, "The Kingpin of Crime");
    pickModes(a, 0);
    a.declareAttackersFn = () => [{ attacker: kingpin, defender: B }];
    game.advanceUntil((s) => s.turn.step === "declare-blockers");
    const late = spawn(game, "Horned Turtle");
    game.advanceUntil((s) => s.turn.step === "postcombat-main");
    expect(life(game, B)).toBe(15);
    // The static is live for a creature that arrived after it began.
    expect(combatDamageOf(computeCharacteristics(game.state, game.registry, late))).toBe(4);
  });
});
