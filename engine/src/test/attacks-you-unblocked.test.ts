/**
 * "Whenever one or more creatures an opponent controls attack you and aren't
 * blocked" — `attacks-player` with `unblocked`, once per player attacked as
 * blockers are declared (rule 509.3g), off `player-attacked-unblocked`.
 * Coveted Jewel.
 */
import { describe, expect, it } from "vitest";

import type { ScriptedController } from "../controller.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

import { A, B, C, activate, controller, enter, hand, spawn, table, toStep } from "./harness.js";

function fight(
  game: Game,
  seat: ScriptedController,
  attacks: readonly { readonly attacker: ObjectId; readonly defender: PlayerId | ObjectId }[],
): void {
  seat.declareAttackersFn = () => attacks;
  toStep(game, "combat-damage", seat.playerId);
}

describe("Coveted Jewel", () => {
  it("unblocked attackers: their player draws three, once, gets it, and it untaps", () => {
    const { game, a } = table();
    const jewel = spawn(game, "Coveted Jewel", B, { tapped: true });
    const handBefore = hand(game, A).length;
    const attacks = [spawn(game, "Grizzly Bears", A), spawn(game, "Grizzly Bears", A)].map((attacker) => ({
      attacker,
      defender: B,
    }));
    fight(game, a, attacks);
    expect(hand(game, A).length).toBe(handBefore + 3);
    expect(controller(game, jewel)).toBe(A);
    expect(game.state.objects[jewel].tapped).toBe(false);
  });

  it("some blocked is enough, while all blocked isn't", () => {
    const some = table();
    const jewel = spawn(some.game, "Coveted Jewel", B);
    const blocker = spawn(some.game, "Grizzly Bears", B);
    const first = spawn(some.game, "Grizzly Bears", A);
    const second = spawn(some.game, "Grizzly Bears", A);
    some.b.declareBlockersFn = () => [{ blocker, attacker: first }];
    fight(some.game, some.a, [
      { attacker: first, defender: B },
      { attacker: second, defender: B },
    ]);
    expect(controller(some.game, jewel)).toBe(A);

    const all = table();
    const kept = spawn(all.game, "Coveted Jewel", B);
    const wall = spawn(all.game, "Grizzly Bears", B);
    const lone = spawn(all.game, "Grizzly Bears", A);
    all.b.declareBlockersFn = () => [{ blocker: wall, attacker: lone }];
    const before = hand(all.game, A).length;
    fight(all.game, all.a, [{ attacker: lone, defender: B }]);
    expect(controller(all.game, kept)).toBe(B);
    expect(hand(all.game, A).length).toBe(before);
  });

  it("a creature attacking your planeswalker doesn't count", () => {
    const { game, a } = table();
    const jewel = spawn(game, "Coveted Jewel", B);
    const walker = spawn(game, "Chandra, Torch of Defiance", B);
    fight(game, a, [{ attacker: spawn(game, "Grizzly Bears", A), defender: walker }]);
    expect(controller(game, jewel)).toBe(B);
  });

  it("only attackers at its controller count, four-handed", () => {
    const { game, a } = table({ players: 4 });
    const bobs = spawn(game, "Coveted Jewel", B);
    const carols = spawn(game, "Coveted Jewel", C);
    const before = hand(game, A).length;
    fight(game, a, [
      { attacker: spawn(game, "Grizzly Bears", A), defender: C },
      { attacker: spawn(game, "Grizzly Bears", A), defender: C },
    ]);
    expect(controller(game, bobs)).toBe(B);
    expect(controller(game, carols)).toBe(A);
    expect(hand(game, A).length).toBe(before + 3);
  });

  it("taps for three of one color and draws three as it enters", () => {
    const { game } = table();
    const before = hand(game, A).length;
    const jewel = enter(game, "Coveted Jewel", A);
    expect(hand(game, A).length).toBe(before + 3);
    activate(game, jewel, 0);
    const pool = game.state.players[A].manaPool.map((unit) => unit.type);
    expect(pool.length).toBe(3);
    expect(new Set(pool).size).toBe(1);
  });
});
