/**
 * A `choose-permanents` with `keepTargets` reads the resolution's own target,
 * one slot on, as it last existed once it has left (rule 608.2h): Dismantle's
 * "if that artifact had counters on it, put that many … on an artifact you
 * control", after it's destroyed. The kind of counter is chosen as it
 * resolves (the ruling), a resolution-time `modal`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { B, cast, lands, pickModes, pickPermanents, ref, spawn, table, toHand, zone } from "./harness.js";

const counters = (game: Game, id: ObjectId, kind: string): number => game.state.objects[id].counters[kind] ?? 0;

describe("Dismantle: that many counters, as the artifact last existed", () => {
  const board = () => {
    const t = table();
    const { game } = t;
    const ingot = spawn(game, "Darksteel Ingot", B);
    const ring = spawn(game, "Sol Ring", B);
    const stone = spawn(game, "Mind Stone");
    const citadel = spawn(game, "Darksteel Citadel");
    lands(game, "Mountain", 3);
    return { ...t, ingot, ring, stone, citadel };
  };

  it("a destroyed artifact's counters, every kind, as +1/+1 counters on the artifact chosen", () => {
    const { game, a, ring, stone, citadel } = board();
    game.state.objects[ring].counters = { charge: 2, fuse: 1 };
    const offer = pickPermanents(a, stone);
    pickModes(a, 0);
    cast(game, toHand(game, "Dismantle"), { targets: [ref(ring)] });
    expect(zone(game, ring)).toBe("graveyard");
    expect(offer.offered).toEqual(expect.arrayContaining([stone, citadel]));
    expect(counters(game, stone, "+1/+1")).toBe(3);
    expect(counters(game, citadel, "+1/+1")).toBe(0);
  });

  it("charge counters, if chosen", () => {
    const { game, a, ring, stone } = board();
    game.state.objects[ring].counters = { charge: 2 };
    pickPermanents(a, stone);
    pickModes(a, 1);
    cast(game, toHand(game, "Dismantle"), { targets: [ref(ring)] });
    expect(counters(game, stone, "charge")).toBe(2);
    expect(counters(game, stone, "+1/+1")).toBe(0);
  });

  it("an indestructible artifact left on the battlefield still counts", () => {
    const { game, a, ingot, stone } = board();
    game.state.objects[ingot].counters = { charge: 1 };
    pickPermanents(a, stone);
    pickModes(a, 0);
    cast(game, toHand(game, "Dismantle"), { targets: [ref(ingot)] });
    expect(zone(game, ingot)).toBe("battlefield");
    expect(counters(game, stone, "+1/+1")).toBe(1);
  });

  it("no counters: nothing is chosen", () => {
    const { game, a, ring, stone } = board();
    let asked = false;
    a.choosePermanentsFn = () => {
      asked = true;
      return [stone];
    };
    cast(game, toHand(game, "Dismantle"), { targets: [ref(ring)] });
    expect(zone(game, ring)).toBe("graveyard");
    expect(asked).toBe(false);
    expect(counters(game, stone, "+1/+1")).toBe(0);
  });
});
