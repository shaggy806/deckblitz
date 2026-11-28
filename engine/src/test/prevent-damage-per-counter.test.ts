/**
 * "For each 1 damage that would be dealt to this creature, if it has a +1/+1
 * counter on it, remove a +1/+1 counter from it and prevent that 1 damage"
 * (Rock Hydra): `prevent: { perCounter }`, prevention up to the counters it
 * has, one removed for each 1 prevented — read afresh for each source of a
 * simultaneous event — and one for each 1 that can't be prevented (rule
 * 615.12, the ruling).
 */
import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";

import { B, activate, attack, cast, counters, lands, nextTurn, ref, spawn, table, toHand, zone } from "./harness.js";

const hydra = (game: Parameters<typeof cast>[0], x: number) => {
  const card = toHand(game, "Rock Hydra");
  lands(game, "Mountain", x + 2);
  cast(game, card, { x });
  return card;
};

const bolt = (game: Parameters<typeof cast>[0], at: ObjectId) => {
  lands(game, "Mountain", 1);
  cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(at)] });
};

describe("Rock Hydra", () => {
  it("enters with X counters, and 3 damage takes 3 of them and is prevented", () => {
    const { game } = table();
    const id = hydra(game, 5);
    expect(counters(game, id)).toBe(5);
    bolt(game, id);
    expect(counters(game, id)).toBe(2);
    expect(game.state.objects[id].damageMarked ?? 0).toBe(0);
    expect(zone(game, id)).toBe("battlefield");
  });

  it("more damage than counters: the rest is dealt", () => {
    const { game } = table();
    spawn(game, "Glorious Anthem");
    const id = hydra(game, 2);
    bolt(game, id);
    // Two prevented, two counters gone, a 1/1 dealt 1.
    expect(zone(game, id)).toBe("graveyard");
  });

  it("with as many counters as damage, none is dealt", () => {
    const { game } = table();
    spawn(game, "Glorious Anthem");
    const id = hydra(game, 3);
    bolt(game, id);
    expect(counters(game, id)).toBe(0);
    expect(game.state.objects[id].damageMarked ?? 0).toBe(0);
    expect(zone(game, id)).toBe("battlefield");
  });

  it("two blockers at once share its counters: the second finds what the first left", () => {
    const { game, a, b } = table();
    spawn(game, "Glorious Anthem");
    const id = hydra(game, 3);
    const bears = [spawn(game, "Grizzly Bears", B), spawn(game, "Grizzly Bears", B)];
    nextTurn(game);
    nextTurn(game);
    b.declareBlockersFn = () => bears.map((blocker) => ({ blocker, attacker: id }));
    attack(game, a, [id]);
    // 4 damage, 3 counters: 3 prevented, 1 dealt to a 1/1.
    expect(zone(game, id)).toBe("graveyard");
  });

  it("damage that can't be prevented still takes a counter for each 1 (the ruling)", () => {
    const { game } = table();
    const id = hydra(game, 7);
    lands(game, "Mountain", 2);
    cast(game, toHand(game, "Flaring Pain"));
    bolt(game, id);
    expect(counters(game, id)).toBe(4);
    expect(game.state.objects[id].damageMarked ?? 0).toBe(3);
  });

  it("{R}: the next 1 damage is prevented by its shield, and its controller spends the shield first", () => {
    const { game } = table();
    const id = hydra(game, 5);
    lands(game, "Mountain", 1);
    activate(game, id, 0);
    bolt(game, id);
    expect(counters(game, id)).toBe(3);
    expect(game.state.objects[id].damageMarked ?? 0).toBe(0);
  });
});
