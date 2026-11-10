/**
 * Celestial Mantle, on existing machinery: Beacon of Immortality's doubling
 * (rule 701.10d), for the damaging creature's controller as the ability
 * resolves rather than the Aura's.
 */
import { describe, expect, it } from "vitest";

import { A, B, attack, cast, lands, life, pt, ref, spawn, table, toHand } from "./harness.js";

describe("Celestial Mantle", () => {
  it("+3/+3, and combat damage to a player doubles the creature's controller's life total", () => {
    const { game, a } = table();
    lands(game, "Plains", 6);
    const bears = spawn(game, "Grizzly Bears");
    const mantle = toHand(game, "Celestial Mantle");
    cast(game, mantle, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 5 });
    attack(game, a, [bears]);
    expect(life(game, B)).toBe(15);
    expect(life(game, A)).toBe(40);
  });

  it("doubles the creature's controller's life, not the Aura's controller's", () => {
    const { game, b } = table();
    lands(game, "Plains", 6);
    const bears = spawn(game, "Grizzly Bears", B);
    const mantle = toHand(game, "Celestial Mantle");
    cast(game, mantle, { targets: [ref(bears)] });
    attack(game, b, [bears], A);
    expect(life(game, A)).toBe(15);
    expect(life(game, B)).toBe(40);
  });

  it("a negative life total is doubled too: −4 becomes −8 (the ruling)", () => {
    const { game, a } = table();
    lands(game, "Plains", 6);
    spawn(game, "Platinum Angel");
    const bears = spawn(game, "Grizzly Bears");
    const mantle = toHand(game, "Celestial Mantle");
    cast(game, mantle, { targets: [ref(bears)] });
    game.state.players[A].life = -4;
    attack(game, a, [bears]);
    expect(life(game, B)).toBe(15);
    expect(life(game, A)).toBe(-8);
  });

  it("no trigger when the damage goes to a blocker", () => {
    const { game, a, b } = table();
    lands(game, "Plains", 6);
    const bears = spawn(game, "Grizzly Bears");
    const wall = spawn(game, "Wall of Stone", B);
    const mantle = toHand(game, "Celestial Mantle");
    cast(game, mantle, { targets: [ref(bears)] });
    b.declareBlockersFn = () => [{ blocker: wall, attacker: bears }];
    attack(game, a, [bears]);
    expect(life(game, B)).toBe(20);
    expect(life(game, A)).toBe(20);
  });
});
