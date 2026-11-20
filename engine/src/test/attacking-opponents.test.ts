/**
 * The `attacking-opponents` condition (Nemesis Phoenix's "only if you're
 * attacking two or more opponents", `combat/attacked.ts`): players, not
 * their planeswalkers (rule 802.4).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import type { ScriptedController } from "../controller.js";
import { A, B, C, activate, lands, spawn, table, toGraveyard, zone } from "./harness.js";

/** Alice's attackers declared as given, alice holding priority in her
 * declare attackers step. */
function aliceAttacks(game: Game, a: ScriptedController, attacks: readonly (readonly [ObjectId, PlayerId | ObjectId])[]): void {
  a.declareAttackersFn = () => attacks.map(([attacker, defender]) => ({ attacker, defender }));
  game.advanceUntil(
    (s) => s.turn.step === "declare-attackers" && s.priority.holder === A && s.awaiting === null,
  );
}

describe("Nemesis Phoenix", () => {
  it("returns tapped and attacking while you're attacking two opponents", () => {
    const { game, a } = table({ players: 3 });
    lands(game, "Mountain", 3);
    const phoenix = toGraveyard(game, "Nemesis Phoenix");
    const one = spawn(game, "Grizzly Bears");
    const two = spawn(game, "Grizzly Bears");
    aliceAttacks(game, a, [
      [one, B],
      [two, C],
    ]);
    activate(game, phoenix);
    expect(zone(game, phoenix)).toBe("battlefield");
    const object = game.state.objects[phoenix];
    expect(object.tapped).toBe(true);
    expect([B, C]).toContain(object.attacking);
  });

  it("can't be activated while you attack only one opponent", () => {
    const { game, a } = table({ players: 3 });
    lands(game, "Mountain", 3);
    const phoenix = toGraveyard(game, "Nemesis Phoenix");
    const one = spawn(game, "Grizzly Bears");
    const two = spawn(game, "Grizzly Bears");
    aliceAttacks(game, a, [
      [one, B],
      [two, B],
    ]);
    expect(() => activate(game, phoenix)).toThrow();
    expect(zone(game, phoenix)).toBe("graveyard");
  });

  it("an opponent's planeswalker attacked isn't that opponent attacked", () => {
    const { game, a } = table({ players: 3 });
    lands(game, "Mountain", 3);
    const phoenix = toGraveyard(game, "Nemesis Phoenix");
    const one = spawn(game, "Grizzly Bears");
    const two = spawn(game, "Grizzly Bears");
    const jace = spawn(game, "Jace Beleren", C);
    game.state.objects[jace].counters = { loyalty: 3 };
    aliceAttacks(game, a, [
      [one, B],
      [two, jace],
    ]);
    expect(() => activate(game, phoenix)).toThrow();
  });

  it("only in the declare attackers step", () => {
    const { game, a } = table({ players: 3 });
    lands(game, "Mountain", 3);
    const phoenix = toGraveyard(game, "Nemesis Phoenix");
    const one = spawn(game, "Grizzly Bears");
    const two = spawn(game, "Grizzly Bears");
    aliceAttacks(game, a, [
      [one, B],
      [two, C],
    ]);
    game.advanceUntil((s) => s.turn.step === "declare-blockers" && s.priority.holder === A && s.awaiting === null);
    expect(() => activate(game, phoenix)).toThrow();
  });

  it("not in an opponent's combat, though they attack two players", () => {
    const { game, b } = table({ players: 3 });
    lands(game, "Mountain", 3);
    const phoenix = toGraveyard(game, "Nemesis Phoenix");
    const one = spawn(game, "Grizzly Bears", B);
    const two = spawn(game, "Grizzly Bears", B);
    b.declareAttackersFn = () => [
      { attacker: one, defender: A },
      { attacker: two, defender: C },
    ];
    game.advanceUntil(
      (s) => s.turn.number === 2 && s.turn.step === "declare-attackers" && s.priority.holder === A && s.awaiting === null,
    );
    expect(() => activate(game, phoenix)).toThrow();
  });
});
