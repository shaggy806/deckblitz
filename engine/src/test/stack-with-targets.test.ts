/**
 * The stack target's `withTargets` — "target spell or ability with one or
 * more targets" — Wyll's Reversal.
 */
import { describe, expect, it } from "vitest";

import { B, cast, lands, life, ref, spawn, table, toHand } from "./harness.js";

describe("Wyll's Reversal", () => {
  it("can't choose a spell with no targets", () => {
    const { game } = table();
    lands(game, "Island", 3);
    lands(game, "Mountain", 3);
    const divination = toHand(game, "Divination");
    cast(game, divination, { settle: false });
    expect(() => cast(game, toHand(game, "Wyll's Reversal"), { targets: [ref(divination)] })).toThrow();
  });

  it("15+: the spell is copied, its targets kept", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    // Power 15: any d20 roll comes to 16 or more.
    spawn(game, "Worldspine Wurm");
    const bolt = toHand(game, "Lightning Bolt");
    cast(game, bolt, { targets: [ref(B)], settle: false });
    cast(game, toHand(game, "Wyll's Reversal"), { targets: [ref(bolt)] });
    expect(life(game, B)).toBe(20 - 3 - 3);
  });
});
