/**
 * "For each transformed permanent you control" — a `grantPtPerCount` over
 * `CardFilter.transformed` (double-faced permanents with their back face up,
 * rule 701.27g). Mutagen Connoisseur is the proving card: +1/+0 for each of
 * its controller's, not front-faced ones or an opponent's, and one turned
 * back to its front face stops counting.
 */
import { describe, expect, it } from "vitest";

import { computeCharacteristics, invalidateComputedCache } from "../characteristics.js";
import { B, spawn, table } from "./harness.js";

describe("Mutagen Connoisseur", () => {
  it("gets +1/+0 for each transformed permanent you control", () => {
    const { game } = table();
    const connoisseur = spawn(game, "Mutagen Connoisseur");
    const power = (): number => computeCharacteristics(game.state, game.registry, connoisseur).power;
    expect(power()).toBe(0);
    expect(computeCharacteristics(game.state, game.registry, connoisseur).toughness).toBe(5);
    const aberration = spawn(game, "Delver of Secrets");
    const invasion = spawn(game, "Invasion of Pyrulea");
    spawn(game, "Delver of Secrets"); // front face up: not transformed
    const theirs = spawn(game, "Delver of Secrets", B);
    for (const id of [aberration, invasion, theirs]) game.state.objects[id].face = 1;
    invalidateComputedCache();
    expect(power()).toBe(2);
    // Turned back to its front face, it's no longer transformed (701.27g).
    game.state.objects[aberration].face = 0;
    invalidateComputedCache();
    expect(power()).toBe(1);
  });
});
