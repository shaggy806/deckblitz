/**
 * "Any opponent may …. If they do, …" — one result however many do: an
 * `each-player-may` of the opponents, then a `conditional` on what was done
 * `this-way` (as Desecration Demon's sacrifice). Reservoir Kraken: "any
 * opponent may tap an untapped creature they control. If they do, tap this
 * creature and create a 1/1 blue Fish" — each opponent in turn order may tap
 * one, even after an earlier one has, and its controller gets one Fish a
 * combat however many tap (its rulings).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import { A, B, C, pickModes, pickPermanents, settle, spawn, table, toStep, tokensNamed } from "./harness.js";

const FISH = "Fish Token (Expendable Lackey)";
const tapped = (game: Game, id: ObjectId): boolean => game.state.objects[id].tapped === true;

describe("Reservoir Kraken", () => {
  it("both opponents tap a creature: one Fish, and the Kraken taps", () => {
    const { game, b, c } = table({ players: 3 });
    const kraken = spawn(game, "Reservoir Kraken");
    const bears = spawn(game, "Grizzly Bears", B);
    const elves = spawn(game, "Llanowar Elves", C);
    pickModes(b, 0);
    pickPermanents(b, bears);
    pickModes(c, 0);
    pickPermanents(c, elves);
    toStep(game, "begin-combat");
    settle(game);
    expect(tapped(game, bears)).toBe(true);
    expect(tapped(game, elves)).toBe(true);
    expect(tapped(game, kraken)).toBe(true);
    expect(tokensNamed(game, FISH, A)).toBe(1);
  });

  it("one opponent taps one: still the Fish", () => {
    const { game, b, c } = table({ players: 3 });
    const kraken = spawn(game, "Reservoir Kraken");
    const bears = spawn(game, "Grizzly Bears", B);
    const elves = spawn(game, "Llanowar Elves", C);
    pickModes(b);
    pickModes(c, 0);
    pickPermanents(c, elves);
    toStep(game, "begin-combat");
    settle(game);
    expect(tapped(game, bears)).toBe(false);
    expect(tapped(game, elves)).toBe(true);
    expect(tapped(game, kraken)).toBe(true);
    expect(tokensNamed(game, FISH, A)).toBe(1);
  });

  it("nobody taps: no Fish, and the Kraken stays untapped to attack", () => {
    const { game, b, c } = table({ players: 3 });
    const kraken = spawn(game, "Reservoir Kraken");
    spawn(game, "Grizzly Bears", B);
    spawn(game, "Llanowar Elves", C);
    pickModes(b);
    pickModes(c);
    toStep(game, "begin-combat");
    settle(game);
    expect(tapped(game, kraken)).toBe(false);
    expect(tokensNamed(game, FISH)).toBe(0);
  });

  it("a tapped Kraken doesn't trigger (the intervening if)", () => {
    const { game, b } = table();
    const kraken = spawn(game, "Reservoir Kraken", A, { tapped: true });
    const bears = spawn(game, "Grizzly Bears", B);
    pickModes(b, 0);
    pickPermanents(b, bears);
    toStep(game, "begin-combat");
    settle(game);
    expect(tapped(game, bears)).toBe(false);
    expect(tapped(game, kraken)).toBe(true);
    expect(tokensNamed(game, FISH)).toBe(0);
  });

  it("each combat, on an opponent's turn too", () => {
    const { game, b } = table({ step: "postcombat-main" });
    const kraken = spawn(game, "Reservoir Kraken");
    const bears = spawn(game, "Grizzly Bears", B);
    pickModes(b, 0);
    pickPermanents(b, bears);
    toStep(game, "begin-combat", B);
    settle(game);
    expect(tapped(game, kraken)).toBe(true);
    expect(tokensNamed(game, FISH, A)).toBe(1);
  });
});
