/**
 * "Tap [the Equipment that grants this]" as part of a granted ability's cost
 * (Fishing Pole's "Equipped creature has '{1}, {T}, Tap Fishing Pole: Put a
 * bait counter on Fishing Pole'"): the cost act `{ kind: "tap", target:
 * "granter" }`, the granting permanent alone (rule 201.5a, the ruling),
 * payable only while it's untapped (rules 118.3, 701.26a). And its
 * "whenever equipped creature becomes untapped, remove a bait counter … If
 * you do, create a Fish".
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, activate, counters, lands, ref, settle, spawn, table, tokensNamed } from "./harness.js";

const equipped = (game: Game, pole: ObjectId, creature: ObjectId): void => {
  lands(game, "Plains", 2);
  activate(game, pole, 0, { targets: [ref(creature)] });
  expect(game.state.objects[pole].attachedTo).toBe(creature);
};

const untap = (game: Game, id: ObjectId): void => {
  game.debugApplyEffect(A, { kind: "untap", target: 0 }, [ref(id)]);
  settle(game);
};

const tap = (game: Game, id: ObjectId): void => {
  game.debugApplyEffect(A, { kind: "tap", target: 0 }, [ref(id)]);
  settle(game);
};

const can = (game: Game, creature: ObjectId): string | null =>
  game.canDispatch({ type: "activate-ability", player: A, source: creature, abilityIndex: 0, targets: [] });

describe("Fishing Pole", () => {
  it("taps the creature and the Pole, and baits the Pole", () => {
    const { game } = table();
    const pole = spawn(game, "Fishing Pole", A);
    const bears = spawn(game, "Grizzly Bears", A);
    equipped(game, pole, bears);
    lands(game, "Island", 1);
    activate(game, bears, 0);
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(game.state.objects[pole].tapped).toBe(true);
    expect(counters(game, pole, "bait")).toBe(1);
  });

  it("can't be activated while the Pole is tapped (rule 118.3)", () => {
    const { game } = table();
    const pole = spawn(game, "Fishing Pole", A);
    const bears = spawn(game, "Grizzly Bears", A);
    equipped(game, pole, bears);
    lands(game, "Island", 1);
    expect(can(game, bears)).toBeNull();
    tap(game, pole);
    expect(can(game, bears)).not.toBeNull();
  });

  it("when the creature untaps, trades a bait counter for a Fish, and only while there is one", () => {
    const { game } = table();
    const pole = spawn(game, "Fishing Pole", A);
    const bears = spawn(game, "Grizzly Bears", A);
    equipped(game, pole, bears);
    lands(game, "Island", 1);
    activate(game, bears, 0);
    untap(game, bears);
    expect(counters(game, pole, "bait")).toBe(0);
    expect(tokensNamed(game, "Fish Token", A)).toBe(1);
    // The Pole stays tapped: no bait to be had again yet.
    expect(can(game, bears)).not.toBeNull();
    tap(game, bears);
    untap(game, bears);
    expect(tokensNamed(game, "Fish Token", A)).toBe(1);
  });

  it("is the Pole that grants it, not another of the same name (the ruling)", () => {
    const { game } = table();
    const other = spawn(game, "Fishing Pole", A);
    const pole = spawn(game, "Fishing Pole", A);
    const bears = spawn(game, "Grizzly Bears", A);
    equipped(game, pole, bears);
    lands(game, "Island", 1);
    activate(game, bears, 0);
    expect(game.state.objects[pole].tapped).toBe(true);
    expect(counters(game, pole, "bait")).toBe(1);
    expect(game.state.objects[other].tapped).toBe(false);
    expect(counters(game, other, "bait")).toBe(0);
  });
});
