/**
 * `put-onto-battlefield`'s `withCounters.ifCreature`: the counters only if
 * what enters is a creature, judged as it exists on the battlefield (rule
 * 614.12) — Recommission's "If a creature enters this way, it enters with an
 * additional +1/+1 counter on it", What Must Be Done's "It enters with two
 * additional +1/+1 counters on it if it's a creature".
 */

import { describe, expect, it } from "vitest";

import { A, cast, counters, lands, ref, spawn, table, toGraveyard, toHand, types, zone } from "./harness.js";

describe("Recommission", () => {
  it("returns a creature card with an additional +1/+1 counter", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const bears = toGraveyard(game, "Grizzly Bears");
    cast(game, toHand(game, "Recommission"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("battlefield");
    expect(counters(game, bears)).toBe(1);
  });

  it("returns an artifact that isn't a creature with no counter", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const ring = toGraveyard(game, "Sol Ring");
    cast(game, toHand(game, "Recommission"), { targets: [ref(ring)] });
    expect(zone(game, ring)).toBe("battlefield");
    expect(counters(game, ring)).toBe(0);
  });

  it("judges the card as it exists on the battlefield (rule 614.12): an artifact animated there is a creature", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    spawn(game, "March of the Machines");
    const ring = toGraveyard(game, "Sol Ring");
    cast(game, toHand(game, "Recommission"), { targets: [ref(ring)] });
    expect(zone(game, ring)).toBe("battlefield");
    expect(types(game, ring)).toContain("creature");
    expect(counters(game, ring)).toBe(1);
  });
});

describe("What Must Be Done", () => {
  it("Release Juno returns a historic creature card with two additional +1/+1 counters", () => {
    const { game } = table();
    lands(game, "Plains", 5);
    const hound = toGraveyard(game, "Isamaru, Hound of Konda");
    cast(game, toHand(game, "What Must Be Done"), { modes: [1], targets: [ref(hound)] });
    expect(zone(game, hound)).toBe("battlefield");
    expect(counters(game, hound)).toBe(2);
  });

  it("Release Juno returns a noncreature artifact with none, and can't target a card that isn't historic", () => {
    const { game } = table();
    lands(game, "Plains", 10);
    const ring = toGraveyard(game, "Sol Ring");
    const bears = toGraveyard(game, "Grizzly Bears");
    expect(() => cast(game, toHand(game, "What Must Be Done"), { modes: [1], targets: [ref(bears)] })).toThrow();
    cast(game, toHand(game, "What Must Be Done"), { modes: [1], targets: [ref(ring)] });
    expect(zone(game, ring)).toBe("battlefield");
    expect(counters(game, ring)).toBe(0);
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("Let the World Burn destroys all artifacts and creatures", () => {
    const { game } = table();
    const plains = lands(game, "Plains", 5);
    const bears = spawn(game, "Grizzly Bears");
    const ring = spawn(game, "Sol Ring");
    cast(game, toHand(game, "What Must Be Done"), { modes: [0] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, ring)).toBe("graveyard");
    expect(zone(game, plains[0])).toBe("battlefield");
    expect(A).toBeDefined();
  });
});
