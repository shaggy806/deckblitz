/**
 * "If damage would be dealt to this creature while it has a +1/+1 counter on
 * it, prevent that damage and remove that many +1/+1 counters from it. When
 * one or more counters are removed this way, it deals that much damage to any
 * target" (Magma Pummeler): a prevention whose `then` (rule 615.5) removes the
 * counters and makes a reflexive trigger valued at the damage.
 */
import { describe, expect, it } from "vitest";

import { A, B, cast, counters, lands, life, pickTargets, ref, settle, table, toHand, zone } from "./harness.js";

const pummeler = (game: Parameters<typeof cast>[0], x: number) => {
  const card = toHand(game, "Magma Pummeler");
  lands(game, "Mountain", x + 2);
  cast(game, card, { x });
  return card;
};

describe("Magma Pummeler", () => {
  it("enters with X counters; damage removes that many and it deals that much to any target", () => {
    const { game, a } = table();
    const id = pummeler(game, 3);
    expect(counters(game, id)).toBe(3);
    pickTargets(a, B);
    const shock = toHand(game, "Shock");
    lands(game, "Mountain", 1);
    cast(game, shock, { targets: [ref(id)] });
    settle(game);
    expect(game.state.objects[id].damageMarked ?? 0).toBe(0);
    expect(counters(game, id)).toBe(1);
    expect(life(game, B)).toBe(18);
  });

  it("more damage than counters: every counter goes, it dies, and still deals all of it (the ruling)", () => {
    const { game, a } = table();
    const id = pummeler(game, 1);
    pickTargets(a, B);
    const bolt = toHand(game, "Lightning Bolt");
    lands(game, "Mountain", 1);
    cast(game, bolt, { targets: [ref(id)] });
    settle(game);
    expect(zone(game, id)).toBe("graveyard");
    expect(life(game, B)).toBe(17);
    expect(life(game, A)).toBe(20);
  });
});
