/**
 * Fate Reforged, the scaffolder's finished drafts: Dromoka, the Eternal's
 * bolster on any Dragon you control attacking, Abzan Advantage's
 * sacrifice-then-bolster, Mardu Shadowspear's drain on attack and
 * Vaultbreaker's "if you do" rummage.
 */
import { describe, expect, it } from "vitest";

import { A, B, C, attack, cast, counters, hand, lands, life, graveyard, ref, spawn, table, toHand, zone } from "./harness.js";

describe("Dromoka, the Eternal", () => {
  it("bolsters 2 when another Dragon you control attacks", () => {
    const { game, a } = table();
    spawn(game, "Dromoka, the Eternal");
    const shivan = spawn(game, "Shivan Dragon");
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [shivan]);
    expect(counters(game, bears)).toBe(2);
  });
});

describe("Abzan Advantage", () => {
  it("makes the target player sacrifice an enchantment, then bolsters 1", () => {
    const { game } = table();
    const anthem = spawn(game, "Glorious Anthem", B);
    const bears = spawn(game, "Grizzly Bears");
    const advantage = toHand(game, "Abzan Advantage");
    lands(game, "Plains", 2);
    cast(game, advantage, { targets: [ref(B)] });
    expect(zone(game, anthem)).toBe("graveyard");
    expect(counters(game, bears)).toBe(1);
  });
});

describe("Mardu Shadowspear", () => {
  it("makes each opponent lose 1 life when it attacks", () => {
    const { game, a } = table({ players: 3 });
    const spear = spawn(game, "Mardu Shadowspear");
    attack(game, a, [spear]);
    expect(life(game, B)).toBe(18);
    expect(life(game, C)).toBe(19);
    expect(life(game, A)).toBe(20);
  });
});

describe("Vaultbreaker", () => {
  it("discards a card, then draws one", () => {
    const { game, a } = table();
    const breaker = spawn(game, "Vaultbreaker");
    a.chooseModesFn = () => [0];
    const before = hand(game).length;
    attack(game, a, [breaker]);
    expect(hand(game).length).toBe(before);
    expect(graveyard(game).length).toBe(1);
  });
});
