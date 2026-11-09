/**
 * A resolved prevention shield's "if damage is prevented this way, …"
 * (rule 615.5) — the `replacement-effect`'s `instead: { prevent, then }`,
 * on Ria Ivor, Bane of Bladehold.
 */

import { describe, expect, it } from "vitest";

import { A, B, attack, life, nextTurn, pickTargets, settle, spawn, table, tokensNamed } from "./harness.js";

describe("Ria Ivor: the next time target creature would deal combat damage", () => {
  it("prevents it and makes that many Mites, once", () => {
    const { game, a } = table();
    const ria = spawn(game, "Ria Ivor, Bane of Bladehold", A);
    const giant = spawn(game, "Hill Giant", A); // 3 power
    game.state.objects[giant].summoningSick = false;
    pickTargets(a, giant);
    attack(game, a, [giant], B);
    settle(game);
    expect(life(game, B)).toBe(20);
    expect(tokensNamed(game, "Phyrexian Mite Token", A)).toBe(3);

    // It was the next time: next combat it hits for real.
    nextTurn(game);
    nextTurn(game);
    pickTargets(a, ria);
    attack(game, a, [giant], B);
    expect(life(game, B)).toBe(17);
  });
});
