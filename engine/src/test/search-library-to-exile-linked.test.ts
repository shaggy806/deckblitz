/**
 * A library search that exiles what it finds: "that many" read off it (Myr
 * Incubator — `thisWay: "exiled"`), and the finds exiled with the source for
 * a linked ability to cast (Kaho, Minamo Historian — `linked`, then `cast-now
 * from: "exiled-with-source"` with a `spell` filter on X). No engine code: the
 * search's `destination: "exile"` was there.
 */

import { describe, expect, it } from "vitest";

import { A, B, activate, enter, lands, life, pickFromZone, ref, spawn, table, toLibrary, tokensNamed, zone } from "./harness.js";

describe("Myr Incubator", () => {
  it("exiles the artifact cards found and makes that many Myr", () => {
    const { game, a } = table();
    lands(game, "Wastes", 6);
    const incubator = spawn(game, "Myr Incubator");
    const ring = toLibrary(game, "Sol Ring");
    const stone = toLibrary(game, "Mind Stone");
    const offered = pickFromZone(a, ring, stone);
    activate(game, incubator);
    expect(zone(game, incubator)).toBe("graveyard");
    expect(offered.offered).toEqual(expect.arrayContaining([ring, stone]));
    expect(zone(game, ring)).toBe("exile");
    expect(zone(game, stone)).toBe("exile");
    expect(tokensNamed(game, "Myr Token", A)).toBe(2);
  });

  it("makes none when it finds none", () => {
    const { game, a } = table();
    lands(game, "Wastes", 6);
    const incubator = spawn(game, "Myr Incubator");
    toLibrary(game, "Sol Ring");
    pickFromZone(a);
    activate(game, incubator);
    expect(tokensNamed(game, "Myr Token", A)).toBe(0);
  });
});

describe("Kaho, Minamo Historian", () => {
  it("exiles up to three instants and casts one with mana value X for free", () => {
    const { game, a } = table();
    const bolt = toLibrary(game, "Lightning Bolt");
    const counter = toLibrary(game, "Counterspell");
    const ring = toLibrary(game, "Sol Ring");
    const offered = pickFromZone(a, bolt, counter);
    const kaho = enter(game, "Kaho, Minamo Historian");
    expect(offered.offered).not.toContain(ring);
    expect(zone(game, bolt)).toBe("exile");
    expect(zone(game, counter)).toBe("exile");
    lands(game, "Wastes", 1);
    game.state.objects[kaho].summoningSick = false;
    const seen: string[][] = [];
    a.chooseCastNowFn = (_view, offer) => {
      seen.push(offer.casts.map((c) => c.card));
      const way = offer.casts.find((c) => c.card === bolt);
      if (way === undefined) return null;
      return { type: "cast-spell", player: A, card: way.card, targets: [ref(B)], via: way.via, ...(offer.free ? { free: true } : {}) };
    };
    activate(game, kaho, 0, { x: 1 });
    // Counterspell's mana value is 2: only Lightning Bolt is offered at X = 1.
    expect(seen[0]).toEqual([bolt]);
    expect(life(game, B)).toBe(17);
    expect(zone(game, bolt)).toBe("graveyard");
    expect(zone(game, counter)).toBe("exile");
  });

  it("can't cast a card exiled some other way", () => {
    const { game, a } = table();
    pickFromZone(a);
    const kaho = enter(game, "Kaho, Minamo Historian");
    const bolt = toLibrary(game, "Lightning Bolt");
    game.debugMove(bolt, "exile");
    lands(game, "Wastes", 1);
    game.state.objects[kaho].summoningSick = false;
    let asked = false;
    a.chooseCastNowFn = () => {
      asked = true;
      return null;
    };
    activate(game, kaho, 0, { x: 1 });
    expect(asked).toBe(false);
    expect(zone(game, bolt)).toBe("exile");
  });
});
