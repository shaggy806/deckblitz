/**
 * `add-counter-all`'s `"own-power-over-base-power"` — Sovereign Okinec Ahau:
 * "for each creature you control with power greater than that creature's
 * base power, put a number of +1/+1 counters on that creature equal to the
 * difference."
 */
import { describe, expect, it } from "vitest";

import { invalidateComputedCache } from "../characteristics.js";
import { attack, B, counters, spawn, table } from "./harness.js";

describe("Sovereign Okinec Ahau", () => {
  it("gives each creature counters equal to its power over its base power", () => {
    const seats = table();
    const { game } = seats;
    const ahau = spawn(game, "Sovereign Okinec Ahau");
    const bears = spawn(game, "Grizzly Bears");
    game.state.objects[bears].counters = { "+1/+1": 2 };
    const anthem = spawn(game, "Glorious Anthem");
    const plain = spawn(game, "Grizzly Bears", B);
    game.state.objects[plain].counters = { "+1/+1": 1 };
    invalidateComputedCache();
    attack(game, seats.a, [ahau]);
    // Bears: 2/2 + two counters + the anthem = 5 power, base 2: three more.
    expect(counters(game, bears)).toBe(5);
    // Ahau: 3 base + the anthem = 4: one.
    expect(counters(game, ahau)).toBe(1);
    // Not yours.
    expect(counters(game, plain)).toBe(1);
    expect(anthem).toBeDefined();
  });

  it("puts none on a creature at or below its base power", () => {
    const seats = table();
    const { game } = seats;
    const ahau = spawn(game, "Sovereign Okinec Ahau");
    const bears = spawn(game, "Grizzly Bears");
    attack(game, seats.a, [ahau]);
    expect(counters(game, bears)).toBe(0);
    expect(counters(game, ahau)).toBe(0);
  });
});
