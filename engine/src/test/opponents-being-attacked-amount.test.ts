/**
 * The `{ opponentsBeingAttacked }` amount: the opponents its controller is
 * attacking now — only in their own combat (rule 506.2), the players and not
 * their planeswalkers (802.4). Astral Confrontation's "costs {1} less to cast
 * for each opponent you're attacking".
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import type { ScriptedController } from "../controller.js";
import { A, B, C, cast, lands, ref, spawn, table, toHand, zone } from "./harness.js";

function aliceAttacks(game: Game, a: ScriptedController, attacks: readonly (readonly [ObjectId, PlayerId | ObjectId])[]): void {
  a.declareAttackersFn = () => attacks.map(([attacker, defender]) => ({ attacker, defender }));
  game.advanceUntil(
    (s) => s.turn.step === "declare-attackers" && s.priority.holder === A && s.awaiting === null,
  );
}

describe("Astral Confrontation", () => {
  it("costs {2}{W} while you attack two opponents", () => {
    const { game, a } = table({ players: 3 });
    lands(game, "Plains", 3);
    const one = spawn(game, "Grizzly Bears");
    const two = spawn(game, "Grizzly Bears");
    const target = spawn(game, "Grizzly Bears", B);
    const spell = toHand(game, "Astral Confrontation");
    aliceAttacks(game, a, [
      [one, B],
      [two, C],
    ]);
    cast(game, spell, { targets: [ref(target)] });
    expect(zone(game, target)).toBe("exile");
  });

  it("two attackers at one opponent take off {1} only", () => {
    const { game, a } = table({ players: 3 });
    lands(game, "Plains", 3);
    const one = spawn(game, "Grizzly Bears");
    const two = spawn(game, "Grizzly Bears");
    const target = spawn(game, "Grizzly Bears", B);
    const spell = toHand(game, "Astral Confrontation");
    aliceAttacks(game, a, [
      [one, B],
      [two, B],
    ]);
    expect(() => cast(game, spell, { targets: [ref(target)] })).toThrow();
    expect(zone(game, spell)).toBe("hand");
  });

  it("an opponent's planeswalker attacked isn't that opponent", () => {
    const { game, a } = table({ players: 3 });
    lands(game, "Plains", 3);
    const one = spawn(game, "Grizzly Bears");
    const two = spawn(game, "Grizzly Bears");
    const jace = spawn(game, "Jace Beleren", C);
    const target = spawn(game, "Grizzly Bears", B);
    const spell = toHand(game, "Astral Confrontation");
    aliceAttacks(game, a, [
      [one, B],
      [two, jace],
    ]);
    expect(() => cast(game, spell, { targets: [ref(target)] })).toThrow();
  });

  it("full price outside combat", () => {
    const { game } = table({ players: 3 });
    lands(game, "Plains", 4);
    const target = spawn(game, "Grizzly Bears", B);
    const spell = toHand(game, "Astral Confrontation");
    expect(() => cast(game, spell, { targets: [ref(target)] })).toThrow();
    lands(game, "Plains", 1);
    cast(game, spell, { targets: [ref(target)] });
    expect(zone(game, target)).toBe("exile");
  });
});
