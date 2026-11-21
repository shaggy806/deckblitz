/**
 * "Return it to the battlefield … It's a Spirit Detective. (It's no longer a
 * Human.)" (Otherworldly Escort): `put-onto-battlefield`'s `enterAs.setSubtypes`
 * replaces its creature types in place as it enters (rules 611.2c, 614.12), so
 * enter triggers see what it became.
 */
import { describe, expect, it } from "vitest";

import { counters, destroy, life, settle, spawn, subtypes, table, zone } from "./harness.js";

describe("Otherworldly Escort", () => {
  it("returns once, with four charge counters, a Spirit Detective as it enters", () => {
    const { game } = table();
    spawn(game, "Drogskol Cavalry");
    const lieutenant = spawn(game, "Thalia's Lieutenant");
    const escort = spawn(game, "Otherworldly Escort");
    expect(subtypes(game, escort)).toContain("Human");
    destroy(game, escort);
    settle(game);
    expect(zone(game, escort)).toBe("battlefield");
    expect([...subtypes(game, escort)].sort()).toEqual(["Detective", "Spirit"]);
    expect(counters(game, escort, "charge")).toBe(4);
    // Drogskol Cavalry saw a Spirit enter; Thalia's Lieutenant saw no Human.
    expect(life(game)).toBe(22);
    expect(counters(game, lieutenant)).toBe(0);
    // A Spirit now, it doesn't come back again (the intervening "if", 603.4).
    destroy(game, escort);
    settle(game);
    expect(zone(game, escort)).toBe("graveyard");
  });
});
