import { describe, expect, it } from "vitest";

import { A, B, cast, lands, life, settle, table, toHand, toLibrary, zone } from "./harness.js";

/**
 * A rules audit (2026-11-26): cascade (rule 702.85a) reads a split card's
 * mana value as both halves' together (709.4a): Fire // Ice is 4, not less
 * than Bloodbraid Elf's 4, and is passed over.
 */
describe("cascade past a split card, audited", () => {
  it("Bloodbraid Elf passes over Fire // Ice (mana value 4) to the Lightning Bolt below it (rules 702.85a, 709.4a)", () => {
    const { game, a } = table();
    const bolt = toLibrary(game, "Lightning Bolt");
    const fireIce = toLibrary(game, "Fire // Ice"); // on top
    lands(game, "Mountain", 2);
    lands(game, "Forest", 2);
    const offered: string[] = [];
    a.chooseCastNowFn = (_view, offer) => {
      offered.push(...offer.casts.map((c) => c.cardName));
      const way = offer.casts[0]!;
      return { type: "cast-spell", player: A, card: way.card, targets: [{ kind: "player", player: B }], via: "effect", free: true };
    };
    const before = life(game, B);
    cast(game, toHand(game, "Bloodbraid Elf"));
    settle(game);
    expect(offered).toEqual(["Lightning Bolt"]);
    expect(life(game, B)).toBe(before - 3);
    expect(zone(game, bolt)).toBe("graveyard");
    expect(zone(game, fireIce)).toBe("library");
  });
});
