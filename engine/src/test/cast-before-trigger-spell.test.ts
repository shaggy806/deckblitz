/**
 * "The number of spells cast before that spell this turn": the `castThisTurn`
 * amount's `before: "trigger-spell"`, over every player's casts in the order
 * they happened (`CastSpellRecord.seq`). Sentinel Tower's rulings: the first
 * instant or sorcery deals 1, the second 2; every earlier one counts, still on
 * the stack or countered; and a spell cast in response doesn't change the
 * count for the spell before it.
 */
import { describe, expect, it } from "vitest";

import { A, B, cast, lands, life, nextTurn, pickTargets, ref, spawn, table, toHand } from "./harness.js";

describe("spells cast before the triggering spell this turn", () => {
  it("Sentinel Tower deals 1, then 2, for the first and second instant or sorcery", () => {
    const { game, a } = table();
    spawn(game, "Sentinel Tower");
    lands(game, "Mountain", 2);
    pickTargets(a, B);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(20 - 1 - 2);
    pickTargets(a, B);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(17 - 2 - 2);
  });

  it("a spell cast in response doesn't raise the count for the one before it", () => {
    const { game, a } = table();
    spawn(game, "Sentinel Tower");
    lands(game, "Mountain", 1);
    lands(game, "Mountain", 1, B);
    pickTargets(a, B);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)], settle: false });
    game.advanceUntil((s) => s.priority.holder === B);
    // Bob's Bolt in response: the Tower's second trigger counts the Shock (2);
    // its first still counts nothing before the Shock (1).
    cast(game, toHand(game, "Lightning Bolt", B), { player: B, targets: [ref(A)] });
    expect(life(game, A)).toBe(17);
    expect(life(game, B)).toBe(20 - 2 - 1 - 2);
  });

  it("not during another player's turn", () => {
    const { game, a } = table();
    spawn(game, "Sentinel Tower");
    lands(game, "Mountain", 1, B);
    nextTurn(game);
    pickTargets(a, B);
    cast(game, toHand(game, "Shock", B), { player: B, targets: [ref(A)] });
    expect(life(game, A)).toBe(18);
    expect(life(game, B)).toBe(20);
  });
});
