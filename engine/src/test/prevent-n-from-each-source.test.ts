/**
 * "If a creature would deal combat damage to you and/or one or more creatures
 * you control, prevent X of that damage" (Cover of Winter —
 * `DamagePrevention.perSourceTo`, rule 615.7): X from each creature, in each
 * combat damage step, shared among all it would deal to you and your
 * creatures at once, the protected player dividing it (the shield-share
 * question). Noncombat damage is untouched.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import { A, B, attack, cast, lands, life, ref, spawn, table, toHand, zone } from "./harness.js";

/** Bob's Cover of Winter with `age` age counters. */
function cover(game: Game, age: number): ObjectId {
  const id = spawn(game, "Cover of Winter", B);
  game.debugApplyEffect(B, { kind: "add-counter", target: 0, counter: "age", amount: age }, [ref(id)]);
  return id;
}

describe("Cover of Winter", () => {
  it("prevents X of each attacking creature's combat damage, creature by creature", () => {
    const { game, a } = table();
    cover(game, 2);
    const bears = spawn(game, "Grizzly Bears", A);
    const giant = spawn(game, "Hill Giant", A);
    attack(game, a, [bears, giant]);
    // The 2/2's 2 all prevented, 2 of the 3/3's.
    expect(life(game, B)).toBe(19);
  });

  it("prevents X in each combat damage step of a double striker", () => {
    const { game, a } = table();
    cover(game, 1);
    const ace = spawn(game, "Fencing Ace", A);
    attack(game, a, [ace]);
    expect(life(game, B)).toBe(20);
  });

  it("with no age counters, prevents nothing", () => {
    const { game, a } = table();
    cover(game, 0);
    const bears = spawn(game, "Grizzly Bears", A);
    attack(game, a, [bears]);
    expect(life(game, B)).toBe(18);
  });

  it("a trampler's damage to a blocker and to bob is prevented X in all, bob dividing it", () => {
    for (const [toBob, life_, blockerLives] of [
      [2, 16 + 2, false],
      [0, 16, true],
    ] as const) {
      const { game, a, b } = table();
      cover(game, 2);
      const dreadmaw = spawn(game, "Colossal Dreadmaw", A);
      const blocker = spawn(game, "Grizzly Bears", B);
      b.declareBlockersFn = () => [{ blocker, attacker: dreadmaw }];
      const asked: string[] = [];
      b.chooseNumberFn = (_view, offer) => {
        asked.push(offer.prompt ?? "");
        return toBob;
      };
      attack(game, a, [dreadmaw]);
      expect(asked.length).toBe(1);
      expect(life(game, B)).toBe(life_);
      expect(zone(game, blocker)).toBe(blockerLives ? "battlefield" : "graveyard");
    }
  });

  it("doesn't touch noncombat damage", () => {
    const { game } = table();
    cover(game, 3);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(17);
  });
});
