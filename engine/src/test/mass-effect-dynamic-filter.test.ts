/**
 * A mass effect's filter can compare against a dynamic amount — Zar Ojanen, Scion of Efrava's
 * "each creature you control with toughness less than the number of basic land types among lands
 * you control". `bindDynamicCompares` turns every `{ amount }` operand into its value as the effect
 * applies, so the `*-all` effects (which match with no amount resolver of their own) see plain
 * numbers (this gap was logged by mistake on 2026-10-19; the test pins it).
 */
import { describe, expect, it } from "vitest";

import type { EffectSpec } from "../effects.js";

import { A, attack, counters, lands, settle, spawn, table } from "./harness.js";

const zarLike: EffectSpec = {
  kind: "add-counter-all",
  filter: {
    type: "creature",
    controlledBy: "you",
    toughness: { op: "lt", n: { amount: { basicLandTypes: "you" } } },
  },
  counter: "+1/+1",
  amount: 1,
};

describe("a mass effect's filter reads a dynamic amount", () => {
  it("counts the basic land types as the effect applies", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    lands(game, "Island", 1);
    lands(game, "Plains", 1);
    const elves = spawn(game, "Llanowar Elves"); // 1/1: toughness 1 < 3
    const bears = spawn(game, "Grizzly Bears"); // 2/2: 2 < 3
    const giant = spawn(game, "Hill Giant"); // 3/3: not less than 3
    game.debugApplyEffect(A, zarLike);
    settle(game);
    expect(counters(game, elves)).toBe(1);
    expect(counters(game, bears)).toBe(1);
    expect(counters(game, giant)).toBe(0);
  });

  it("Zar Ojanen: tapped by attacking, counters on the smaller creatures (himself not)", () => {
    const { game, a } = table();
    lands(game, "Forest", 1);
    lands(game, "Plains", 1);
    lands(game, "Island", 1);
    const zar = spawn(game, "Zar Ojanen, Scion of Efrava");
    const elves = spawn(game, "Llanowar Elves");
    attack(game, a, [zar]);
    settle(game);
    expect(counters(game, elves)).toBe(1);
    expect(counters(game, zar)).toBe(0);
  });

  it("with one basic land type, nothing has toughness less than 1", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    const elves = spawn(game, "Llanowar Elves");
    game.debugApplyEffect(A, zarLike);
    settle(game);
    expect(counters(game, elves)).toBe(0);
  });
});
