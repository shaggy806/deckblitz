/**
 * "If it was attacking or blocking alone" — `attackingAlone` / `blockingAlone`
 * (rule 506.5) read of a creature as it last existed (603.10a), from a
 * snapshot taken before anything in its event moved. Proven on Thijarian
 * Witness.
 */
import { describe, expect, it } from "vitest";

import { A, B, attack, destroy, spawn, table, tokensNamed, zone } from "./harness.js";

describe("Thijarian Witness", () => {
  it("exiles a lone attacker that died in combat and investigates", () => {
    const { game, a, b } = table();
    spawn(game, "Thijarian Witness", B);
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    b.declareBlockersFn = () => [{ blocker: giant, attacker: bears }];
    attack(game, a, [bears]);
    expect(zone(game, bears)).toBe("exile");
    expect(tokensNamed(game, "Clue Token", B)).toBe(1);
  });

  it("exiles a lone blocker that died", () => {
    const { game, a, b } = table();
    spawn(game, "Thijarian Witness", A);
    const giant = spawn(game, "Hill Giant");
    const bears = spawn(game, "Grizzly Bears", B);
    b.declareBlockersFn = () => [{ blocker: bears, attacker: giant }];
    attack(game, a, [giant]);
    expect(zone(game, bears)).toBe("exile");
    expect(tokensNamed(game, "Clue Token", A)).toBe(1);
  });

  it("ignores two attackers that died together: neither was alone", () => {
    const { game, a, b } = table();
    spawn(game, "Thijarian Witness", B);
    const one = spawn(game, "Grizzly Bears");
    const two = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    const other = spawn(game, "Hill Giant", B);
    b.declareBlockersFn = () => [
      { blocker: giant, attacker: one },
      { blocker: other, attacker: two },
    ];
    attack(game, a, [one, two]);
    expect(zone(game, one)).toBe("graveyard");
    expect(zone(game, two)).toBe("graveyard");
    expect(tokensNamed(game, "Clue Token", B)).toBe(0);
  });

  it("ignores a creature that died outside combat", () => {
    const { game } = table();
    spawn(game, "Thijarian Witness", B);
    const bears = spawn(game, "Grizzly Bears");
    destroy(game, bears);
    expect(zone(game, bears)).toBe("graveyard");
    expect(tokensNamed(game, "Clue Token", B)).toBe(0);
  });
});
