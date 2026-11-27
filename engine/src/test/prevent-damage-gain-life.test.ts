/**
 * "Prevent the next 3 damage that would be dealt to any target this turn.
 * You gain life equal to the damage prevented this way" (Candles' Glow):
 * `prevent-damage`'s `gainLifePrevented`, the shield's `gainLife` (Reverse
 * Damage's), gained by the spell's controller as the shield prevents.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, cast, lands, life, ref, settle, spawn, table, toHand, zone } from "./harness.js";

const glow = (game: Game, target: ObjectId | PlayerId): void => {
  lands(game, "Plains", 2);
  cast(game, toHand(game, "Candles' Glow", A), { targets: [ref(target)] });
};

const hit = (game: Game, target: ObjectId | PlayerId, amount: number): void => {
  game.debugApplyEffect(B, { kind: "damage", amount, target: 0 }, [ref(target)]);
  settle(game);
};

describe("Candles' Glow", () => {
  it("on a creature: prevents 3 of 5, and you gain 3", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant", B);
    glow(game, giant);
    hit(game, giant, 2);
    expect(zone(game, giant)).toBe("battlefield");
    expect(life(game, A)).toBe(22);
    hit(game, giant, 2);
    // One more prevented (3 in all), one dealt.
    expect(life(game, A)).toBe(23);
    expect(game.state.objects[giant].damageMarked).toBe(1);
  });

  it("on a player: only what it prevents, the spell's controller gaining", () => {
    const { game } = table();
    glow(game, B);
    hit(game, B, 1);
    expect(life(game, B)).toBe(20);
    expect(life(game, A)).toBe(21);
  });
});
