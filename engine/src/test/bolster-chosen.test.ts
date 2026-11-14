/**
 * "Bolster 2. **The chosen creature** gains trample until end of turn. When
 * **that creature** deals combat damage to a player this turn, convert
 * Optimus Prime." — bolster chooses (rule 701.39a), and the creature it chose
 * is `thisWay: "chosen"` for the rest of the resolution, read by a grant and
 * by a delayed trigger's `watching` (Optimus Prime, Autobot Leader).
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, attack, counters, destroy, grant, keywords, pickPermanents, settle, spawn, table, toStep, zone } from "./harness.js";

const HERO = "Optimus Prime, Hero";

const face = (game: Game, id: ObjectId): number => game.state.objects[id].face ?? 0;

/** Optimus on the battlefield converted: Autobot Leader. */
function leader(game: Game): ObjectId {
  const optimus = spawn(game, HERO);
  game.debugApplyEffect(A, { kind: "transform", target: "source" }, [], { source: optimus });
  settle(game);
  expect(face(game, optimus)).toBe(1);
  return optimus;
}

describe("Optimus Prime, Autobot Leader", () => {
  it("bolsters the weakest, gives it trample, and converts when it deals combat damage to a player", () => {
    const { game, a } = table();
    const optimus = leader(game);
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [bears]);
    expect(counters(game, bears)).toBe(2);
    expect(keywords(game, bears).has("trample")).toBe(true);
    expect(game.state.players[B].life).toBe(16);
    expect(face(game, optimus)).toBe(0);
  });

  it("doesn't convert when another creature deals the damage", () => {
    const { game, a } = table();
    const optimus = leader(game);
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [optimus]);
    expect(counters(game, bears)).toBe(2);
    expect(game.state.players[B].life).toBe(14);
    expect(face(game, optimus)).toBe(1);
  });

  it("watches the creature chosen among tied ones", () => {
    const { game, a } = table();
    const optimus = leader(game);
    const first = spawn(game, "Grizzly Bears");
    const second = spawn(game, "Grizzly Bears");
    const seen = pickPermanents(a, second);
    attack(game, a, [first]);
    expect([...seen.offered].sort()).toEqual([first, second].sort());
    expect(counters(game, second)).toBe(2);
    expect(keywords(game, second).has("trample")).toBe(true);
    expect(keywords(game, first).has("trample")).toBe(false);
    expect(face(game, optimus)).toBe(1);
  });

  it("converts once however many times that creature deals combat damage", () => {
    const { game, a } = table();
    const optimus = leader(game);
    const bears = spawn(game, "Grizzly Bears");
    grant(game, bears, "double-strike");
    attack(game, a, [bears]);
    expect(game.state.players[B].life).toBe(12);
    expect(face(game, optimus)).toBe(0);
  });
});

describe("Optimus Prime, Hero", () => {
  it("bolsters 1 at the beginning of each end step", () => {
    const { game } = table();
    spawn(game, HERO);
    const bears = spawn(game, "Grizzly Bears");
    toStep(game, "end");
    settle(game);
    expect(counters(game, bears)).toBe(1);
  });

  it("returns to the battlefield converted when it dies", () => {
    const { game } = table();
    const optimus = spawn(game, HERO);
    destroy(game, optimus);
    expect(zone(game, optimus)).toBe("battlefield");
    expect(face(game, optimus)).toBe(1);
  });
});
