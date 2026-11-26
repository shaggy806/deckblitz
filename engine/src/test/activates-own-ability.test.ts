/**
 * The `activates-ability` trigger's `ownAbility`: "whenever you activate this
 * creature's outlast ability" (Herald of Anafenza) — one of this object's own
 * printed abilities, not another permanent's of the same text.
 */

import { describe, expect, it } from "vitest";

import { A, activate, counters, lands, spawn, table, tokensNamed } from "./harness.js";

describe("activates-ability ownAbility", () => {
  it("Herald of Anafenza: its outlast puts a counter on it and makes a Warrior", () => {
    const { game } = table({ deck: "Plains" });
    const herald = spawn(game, "Herald of Anafenza");
    lands(game, "Plains", 3, A);
    activate(game, herald, 0);
    expect(counters(game, herald)).toBe(1);
    expect(tokensNamed(game, "Warrior Token", A)).toBe(1);
  });

  it("another Herald's outlast makes only that Herald's Warrior", () => {
    const { game } = table({ deck: "Plains" });
    spawn(game, "Herald of Anafenza");
    const other = spawn(game, "Herald of Anafenza");
    lands(game, "Plains", 3, A);
    activate(game, other, 0);
    expect(counters(game, other)).toBe(1);
    expect(tokensNamed(game, "Warrior Token", A)).toBe(1);
  });

  it("another creature's outlast doesn't trigger it", () => {
    const { game } = table({ deck: "Plains" });
    spawn(game, "Herald of Anafenza");
    const falconer = spawn(game, "Abzan Falconer");
    lands(game, "Plains", 1, A);
    activate(game, falconer, 0);
    expect(counters(game, falconer)).toBe(1);
    expect(tokensNamed(game, "Warrior Token", A)).toBe(0);
  });
});
