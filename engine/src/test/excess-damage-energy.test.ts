/**
 * "Where X is that excess damage" read off a creature dealt it (rule 120.4a):
 * the `damageDealtThisTurn` amount's `to: "trigger-recipient"` and `excess` —
 * the journal's excess for the triggering event's recipient this turn, in the
 * stint it was dealt it, from every source (rule 120.10: sources dealing
 * damage at once share what they dealt together past lethal damage).
 * Overclocked Electromancer's "whenever this creature deals combat damage to
 * a creature, if that creature was dealt excess damage this turn, you get X
 * {E}, where X is that excess damage".
 */
import { describe, expect, it } from "vitest";

import { A, B, attack, counters, pickModes, pt, spawn, table, toStep, zone } from "./harness.js";

const energy = (game: ReturnType<typeof table>["game"]): number => game.state.players[A].energy ?? 0;

describe("Overclocked Electromancer", () => {
  it("doubles its power as it attacks, and gets the excess it dealt a blocker as energy", () => {
    const { game, a, b } = table();
    const lizard = spawn(game, "Overclocked Electromancer");
    const bears = spawn(game, "Grizzly Bears", B);
    b.declareBlockersFn = () => [{ blocker: bears, attacker: lizard }];
    attack(game, a, [lizard]);
    // 4 damage to a 2/2: 2 past lethal. The Lizard died to the Bears' 2, and
    // its ability resolved all the same.
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, lizard)).toBe("graveyard");
    expect(energy(game)).toBe(2);
  });

  it("doubles its power until end of turn", () => {
    const { game, a } = table();
    const lizard = spawn(game, "Overclocked Electromancer");
    attack(game, a, [lizard]);
    expect(pt(game, lizard).power).toBe(4);
    expect(game.state.players[B].life).toBe(16);
  });

  it("gets nothing when the damage was no more than lethal", () => {
    const { game, a, b } = table();
    const lizard = spawn(game, "Overclocked Electromancer");
    // 0/4: exactly lethal.
    const wall = spawn(game, "Pit Automaton", B);
    b.declareBlockersFn = () => [{ blocker: wall, attacker: lizard }];
    attack(game, a, [lizard]);
    expect(zone(game, wall)).toBe("graveyard");
    expect(energy(game)).toBe(0);
  });

  it("counts damage already marked on the creature", () => {
    const { game, a, b } = table();
    const lizard = spawn(game, "Overclocked Electromancer");
    const wall = spawn(game, "Pit Automaton", B);
    game.debugApplyEffect(A, { kind: "damage", amount: 2, target: 0 }, [{ kind: "object", object: wall }]);
    b.declareBlockersFn = () => [{ blocker: wall, attacker: lizard }];
    attack(game, a, [lizard]);
    // Lethal damage is the 2 left: 2 of the 4 are excess.
    expect(energy(game)).toBe(2);
  });

  it("is the excess every source dealt it together, blocking beside another creature", () => {
    const { game, a, b } = table();
    const lizard = spawn(game, "Overclocked Electromancer");
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    toStep(game, "end", A);
    game.advanceUntil((s) => s.turn.number === 2 && s.turn.step === "precombat-main");
    b.declareAttackersFn = () => [{ attacker: giant, defender: A }];
    a.declareBlockersFn = () => [
      { blocker: lizard, attacker: giant },
      { blocker: bears, attacker: giant },
    ];
    game.advanceUntil((s) => s.turn.number === 2 && s.turn.step === "postcombat-main");
    // 2 + 2 to a 3/3: 1 past lethal, whichever was dealt first.
    expect(zone(game, giant)).toBe("graveyard");
    expect(energy(game)).toBe(1);
  });

  it("may pay three energy at the beginning of combat for a +1/+1 counter", () => {
    const { game, a } = table();
    const lizard = spawn(game, "Overclocked Electromancer");
    game.debugApplyEffect(A, { kind: "get-energy", amount: 4 });
    pickModes(a, 0);
    attack(game, a, [lizard]);
    expect(counters(game, lizard, "+1/+1")).toBe(1);
    expect(energy(game)).toBe(1);
    // 3 power doubled.
    expect(game.state.players[B].life).toBe(14);
  });
});
