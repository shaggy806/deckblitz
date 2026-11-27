/**
 * "Exile the top card of your library. If it's a creature card, this
 * creature gets +X/+Y until end of turn, where X is the exiled creature
 * card's power and Y is its toughness" (Bioplasm): `{ powerOf: { thisWay:
 * "exiled" } }` and `toughnessOf` read the card exiled this way where it is,
 * in exile, fixed as the ability resolves (rule 611.2c).
 */
import { describe, expect, it } from "vitest";
import { A, attack, life, pt, spawn, table, toLibrary, zone, B } from "./harness.js";

describe("Bioplasm", () => {
  it("gets the exiled creature card's power and toughness until end of turn", () => {
    const { game, a } = table();
    const ooze = spawn(game, "Bioplasm", A, { sick: false });
    const top = toLibrary(game, "Craw Wurm");
    attack(game, a, [ooze]);
    expect(zone(game, top)).toBe("exile");
    // Craw Wurm is 6/4: a 10/8 Ooze that dealt 10.
    expect(pt(game, ooze)).toEqual({ power: 10, toughness: 8 });
    expect(life(game, B)).toBe(10);
    game.advanceUntil((s) => s.turn.number === 2);
    expect(pt(game, ooze)).toEqual({ power: 4, toughness: 4 });
  });

  it("gets nothing when the exiled card isn't a creature card", () => {
    const { game, a } = table();
    const ooze = spawn(game, "Bioplasm", A, { sick: false });
    const top = toLibrary(game, "Forest");
    attack(game, a, [ooze]);
    expect(zone(game, top)).toBe("exile");
    expect(pt(game, ooze)).toEqual({ power: 4, toughness: 4 });
    expect(life(game, B)).toBe(16);
  });
});
