/**
 * Reality Fracture (FRA), batch 4 (2026-10-14): the last of the set's cards,
 * and the `noncombat-damage-taken` turn stat ("an opponent was dealt
 * noncombat damage this turn"). Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import { A, B, activate, cast, counters, keywords, lands, pt, ref, spawn, table, toGraveyard, toHand, zone } from "./harness.js";

describe("Whiplash Wordsmith", () => {
  it("has flying and haste only once an opponent was dealt noncombat damage this turn", () => {
    const { game } = table();
    const wordsmith = spawn(game, "Whiplash Wordsmith");
    lands(game, "Mountain", 2);
    expect(keywords(game, wordsmith).has("flying")).toBe(false);
    // Damage to its own controller doesn't count.
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(A)] });
    expect(keywords(game, wordsmith).has("flying")).toBe(false);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(keywords(game, wordsmith).has("flying")).toBe(true);
    expect(keywords(game, wordsmith).has("haste")).toBe(true);
  });
});

describe("Grim Repriser", () => {
  it("returns from the graveyard with a finality counter, only after an opponent took noncombat damage", () => {
    const { game } = table();
    const repriser = toGraveyard(game, "Grim Repriser");
    lands(game, "Swamp", 1);
    lands(game, "Mountain", 2);
    expect(() => activate(game, repriser)).toThrow();
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    activate(game, repriser);
    expect(zone(game, repriser)).toBe("battlefield");
    expect(counters(game, repriser, "finality")).toBe(1);
  });

  it("gets +1/+1 when its controller casts a noncreature spell (prowess)", () => {
    const { game } = table();
    const repriser = spawn(game, "Grim Repriser");
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(pt(game, repriser)).toEqual({ power: 3, toughness: 3 });
  });
});
