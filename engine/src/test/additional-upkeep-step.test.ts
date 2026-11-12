/**
 * The `additional-upkeep-step` effect and the `step-begins` trigger's
 * `firstTimeEachTurn` for upkeeps — Paradox Haze: "At the beginning of
 * enchanted player's first upkeep each turn, that player gets an additional
 * upkeep step after this step."
 */
import { describe, expect, it } from "vitest";

import { A, B, cast, lands, life, ref, spawn, table, toHand, toStep } from "./harness.js";

describe("Paradox Haze", () => {
  it("one more upkeep for the enchanted player, where 'your upkeep' triggers again", () => {
    const { game } = table();
    lands(game, "Island", 3);
    spawn(game, "Phyrexian Arena");
    cast(game, toHand(game, "Paradox Haze"), { targets: [ref(A)] });
    toStep(game, "draw", A);
    // Two upkeeps, two Arena triggers — and the added upkeep isn't the first.
    expect(life(game, A)).toBe(18);
  });

  it("two Hazes, two added upkeeps", () => {
    const { game } = table();
    lands(game, "Island", 6);
    spawn(game, "Phyrexian Arena");
    cast(game, toHand(game, "Paradox Haze"), { targets: [ref(A)] });
    cast(game, toHand(game, "Paradox Haze"), { targets: [ref(A)] });
    toStep(game, "draw", A);
    expect(life(game, A)).toBe(17);
  });

  it("on another player, nothing on your turn", () => {
    const { game } = table();
    lands(game, "Island", 3);
    spawn(game, "Phyrexian Arena");
    cast(game, toHand(game, "Paradox Haze"), { targets: [ref(B)] });
    toStep(game, "draw", A);
    expect(life(game, A)).toBe(19);
  });
});
