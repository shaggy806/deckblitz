/**
 * "If a creature entered the battlefield under your control this turn" asks
 * what entered, as it entered — not what it is now (Mechan Shieldmate's
 * ruling): the turn history keeps each entry's `asEntered` snapshot. Shown
 * with Waterspout Warden's "if another creature entered the battlefield
 * under your control this turn" (rule 603.4's intervening if).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import { A, B, attack, enter, keywords, nextTurn, ref, settle, spawn, table } from "./harness.js";

describe("a turn-history 'entered' filter reads the permanent as it entered", () => {
  it("a creature that entered counts", () => {
    const { game, a } = table();
    const warden = spawn(game, "Waterspout Warden");
    enter(game, "Grizzly Bears");
    attack(game, a, [warden]);
    expect(keywords(game, warden).has("flying")).toBe(true);
  });

  it("a land that entered, then became a creature, doesn't", () => {
    const { game, a } = table();
    const warden = spawn(game, "Waterspout Warden");
    const island = enter(game, "Island");
    game.debugApplyEffect(A, { kind: "earthbend", target: 0, amount: 1 }, [ref(island)]);
    settle(game);
    expect(game.characteristics(island).types).toContain("creature");
    attack(game, a, [warden]);
    expect(keywords(game, warden).has("flying")).toBe(false);
  });
});

describe("Mechan Shieldmate", () => {
  /** Why alice's `id` can't attack bob right now, or null if it can. */
  const whyCannotAttack = (game: Game, id: ObjectId): string | null =>
    (game as unknown as { whyCannotAttack(p: string, id: ObjectId, d: string): string | null }).whyCannotAttack(
      A,
      id,
      B,
    );

  it("can attack only once an artifact has entered under your control this turn", () => {
    const { game } = table();
    const wall = spawn(game, "Mechan Shieldmate");
    expect(whyCannotAttack(game, wall)).not.toBeNull();
    enter(game, "Sol Ring");
    expect(whyCannotAttack(game, wall)).toBeNull();
    // A new turn, and nothing has entered in it.
    nextTurn(game);
    nextTurn(game);
    expect(whyCannotAttack(game, wall)).not.toBeNull();
  });
});
