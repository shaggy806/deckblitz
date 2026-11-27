/**
 * Undying Flames: a `reveal-until` that exiles as it goes, its `then` reading
 * the spell's own any-target slot (`thenKeepsTargets`), under epic (rule
 * 702.50a) — each upkeep's copy may take a new target and exiles again.
 */
import { describe, expect, it } from "vitest";

import { A, B, cast, lands, life, ref, settle, spawn, table, toHand, toLibrary, toStep, watchTargets, zone } from "./harness.js";

describe("Undying Flames", () => {
  it("exiles down to a nonland card and deals its mana value to the target, then again each upkeep", () => {
    const { game, a } = table();
    lands(game, "Mountain", 6);
    // Bottom to top: the upkeep's copy finds the Giant under the Bears.
    const giant = toLibrary(game, "Hill Giant");
    const upkeepLand = toLibrary(game, "Forest");
    toLibrary(game, "Island");
    const bears = toLibrary(game, "Grizzly Bears");
    const land = toLibrary(game, "Mountain");
    const flames = toHand(game, "Undying Flames");
    const before = life(game, B);
    cast(game, flames, { targets: [ref(B)] });
    expect(zone(game, land)).toBe("exile");
    expect(zone(game, bears)).toBe("exile");
    expect(life(game, B)).toBe(before - 2);

    // The copy at Alice's next upkeep: aimed at a creature instead.
    const ogre = spawn(game, "Gray Ogre", B);
    const seen = watchTargets(a, (offered) => offered.map(() => ogre));
    // Skip Bob's turn, then Alice's upkeep (her draw comes after).
    toStep(game, "upkeep", B);
    toStep(game, "upkeep", A);
    settle(game);
    expect(seen.asked).toBeGreaterThan(0);
    expect(zone(game, upkeepLand)).toBe("exile");
    expect(zone(game, giant)).toBe("exile");
    // Hill Giant's mana value is 4: Gray Ogre (2/2) dies, Bob's life holds.
    expect(zone(game, ogre)).toBe("graveyard");
    expect(life(game, B)).toBe(before - 2);
  });

});
