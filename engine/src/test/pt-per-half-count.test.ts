/**
 * "+X/+Y, where X is half the number of Forests you control, rounded down,
 * and Y is half …, rounded up" (Aspect of Wolf): `grantPtPerCount`'s `step`
 * with `round` per component (layer 7c, rule 613.4c).
 */
import { describe, expect, it } from "vitest";

import { A, B, cast, lands, pt, ref, spawn, table, toHand } from "./harness.js";

describe("Aspect of Wolf", () => {
  it("gives +X/+Y, X half the Forests rounded down and Y rounded up", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Aspect of Wolf"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    lands(game, "Forest", 1);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 4 });
    lands(game, "Forest", 2);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 5 });
  });

  it("counts the Aura's controller's Forests, on an opponent's creature too", () => {
    const { game } = table();
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Forest", 3, B);
    lands(game, "Forest", 3, A);
    cast(game, toHand(game, "Aspect of Wolf"), { targets: [ref(theirs)] });
    // Two of Alice's Forests went to cast it: all three still count.
    expect(pt(game, theirs)).toEqual({ power: 3, toughness: 4 });
  });
});
