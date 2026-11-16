/**
 * `put-onto-battlefield`'s `withCounters` as a list: several kinds of counter
 * put on as it enters (rule 122.6) — Perennation's "with a hexproof counter
 * and an indestructible counter on it" — each `ifType` read as it is on the
 * battlefield (rule 614.12).
 */
import { describe, expect, it } from "vitest";

import { A, B, cast, counters, destroy, keywords, lands, ref, settle, table, toGraveyard, toHand, zone } from "./harness.js";

describe("withCounters, several kinds — Perennation", () => {
  it("returns a creature card with a hexproof counter and an indestructible counter", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    lands(game, "Swamp", 2);
    lands(game, "Forest", 2);
    const bears = toGraveyard(game, "Grizzly Bears");
    const spell = toHand(game, "Perennation");
    cast(game, spell, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("battlefield");
    expect(counters(game, bears, "hexproof")).toBe(1);
    expect(counters(game, bears, "indestructible")).toBe(1);
    expect(keywords(game, bears).has("hexproof")).toBe(true);
    expect(keywords(game, bears).has("indestructible")).toBe(true);
    destroy(game, bears, B);
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("returns a noncreature permanent card with both counters too", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    lands(game, "Swamp", 2);
    lands(game, "Forest", 2);
    const ring = toGraveyard(game, "Sol Ring");
    cast(game, toHand(game, "Perennation"), { targets: [ref(ring)] });
    expect(zone(game, ring)).toBe("battlefield");
    expect(counters(game, ring, "hexproof")).toBe(1);
    expect(counters(game, ring, "indestructible")).toBe(1);
  });

  it("can't target an instant or sorcery card", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    lands(game, "Swamp", 2);
    lands(game, "Forest", 2);
    const bolt = toGraveyard(game, "Lightning Bolt");
    expect(() => cast(game, toHand(game, "Perennation"), { targets: [ref(bolt)] })).toThrow(/target/i);
  });

  it("puts on only the kinds whose ifType it is as it enters", () => {
    const { game } = table();
    const land = toGraveyard(game, "Forest");
    game.debugApplyEffect(
      A,
      {
        kind: "put-onto-battlefield",
        target: 0,
        withCounters: [
          { kind: "+1/+1", amount: 1, ifType: "creature" },
          { kind: "charge", amount: 2 },
        ],
      },
      [ref(land)],
    );
    settle(game);
    expect(zone(game, land)).toBe("battlefield");
    expect(counters(game, land, "+1/+1")).toBe(0);
    expect(counters(game, land, "charge")).toBe(2);
  });
});
