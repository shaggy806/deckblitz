/**
 * "As this enters, discard any number of creature cards" (`AsEntersAction.discard`,
 * rule 614.1c): chosen and discarded as it's about to enter, and with
 * `keywordCounters` it enters with one counter of each listed keyword among
 * them (rule 122.1b) — Indominus Rex, Alpha.
 */

import { describe, expect, it } from "vitest";

import { A, cast, counters, graveyard, hand, keywords, lands, pickFromZone, settle, table, toHand, zone } from "./harness.js";

function setup() {
  const t = table();
  lands(t.game, "Forest", 3);
  lands(t.game, "Island", 2);
  return t;
}

describe("Indominus Rex, Alpha", () => {
  it("discards the chosen creature cards and enters with one counter of each keyword among them", () => {
    const { game, a } = setup();
    const angel = toHand(game, "Serra Angel");
    const hawk = toHand(game, "Vampire Nighthawk");
    const bears = toHand(game, "Grizzly Bears");
    const ring = toHand(game, "Sol Ring");
    const rex = toHand(game, "Indominus Rex, Alpha");
    const seen = pickFromZone(a, angel, hawk);
    const before = hand(game, A).length;
    cast(game, rex);
    settle(game);
    expect(seen.offered).toEqual(expect.arrayContaining([angel, hawk, bears]));
    expect(seen.offered).not.toContain(ring);
    expect(seen.offered).not.toContain(rex);
    expect(zone(game, rex)).toBe("battlefield");
    expect(graveyard(game, A)).toEqual(expect.arrayContaining([angel, hawk]));
    expect(zone(game, bears)).toBe("hand");
    // Flying twice is still one flying counter (its ruling).
    for (const k of ["flying", "vigilance", "deathtouch", "lifelink"]) expect(counters(game, rex, k)).toBe(1);
    expect(counters(game, rex, "trample")).toBe(0);
    expect(keywords(game, rex).has("flying")).toBe(true);
    expect(keywords(game, rex).has("deathtouch")).toBe(true);
    // Four counters: four cards drawn (Rex and two discards left the hand).
    expect(hand(game, A).length).toBe(before - 3 + 4);
  });

  it("discarding nothing: no counters, no cards drawn", () => {
    const { game, a } = setup();
    toHand(game, "Serra Angel");
    const rex = toHand(game, "Indominus Rex, Alpha");
    pickFromZone(a);
    const before = hand(game, A).length;
    cast(game, rex);
    settle(game);
    expect(zone(game, rex)).toBe("battlefield");
    expect(Object.values(game.state.objects[rex].counters ?? {}).reduce((s, n) => s + (n ?? 0), 0)).toBe(0);
    expect(hand(game, A).length).toBe(before - 1);
  });

  it("a keywordless creature card discarded gives no counter", () => {
    const { game, a } = setup();
    const bears = toHand(game, "Grizzly Bears");
    const rex = toHand(game, "Indominus Rex, Alpha");
    pickFromZone(a, bears);
    const before = hand(game, A).length;
    cast(game, rex);
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
    expect(hand(game, A).length).toBe(before - 2);
  });
});
