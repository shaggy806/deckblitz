/**
 * Splintering Wind: a token with its own quoted abilities (flying,
 * cumulative upkeep {G}) and a delayed "when it leaves the battlefield"
 * ability the activation sets up on it (rule 603.7, `leaves: "created"`),
 * the token dealing the damage as it last existed — to the activating player
 * and each creature they control.
 */

import { describe, expect, it } from "vitest";

import { A, B, activate, destroy, keywords, life, ref, spawn, table, tokensNamed } from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

const splinters = (game: Game): ObjectId[] =>
  game.battlefield.filter((id) => game.state.objects[id].cardName === "Splinter Token");

function windOn(game: Game, creature: ObjectId): ObjectId {
  for (let i = 0; i < 3; i += 1) spawn(game, "Forest", A);
  const wind = spawn(game, "Splintering Wind", A);
  activate(game, wind, 0, { targets: [ref(creature)] });
  return splinters(game)[0];
}

describe("Splintering Wind", () => {
  it("deals 1 damage to the target and creates a 1/1 flying Splinter", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant", B);
    const token = windOn(game, giant);
    expect(game.state.objects[giant].damageMarked).toBe(1);
    expect(tokensNamed(game, "Splinter Token", A)).toBe(1);
    expect(keywords(game, token)).toContain("flying");
  });

  it("when the Splinter leaves, it deals 1 damage to you and each creature you control", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant", B);
    const mine = spawn(game, "Hill Giant", A);
    const token = windOn(game, giant);
    destroy(game, token);
    expect(life(game, A)).toBe(19);
    expect(life(game, B)).toBe(20);
    expect(game.state.objects[mine].damageMarked).toBe(1);
    expect(game.state.objects[giant].damageMarked).toBe(1);
  });

  it("the Splinter is the source of that damage: prevented with damage dealt by creatures", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant", B);
    const token = windOn(game, giant);
    game.debugApplyEffect(B, { kind: "damage-rule", by: { filter: { type: "creature" } } }, []);
    destroy(game, token);
    expect(life(game, A)).toBe(20);
  });

  it("has cumulative upkeep {G}: unpaid, it's sacrificed at its controller's upkeep, and the leave ability fires", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant", B);
    windOn(game, giant);
    a.chooseModesFn = () => [];
    game.advanceUntil((s) => s.turn.number === 3 && s.turn.step === "draw");
    expect(tokensNamed(game, "Splinter Token", A)).toBe(0);
    expect(life(game, A)).toBe(19);
  });
});
