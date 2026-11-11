/**
 * Dice rolled as a permanent enters (rules 614.1c, 706): the
 * enters-battlefield replacement's `rollAsEnters` and its counters'
 * `"rolled-as-enters"` — Neverwinter Hydra's "As this creature enters, roll X
 * d6. It enters with a number of +1/+1 counters on it equal to the total of
 * those results." The rolls come from the seeded stream, so each test reads
 * the `dice-rolled` event. Also: what a permanent does as it enters happens
 * once when it's cast (Thief of Blood), not at the look before it moves.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";

import { A, B, cast, counters, lands, spawn, table, toHand, tokensNamed } from "./harness.js";

const rolls = (game: Game) => game.state.eventLog.flatMap((e) => (e.type === "dice-rolled" ? [e] : []));

describe("roll as it enters", () => {
  it("Neverwinter Hydra: X d6, rolled once, and that many +1/+1 counters", () => {
    for (const seed of [1, 2, 3]) {
      const { game } = table({ seed });
      lands(game, "Forest", 8);
      const hydra = toHand(game, "Neverwinter Hydra");
      cast(game, hydra, { x: 3 });
      const rolled = rolls(game);
      expect(rolled).toHaveLength(1);
      expect(rolled[0].sides).toBe(6);
      expect(rolled[0].player).toBe(A);
      expect(rolled[0].results).toHaveLength(3);
      const total = rolled[0].results.reduce((n, r) => n + r, 0);
      expect(total).toBeGreaterThanOrEqual(3);
      expect(game.state.objects[hydra].zone).toBe("battlefield");
      expect(counters(game, hydra)).toBe(total);
    }
  });

  it("with X of 0 nothing is rolled, and the 0/0 dies", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const hydra = toHand(game, "Neverwinter Hydra");
    cast(game, hydra, { x: 0 });
    expect(rolls(game)).toHaveLength(0);
    expect(game.state.objects[hydra].zone).toBe("graveyard");
  });

  it("is a roll like any other: an extra die with the lowest ignored, and a roll trigger", () => {
    const { game } = table({ seed: 5 });
    lands(game, "Forest", 6);
    spawn(game, "Pixie Guide");
    spawn(game, "Feywild Trickster");
    const hydra = toHand(game, "Neverwinter Hydra");
    cast(game, hydra, { x: 2 });
    const rolled = rolls(game);
    expect(rolled).toHaveLength(1);
    expect(rolled[0].results).toHaveLength(2);
    expect(rolled[0].ignored).toHaveLength(1);
    expect(counters(game, hydra)).toBe(rolled[0].results.reduce((n, r) => n + r, 0));
    expect(tokensNamed(game, "Faerie Dragon Token", A)).toBe(1);
  });

  it("Thief of Blood, cast: the counters come off as it enters and it gets one for each", () => {
    const { game } = table();
    lands(game, "Swamp", 6);
    const bears = spawn(game, "Grizzly Bears", B);
    game.state.objects[bears].counters = { "+1/+1": 2, stun: 1 };
    const thief = toHand(game, "Thief of Blood");
    cast(game, thief);
    expect(game.state.objects[bears].counters).toEqual({});
    expect(counters(game, thief)).toBe(3);
  });
});
