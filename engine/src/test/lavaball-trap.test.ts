/**
 * Lavaball Trap: "If **an opponent** had two or more lands enter the
 * battlefield under their control this turn" is one opponent's own count —
 * a land each from two opponents isn't two for either (`turn-history`, `who:
 * "opponent"`, `atLeast: 2`, each opponent tested alone).
 */
import { describe, expect, it } from "vitest";

import { A, B, C, cast, enter, lands, ref, spawn, table, toHand, zone } from "./harness.js";

describe("Lavaball Trap", () => {
  it("a land each from two opponents isn't two; a second for one of them is", () => {
    const { game } = table({ players: 3 });
    lands(game, "Mountain", 5);
    const [x, y] = lands(game, "Forest", 2, A);
    const trap = toHand(game, "Lavaball Trap");
    enter(game, "Plains", B);
    enter(game, "Island", C);
    expect(() => cast(game, trap, { altCost: true, targets: [ref(x), ref(y)], settle: false })).toThrow();
    enter(game, "Swamp", B);
    cast(game, trap, { altCost: true, targets: [ref(x), ref(y)] });
    expect(zone(game, x)).toBe("graveyard");
    expect(zone(game, y)).toBe("graveyard");
  });

  it("destroys two target lands and deals 4 damage to each creature", () => {
    const { game } = table();
    lands(game, "Mountain", 8);
    const [x, y] = lands(game, "Forest", 2, B);
    const bears = spawn(game, "Grizzly Bears", B);
    const own = spawn(game, "Grizzly Bears", A);
    const big = spawn(game, "Colossal Dreadmaw", B);
    cast(game, toHand(game, "Lavaball Trap"), { targets: [ref(x), ref(y)] });
    expect(zone(game, x)).toBe("graveyard");
    expect(zone(game, y)).toBe("graveyard");
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, own)).toBe("graveyard");
    expect(zone(game, big)).toBe("battlefield");
  });
});
