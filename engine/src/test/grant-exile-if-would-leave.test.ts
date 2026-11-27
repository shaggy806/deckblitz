/**
 * "Until end of turn, it gains 'If this creature would leave the battlefield,
 * exile it instead of putting it anywhere else' and 'When this creature is
 * put into exile, create a 4/4 …'" (Elemental Expressionist): the first is a
 * `grant-static` with `exileIfLeaves`, read by `hasExileIfLeavesAbility`
 * beside the printed and modifier kinds; the second a granted
 * leaves-the-battlefield trigger (rule 603.10a looks back at it).
 */
import { describe, expect, it } from "vitest";

import { A, B, cast, destroy, lands, nextTurn, pickTargets, settle, spawn, table, toHand, tokensNamed, zone } from "./harness.js";

const TOKEN = "4/4 Blue Red Elemental Token";

describe("Elemental Expressionist (grant-static exileIfLeaves)", () => {
  it("a spell cast makes the chosen creature exiled when it would die, and the exile makes a 4/4", () => {
    const { game, a } = table();
    spawn(game, "Elemental Expressionist", A);
    const giant = spawn(game, "Hill Giant", A);
    lands(game, "Island", 1);
    pickTargets(a, giant);
    cast(game, toHand(game, "Opt", A));
    settle(game);
    destroy(game, giant);
    settle(game);
    expect(zone(game, giant)).toBe("exile");
    expect(tokensNamed(game, TOKEN, A)).toBe(1);
  });

  it("two spells: two instances, so two tokens (one exile)", () => {
    const { game, a } = table();
    spawn(game, "Elemental Expressionist", A);
    const giant = spawn(game, "Hill Giant", A);
    lands(game, "Island", 2);
    pickTargets(a, giant);
    cast(game, toHand(game, "Opt", A));
    settle(game);
    pickTargets(a, giant);
    cast(game, toHand(game, "Opt", A));
    settle(game);
    destroy(game, giant);
    settle(game);
    expect(zone(game, giant)).toBe("exile");
    expect(tokensNamed(game, TOKEN, A)).toBe(2);
  });

  it("the grant ends with the turn", () => {
    const { game, a } = table();
    spawn(game, "Elemental Expressionist", A);
    const giant = spawn(game, "Hill Giant", A);
    lands(game, "Island", 1);
    pickTargets(a, giant);
    cast(game, toHand(game, "Opt", A));
    settle(game);
    nextTurn(game);
    destroy(game, giant, B);
    settle(game);
    expect(zone(game, giant)).toBe("graveyard");
    expect(tokensNamed(game, TOKEN, A)).toBe(0);
  });
});
