/**
 * `CardFilter.controllerTurnHistory`: a permanent whose controller has enough
 * things in one of their journal lists this turn — Admiral Beckett Brass's
 * "target nonland permanent controlled by a player who was dealt combat
 * damage by three or more Pirates this turn". The count is `journalCount`'s
 * over `combat-damaged-by`, each source once for a player however often it
 * dealt them combat damage (the card's ruling on double strike), as it was
 * when it dealt it.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, C, attack, controller, destroy, grant, life, nextTurn, pt, spawn, table, toStep, watchTargets } from "./harness.js";
import type { ScriptedController } from "../controller.js";

/** Runs alice's turn from where it is into bob's, her end step's target
 * choice answered with `pick` (when offered), and returns what was offered. */
function endStep(game: Game, a: ScriptedController, pick?: ObjectId): { asked: number; offered: readonly (readonly string[])[] } {
  const seen = watchTargets(a, (offered) => offered.map((slot) => (pick !== undefined && slot.includes(pick) ? pick : (slot[0] ?? null))));
  nextTurn(game);
  return seen;
}

describe("target permanent controlled by a player who was dealt combat damage by three or more Pirates this turn", () => {
  it("offers only the nonland permanents of the player three Pirates hit, and the control change lasts", () => {
    const { game, a } = table({ players: 3 });
    const admiral = spawn(game, "Admiral Beckett Brass", A);
    const pirates = [spawn(game, "Daring Buccaneer", A), spawn(game, "Daring Buccaneer", A)];
    const bear = spawn(game, "Grizzly Bears", B);
    const relic = spawn(game, "Ornithopter", B);
    const forest = spawn(game, "Forest", B);
    const other = spawn(game, "Grizzly Bears", C);
    expect(pt(game, pirates[0])).toEqual({ power: 3, toughness: 3 });
    attack(game, a, [admiral, ...pirates], B);
    expect(life(game, B)).toBe(20 - 9);
    const seen = endStep(game, a, bear);
    expect(seen.asked).toBe(1);
    // A lone legal target is taken without asking, so bob has two.
    expect([...seen.offered[0]].sort()).toEqual([bear, relic].sort());
    expect(seen.offered[0]).not.toContain(forest);
    expect(seen.offered[0]).not.toContain(other);
    expect(controller(game, bear)).toBe(A);
    // Indefinitely: still alice's a turn later, and with the Admiral gone.
    destroy(game, admiral);
    nextTurn(game);
    expect(controller(game, bear)).toBe(A);
  });

  it("counts a double striker once", () => {
    const { game, a } = table();
    const admiral = spawn(game, "Admiral Beckett Brass", A);
    const pirate = spawn(game, "Daring Buccaneer", A);
    const bear = spawn(game, "Grizzly Bears", B);
    toStep(game, "precombat-main");
    grant(game, pirate, "double-strike");
    attack(game, a, [admiral, pirate], B);
    // Three hits (3 + 3 + 3), two Pirates.
    expect(life(game, B)).toBe(20 - 9);
    const seen = endStep(game, a, bear);
    expect(seen.asked).toBe(0);
    expect(controller(game, bear)).toBe(B);
  });

  it("doesn't count a creature that isn't a Pirate", () => {
    const { game, a } = table();
    const admiral = spawn(game, "Admiral Beckett Brass", A);
    const pirate = spawn(game, "Daring Buccaneer", A);
    const mine = spawn(game, "Grizzly Bears", A);
    const bear = spawn(game, "Grizzly Bears", B);
    attack(game, a, [admiral, pirate, mine], B);
    expect(life(game, B)).toBe(20 - 8);
    expect(endStep(game, a, bear).asked).toBe(0);
    expect(controller(game, bear)).toBe(B);
  });

  it("counts Pirates that hit before the Admiral arrived, and one that has since died", () => {
    const { game, a } = table();
    const pirates = [spawn(game, "Daring Buccaneer", A), spawn(game, "Daring Buccaneer", A), spawn(game, "Daring Buccaneer", A)];
    const bear = spawn(game, "Grizzly Bears", B);
    attack(game, a, pirates, B);
    expect(life(game, B)).toBe(20 - 6);
    destroy(game, pirates[0]);
    spawn(game, "Admiral Beckett Brass", A);
    endStep(game, a, bear);
    expect(controller(game, bear)).toBe(A);
  });

  it("reads each player's own list: three Pirates split over two players reach neither", () => {
    const { game, a } = table({ players: 3 });
    const admiral = spawn(game, "Admiral Beckett Brass", A);
    const pirates = [spawn(game, "Daring Buccaneer", A), spawn(game, "Daring Buccaneer", A)];
    const bear = spawn(game, "Grizzly Bears", B);
    spawn(game, "Grizzly Bears", C);
    a.declareAttackersFn = () => [
      { attacker: admiral, defender: B },
      { attacker: pirates[0], defender: B },
      { attacker: pirates[1], defender: C },
    ];
    toStep(game, "postcombat-main");
    expect([life(game, B), life(game, C)]).toEqual([20 - 6, 20 - 3]);
    expect(endStep(game, a, bear).asked).toBe(0);
  });
});
