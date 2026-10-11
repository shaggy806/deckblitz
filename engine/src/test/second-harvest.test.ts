/**
 * Second Harvest — "For each token you control, create a token that's a copy
 * of that permanent": the triage record's need (a token copy of each matching
 * permanent) was built for Redoubled Stormsinger; authored 2026-10-11.
 */
import { describe, expect, it } from "vitest";

import { A, B, cast, lands, table, toHand, tokensNamed } from "./harness.js";

describe("Second Harvest", () => {
  it("copies each token you control once — a stack once per token — and not the copies it makes", () => {
    const { game } = table();
    game.debugApplyEffect(A, { kind: "create-token", token: "Goblin Token", count: 2 });
    game.debugApplyEffect(A, { kind: "create-token", token: "Treasure Token", count: 1 });
    game.debugApplyEffect(B, { kind: "create-token", token: "Goblin Token", count: 1 });
    lands(game, "Forest", 4);
    cast(game, toHand(game, "Second Harvest"));
    expect(tokensNamed(game, "Goblin Token", A)).toBe(4);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(2);
    expect(tokensNamed(game, "Goblin Token", B)).toBe(1);
  });
});
