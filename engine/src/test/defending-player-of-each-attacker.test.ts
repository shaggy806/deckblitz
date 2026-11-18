/**
 * "Each attacking creature gets +1/+0 … for each nonbasic land defending
 * player controls" (Mercadia's Downfall): a spell that reaches several
 * attackers finds each one's own defending player — the player it attacks,
 * or the controller of the planeswalker it attacks (rules 508.5, 508.5a) —
 * through `for-each-permanent` binding each attacker to slot 0 and
 * `controlledByRef: { defendingPlayerOf: 0 }`. The attackers are the ones
 * attacking as it resolves (the ruling).
 */
import { describe, expect, it } from "vitest";

import { A, B, C, cast, lands, pt, spawn, table, toHand, toStep } from "./harness.js";

describe("Mercadia's Downfall", () => {
  it("counts each attacker's own defending player's nonbasic lands", () => {
    const { game, a } = table({ players: 3 });
    lands(game, "Mountain", 3);
    const spell = toHand(game, "Mercadia's Downfall");
    // Bob: two nonbasic lands and a basic. Carol: one nonbasic.
    lands(game, "Command Tower", 2, B);
    lands(game, "Forest", 1, B);
    lands(game, "Command Tower", 1, C);
    // Alice's own nonbasic land counts for nobody's attackers.
    lands(game, "Command Tower", 1, A);
    const carolsWalker = spawn(game, "Jace Beleren", C);
    const atBob = spawn(game, "Grizzly Bears");
    const atCarolsWalker = spawn(game, "Grizzly Bears");
    const home = spawn(game, "Grizzly Bears");
    a.declareAttackersFn = () => [
      { attacker: atBob, defender: B },
      { attacker: atCarolsWalker, defender: carolsWalker },
    ];
    toStep(game, "declare-blockers");
    cast(game, spell);
    expect(pt(game, atBob)).toEqual({ power: 4, toughness: 2 });
    expect(pt(game, atCarolsWalker)).toEqual({ power: 3, toughness: 2 });
    expect(pt(game, home)).toEqual({ power: 2, toughness: 2 });
  });

  it("is counted as it resolves: a nonbasic land played later adds nothing", () => {
    const { game, a } = table();
    lands(game, "Mountain", 3);
    const spell = toHand(game, "Mercadia's Downfall");
    lands(game, "Command Tower", 1, B);
    const bears = spawn(game, "Grizzly Bears");
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    toStep(game, "declare-blockers");
    cast(game, spell);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 2 });
    lands(game, "Command Tower", 1, B);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 2 });
  });
});
