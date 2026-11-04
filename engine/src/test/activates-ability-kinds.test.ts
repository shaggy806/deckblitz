/**
 * The `activates-ability` trigger narrowed by the ability's kind: `exhaust`
 * (rule 702.177) and `powerUp` (rule 702.193), beside the ninjutsu and loyalty
 * narrowing it already had. "Activate only once" alone isn't an exhaust ability.
 */

import { describe, expect, it } from "vitest";

import { A, B, activate, cast, counters, hand, lands, life, ref, spawn, table, toHand, types } from "./harness.js";

describe("exhaust", () => {
  it("Rangers' Refueler: draws as its own exhaust ability goes on the stack, then becomes a creature", () => {
    const { game } = table({ deck: "Mountain" });
    const refueler = spawn(game, "Rangers' Refueler");
    lands(game, "Island", 4, A);
    const before = hand(game, A).length;
    activate(game, refueler, 0);
    expect(hand(game, A).length).toBe(before + 1);
    expect(types(game, refueler)).toContain("creature");
    expect(counters(game, refueler)).toBe(1);
    // Exhaust: only once.
    lands(game, "Island", 4, A);
    expect(() => activate(game, refueler, 0)).toThrow();
  });

  it("Rangers' Refueler: another's exhaust ability you activate counts, an opponent's doesn't", () => {
    const { game } = table({ deck: "Mountain" });
    spawn(game, "Rangers' Refueler");
    const buggy = spawn(game, "Rocketeer Boostbuggy");
    lands(game, "Island", 3, A);
    const before = hand(game, A).length;
    activate(game, buggy, 0);
    expect(hand(game, A).length).toBe(before + 1);
  });

  it("an opponent's exhaust ability doesn't trigger it, nor does a crew", () => {
    const { game } = table({ deck: "Mountain" });
    const refueler = spawn(game, "Rangers' Refueler");
    spawn(game, "Hill Giant");
    const buggy = spawn(game, "Rocketeer Boostbuggy", B);
    lands(game, "Mountain", 3, B);
    const before = hand(game, A).length;
    activate(game, refueler, 1);
    expect(types(game, refueler)).toContain("creature");
    expect(hand(game, A).length).toBe(before);
    const held = toHand(game, "Lightning Bolt");
    lands(game, "Mountain", 1, A);
    cast(game, held, { targets: [ref(B)], settle: false });
    game.advanceUntil((s) => s.priority.holder === B);
    activate(game, buggy, 0, { player: B });
    expect(hand(game, A).length).toBe(before);
  });

  it("Adrenaline Jockey: a +1/+1 counter per exhaust ability you activate", () => {
    const { game } = table();
    const jockey = spawn(game, "Adrenaline Jockey");
    const buggy = spawn(game, "Rocketeer Boostbuggy");
    lands(game, "Mountain", 3, A);
    activate(game, buggy, 0);
    expect(counters(game, jockey)).toBe(1);
  });

  it("Adrenaline Jockey: 4 damage to a player casting a spell off their turn, and none on it", () => {
    const { game } = table();
    spawn(game, "Adrenaline Jockey");
    lands(game, "Mountain", 1, A);
    lands(game, "Mountain", 1, B);
    const mine = toHand(game, "Lightning Bolt");
    const theirs = toHand(game, "Lightning Bolt", B);
    cast(game, mine, { targets: [ref(B)], settle: false });
    // Bob gets priority with Alice's Bolt on the stack: it's not his turn.
    game.advanceUntil((s) => s.priority.holder === B);
    cast(game, theirs, { player: B, targets: [ref(A)] });
    expect(life(game, A)).toBe(17);
    expect(life(game, B)).toBe(20 - 3 - 4);
  });
});

describe("powerUp", () => {
  it("Marvel Boy, Noh-Varr: grows on a power-up ability, and on another creature entering", () => {
    const { game } = table({ deck: "Mountain" });
    const boy = spawn(game, "Marvel Boy, Noh-Varr");
    const quick = spawn(game, "Quicksilver, Brash Blur");
    lands(game, "Mountain", 5, A);
    activate(game, quick, 0);
    expect(counters(game, boy)).toBe(1);
    lands(game, "Forest", 2, A);
    cast(game, toHand(game, "Grizzly Bears"));
    expect(counters(game, boy)).toBe(2);
    // Not on its own arrival: "another".
    expect(counters(game, quick)).toBe(1);
  });

  it("an exhaust ability isn't a power-up ability", () => {
    const { game } = table({ deck: "Mountain" });
    const boy = spawn(game, "Marvel Boy, Noh-Varr");
    const buggy = spawn(game, "Rocketeer Boostbuggy");
    lands(game, "Mountain", 3, A);
    activate(game, buggy, 0);
    expect(counters(game, boy)).toBe(0);
  });
});
