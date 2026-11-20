/**
 * An alternative cost of generic mana equal to the spell's mana value
 * (`alternativeCostForSpells.manaIsManaValue`, rule 118.9): Kentaro, the
 * Smiling Cat's "You may pay {X} rather than pay the mana cost for Samurai
 * spells you cast, where X is that spell's mana value" — the colored pips
 * become generic, and only for Samurai spells.
 */

import { describe, expect, it } from "vitest";

import { cast, lands, spawn, table, toHand, zone } from "./harness.js";

describe("Kentaro, the Smiling Cat", () => {
  it("casts a Samurai spell for {N} of any mana, N its mana value", () => {
    const { game } = table();
    spawn(game, "Kentaro, the Smiling Cat");
    lands(game, "Plains", 3);
    // {2}{R}: three Plains pay {3}, the red pip as generic.
    const brothers = toHand(game, "Brothers Yamazaki");
    expect(() => cast(game, brothers)).toThrow(/refused/);
    cast(game, brothers, { altCost: true });
    expect(zone(game, brothers)).toBe("battlefield");
  });

  it("still costs the mana value: too little mana can't pay it", () => {
    const { game } = table();
    spawn(game, "Kentaro, the Smiling Cat");
    lands(game, "Plains", 2);
    const brothers = toHand(game, "Brothers Yamazaki");
    expect(() => cast(game, brothers, { altCost: true })).toThrow(/refused/);
  });

  it("reaches only Samurai spells", () => {
    const { game } = table();
    spawn(game, "Kentaro, the Smiling Cat");
    lands(game, "Plains", 3);
    const goblin = toHand(game, "Raging Goblin");
    expect(() => cast(game, goblin, { altCost: true })).toThrow(/refused/);
  });
});
