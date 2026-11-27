import { describe, expect, it } from "vitest";

import { B, cast, lands, life, settle, table, toHand } from "./harness.js";

/**
 * A rules audit (2026-11-26): a copy of a spell copies the choices made for
 * it as it was cast, X included (rule 707.10).
 */
describe("a copied X spell, audited", () => {
  it("Reverberate on a Blaze with X = 3: the copy deals 3 too", () => {
    const { game, a } = table();
    lands(game, "Mountain", 6);
    const before = life(game, B);
    cast(game, toHand(game, "Blaze"), { x: 3, targets: [{ kind: "player", player: B }], settle: false });
    const blaze = game.state.zones.shared.stack[game.state.zones.shared.stack.length - 1];
    a.chooseTargetsFn = () => [{ kind: "player", player: B }];
    cast(game, toHand(game, "Reverberate"), { targets: [{ kind: "object", object: blaze }], settle: false });
    settle(game);
    expect(life(game, B)).toBe(before - 6);
  });
});
