/**
 * `look-and-choose`'s `leftoverCounters`: the cards left over are exiled with
 * counters on them — Karn, Scion of Urza's "Put that card into your hand and
 * exile the other with a silver counter on it", and his −1 that reads it.
 */
import { describe, expect, it } from "vitest";

import { A, counters, hand, loyalty, pickFromZone, spawn, table, toExile, toLibrary, tokensNamed, toStep, pt, named, zone } from "./harness.js";

describe("Karn, Scion of Urza", () => {
  it("+1: the opponent's pick goes to hand, the other is exiled with a silver counter", () => {
    const { game, b } = table();
    const karn = spawn(game, "Karn, Scion of Urza");
    const second = toLibrary(game, "Grizzly Bears");
    const top = toLibrary(game, "Lightning Bolt");
    const seen = pickFromZone(b, second);
    loyalty(game, karn, 1);
    expect([...seen.offered].sort()).toEqual([second, top].sort());
    expect(hand(game, A)).toContain(second);
    expect(zone(game, top)).toBe("exile");
    expect(counters(game, top, "silver")).toBe(1);
    expect(counters(game, second, "silver")).toBe(0);
    expect(counters(game, karn, "loyalty")).toBe(6);
  });

  it("+1 with one card in the library: it's the one chosen, nothing is exiled", () => {
    const { game } = table();
    const karn = spawn(game, "Karn, Scion of Urza");
    const library = game.state.zones.perPlayer[A].library;
    const only = library[0];
    library.splice(1);
    loyalty(game, karn, 1);
    expect(hand(game, A)).toContain(only);
    expect(game.state.zones.shared.exile).toEqual([]);
  });

  it("−1: only a card you own with a silver counter comes back from exile", () => {
    const { game, a } = table();
    const karn = spawn(game, "Karn, Scion of Urza");
    const plain = toExile(game, "Grizzly Bears");
    toLibrary(game, "Shock");
    const top = toLibrary(game, "Lightning Bolt");
    loyalty(game, karn, 1);
    const silvered = game.state.zones.shared.exile.find((id) => id !== plain)!;
    expect(counters(game, silvered, "silver")).toBe(1);
    expect(silvered).not.toBe(top);
    toStep(game, "precombat-main");
    const seen = pickFromZone(a, silvered);
    loyalty(game, karn, -1);
    expect(seen.offered).toEqual([silvered]);
    expect(hand(game, A)).toContain(silvered);
    expect(zone(game, plain)).toBe("exile");
    // A card that left exile is a new object: no counter comes with it.
    expect(counters(game, silvered, "silver")).toBe(0);
  });

  it("−2: a Construct that counts itself", () => {
    const { game } = table();
    const karn = spawn(game, "Karn, Scion of Urza");
    loyalty(game, karn, -2);
    expect(tokensNamed(game, "Construct Token", A)).toBe(1);
    expect(pt(game, named(game, "Construct Token", A)[0])).toEqual({ power: 1, toughness: 1 });
  });
});
