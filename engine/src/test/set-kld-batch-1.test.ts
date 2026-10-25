/**
 * Batch 141's lead cards: Kaladesh's Ninth Bridge Patrol (auto-finished by
 * the scaffolder), and the earlier improvise cards batch 140's improvise
 * unblocked — each a plain `improvise: true` beside a shape the pool has.
 */
import { describe, expect, it } from "vitest";

import { A, B, cast, counters, destroy, enter, graveyard, keywords, lands, pickFromZone, ref, spawn, subtypes, table, toHand, toLibrary, tokensNamed, types, zone } from "./harness.js";

describe("Ninth Bridge Patrol", () => {
  it("grows when another creature you control leaves, not an opponent's", () => {
    const { game } = table();
    const patrol = spawn(game, "Ninth Bridge Patrol");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    destroy(game, theirs);
    expect(counters(game, patrol)).toBe(0);
    destroy(game, bears);
    expect(counters(game, patrol)).toBe(1);
  });
});

describe("Bottle-Cap Blast", () => {
  it("makes a tapped Treasure for each point of excess damage to a permanent", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Bottle-Cap Blast"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(tokensNamed(game, "Treasure Token", A)).toBe(3);
  });

  it("makes none when it hits a player", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    cast(game, toHand(game, "Bottle-Cap Blast"), { targets: [ref(B)] });
    expect(game.state.players[B].life).toBe(15);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(0);
  });

  it("can be paid with artifacts for its generic mana (improvise)", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    const relics = [spawn(game, "Darksteel Relic"), spawn(game, "Darksteel Relic"), spawn(game, "Darksteel Relic"), spawn(game, "Darksteel Relic")];
    cast(game, toHand(game, "Bottle-Cap Blast"), { targets: [ref(B)], convoke: relics.map((creature) => ({ creature })) });
    expect(game.state.players[B].life).toBe(15);
  });
});

describe("Kappa Cannoneer", () => {
  it("gets a counter and can't be blocked when another artifact you control enters", () => {
    const { game } = table();
    const kappa = spawn(game, "Kappa Cannoneer");
    enter(game, "Darksteel Relic");
    expect(counters(game, kappa)).toBe(1);
    expect(keywords(game, kappa).has("unblockable")).toBe(true);
    enter(game, "Grizzly Bears");
    expect(counters(game, kappa)).toBe(1);
  });

  it("triggers on its own entry", () => {
    const { game } = table();
    const kappa = enter(game, "Kappa Cannoneer");
    expect(counters(game, kappa)).toBe(1);
  });
});

describe("Saheeli's Directive", () => {
  it("puts chosen artifacts of mana value X or less onto the battlefield and the rest in the graveyard", () => {
    const { game, a } = table();
    lands(game, "Mountain", 6);
    const ring = toLibrary(game, "Sol Ring");
    const relic = toLibrary(game, "Darksteel Relic");
    const bears = toLibrary(game, "Grizzly Bears");
    pickFromZone(a, ring, relic);
    cast(game, toHand(game, "Saheeli's Directive"), { x: 3 });
    expect(zone(game, ring)).toBe("battlefield");
    expect(zone(game, relic)).toBe("battlefield");
    expect(graveyard(game)).toContain(bears);
  });
});

describe("Whir of Invention", () => {
  it("searches for an artifact with mana value X or less onto the battlefield", () => {
    const { game, a } = table();
    lands(game, "Island", 4);
    const ring = toLibrary(game, "Sol Ring");
    const seen = pickFromZone(a, ring);
    cast(game, toHand(game, "Whir of Invention"), { x: 1 });
    expect(zone(game, ring)).toBe("battlefield");
    expect(seen.offered).toContain(ring);
  });
});

describe("Organic Extinction", () => {
  it("destroys nonartifact creatures only", () => {
    const { game } = table();
    lands(game, "Plains", 10);
    const bears = spawn(game, "Grizzly Bears", B);
    const memnite = spawn(game, "Memnite", B);
    cast(game, toHand(game, "Organic Extinction"));
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, memnite)).toBe("battlefield");
  });
});

describe("Synth Infiltrator", () => {
  it("enters as a copy that's also a Synth artifact creature", () => {
    const { game, a } = table();
    lands(game, "Island", 5);
    const bears = spawn(game, "Grizzly Bears", B);
    a.chooseCopyFn = () => bears;
    const card = toHand(game, "Synth Infiltrator");
    cast(game, card);
    expect(zone(game, card)).toBe("battlefield");
    expect(game.state.objects[card].copyOf).toBe("Grizzly Bears");
    expect(types(game, card)).toEqual(expect.arrayContaining(["artifact", "creature"]));
    expect(subtypes(game, card)).toEqual(expect.arrayContaining(["Bear", "Synth"]));
  });
});

describe("Universal Surveillance and Arc Reactor", () => {
  it("Arc Reactor enters tapped", () => {
    const { game } = table();
    lands(game, "Wastes", 5);
    const reactor = toHand(game, "Arc Reactor");
    cast(game, reactor);
    expect(game.state.objects[reactor].tapped).toBe(true);
  });

  it("Universal Surveillance draws X", () => {
    const { game } = table();
    lands(game, "Island", 5);
    const before = game.state.zones.perPlayer[A].hand.length;
    cast(game, toHand(game, "Universal Surveillance"), { x: 2 });
    expect(game.state.zones.perPlayer[A].hand.length).toBe(before + 1 - 1 + 2);
  });
});
