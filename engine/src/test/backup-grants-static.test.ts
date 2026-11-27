/**
 * Backup granting a static ability printed below it (rule 702.165a): "this
 * creature" is then the creature backed up, until end of turn — Streetwise
 * Negotiator's combat damage by toughness, Chomping Kavu's "can't be blocked
 * by creatures with power 2 or less".
 */
import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";
import { A, B, type BlockOffer, attack, blockOffer, enter, life, nextTurn, pickTargets, spawn, table } from "./harness.js";

const canBlock = (offer: BlockOffer, blocker: ObjectId): readonly string[] =>
  offer.eligible.find((e) => e.blocker === blocker)?.canBlock ?? [];

describe("Streetwise Negotiator", () => {
  it("the creature it backs up assigns combat damage by its toughness this turn", () => {
    const { game, a } = table();
    const turtle = spawn(game, "Horned Turtle", A);
    pickTargets(a, turtle);
    enter(game, "Streetwise Negotiator");
    // 1/4 with the counter is 2/5: it deals 5.
    attack(game, a, [turtle]);
    expect(life(game, B)).toBe(15);
  });

  it("…and only this turn", () => {
    const { game, a } = table();
    const turtle = spawn(game, "Horned Turtle", A);
    pickTargets(a, turtle);
    enter(game, "Streetwise Negotiator");
    attack(game, a, [turtle]);
    expect(life(game, B)).toBe(15);
    nextTurn(game);
    nextTurn(game);
    attack(game, a, [turtle]);
    // Its own power again: 2.
    expect(life(game, B)).toBe(13);
  });
});

describe("Chomping Kavu", () => {
  it("the creature it backs up can't be blocked by power 2 or less this turn", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", A);
    const goblin = spawn(game, "Raging Goblin", B);
    const giant = spawn(game, "Hill Giant", B);
    pickTargets(a, bears);
    enter(game, "Chomping Kavu");
    const offer = blockOffer(game, a, [bears]);
    expect(canBlock(offer, goblin)).toEqual([]);
    expect(canBlock(offer, giant)).toEqual([bears]);
  });

  it("an unbacked creature can still be blocked by a small one", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", A);
    const goblin = spawn(game, "Raging Goblin", B);
    const kavu = spawn(game, "Chomping Kavu", A);
    const offer = blockOffer(game, a, [bears, kavu]);
    expect(canBlock(offer, goblin)).toEqual([bears]);
  });
});
