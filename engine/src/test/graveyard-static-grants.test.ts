/**
 * Statics that work only from their owner's graveyard (rule 113.6b), "you"
 * the card's owner, and never from the battlefield: one granting an
 * activated ability — Riftstone Portal's "as long as this card is in your
 * graveyard, lands you control have '{T}: Add {G} or {W}.'", read by the
 * grant scans from every graveyard — and an enters replacement — Dearly
 * Departed's "each Human creature you control enters with an additional
 * +1/+1 counter on it" (rule 614.12).
 */

import { describe, expect, it } from "vitest";

import { hasActivatedAbilityOf } from "../characteristics.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { B, cast, counters, lands, spawn, table, toGraveyard, toHand, zone } from "./harness.js";

const hasMana = (game: Game, id: ObjectId): boolean =>
  hasActivatedAbilityOf(game.state, game.registry, game.state.objects[id], { mana: true });

describe("Riftstone Portal", () => {
  it("in its owner's graveyard, gives that player's lands the mana abilities, and no one else's", () => {
    const { game } = table();
    const ours = spawn(game, "Maze of Ith");
    const theirs = spawn(game, "Maze of Ith", B);
    expect(hasMana(game, ours)).toBe(false);
    toGraveyard(game, "Riftstone Portal");
    expect(hasMana(game, ours)).toBe(true);
    expect(hasMana(game, theirs)).toBe(false);
  });

  it("the lands tap for green or white with it there", () => {
    const { game } = table();
    lands(game, "Wastes", 2);
    toGraveyard(game, "Riftstone Portal");
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears);
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("without it there, they don't", () => {
    const { game } = table();
    lands(game, "Wastes", 2);
    expect(() => cast(game, toHand(game, "Grizzly Bears"))).toThrow(/mana|pay|afford/i);
  });

  it("on the battlefield it grants nothing: it taps for {C} alone", () => {
    const { game } = table();
    const maze = spawn(game, "Maze of Ith");
    const portal = spawn(game, "Riftstone Portal");
    expect(hasMana(game, maze)).toBe(false);
    lands(game, "Wastes", 1);
    expect(() => cast(game, toHand(game, "Grizzly Bears"))).toThrow(/mana|pay|afford/i);
    expect(zone(game, portal)).toBe("battlefield");
  });
});

describe("Dearly Departed", () => {
  it("in its owner's graveyard, each Human that player casts enters with a counter, one per card there", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    toGraveyard(game, "Dearly Departed");
    const first = toHand(game, "Elite Vanguard");
    cast(game, first);
    expect(counters(game, first)).toBe(1);
    toGraveyard(game, "Dearly Departed");
    const second = toHand(game, "Elite Vanguard");
    cast(game, second);
    expect(counters(game, second)).toBe(2);
  });

  it("not a non-Human, and not another player's Human", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    toGraveyard(game, "Dearly Departed", B);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears);
    expect(counters(game, bears)).toBe(0);
    toGraveyard(game, "Dearly Departed");
    const more = toHand(game, "Grizzly Bears");
    lands(game, "Forest", 2);
    cast(game, more);
    expect(counters(game, more)).toBe(0);
  });

  it("on the battlefield it does nothing", () => {
    const { game } = table();
    spawn(game, "Dearly Departed");
    lands(game, "Plains", 1);
    const human = toHand(game, "Elite Vanguard");
    cast(game, human);
    expect(counters(game, human)).toBe(0);
  });
});
