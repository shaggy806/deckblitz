/**
 * "Casualty X" (rule 702.153a — Ob Nixilis, the Adversary): X is announced as
 * the spell is cast, with whether to pay (the ruling), up to the greatest
 * power among the caster's creatures; the creature, of power X or greater, is
 * asked as any casualty's is; the copy isn't legendary and has starting
 * loyalty X (`CasualtySpec`'s `copyExcept`, `copyLoyaltyX`).
 */
import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, cast, counters, hand, lands, life, loyalty, named, ref, spawn, supertypes, table, toHand, zone } from "./harness.js";

type CastOffer = Extract<LegalAction, { kind: "cast-spell" }>;
const castOffers = (game: Game, card: ObjectId): CastOffer[] =>
  game.legalActions(A).filter((x): x is CastOffer => x.kind === "cast-spell" && x.card === card);
const NAME = "Ob Nixilis, the Adversary";

describe("Ob Nixilis, the Adversary — casualty X", () => {
  it("X up to the greatest power; a creature of power X or more pays; the copy is a nonlegendary token with X loyalty", () => {
    const { game, a } = table();
    lands(game, "Swamp", 2);
    lands(game, "Mountain", 1);
    const giant = spawn(game, "Hill Giant");
    const bears = spawn(game, "Grizzly Bears");
    const ob = toHand(game, NAME);
    expect(castOffers(game, ob)[0]?.xCost).toEqual({ maxX: 3, casualty: true });
    let offered: readonly ObjectId[] = [];
    a.choosePermanentsFn = (_view, eligible, min, max) => {
      offered = eligible;
      expect([min, max]).toEqual([0, 1]);
      return [giant];
    };
    cast(game, ob, { x: 3 });
    // Only the Giant has power 3 or more.
    expect(offered).toEqual([giant]);
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
    const obs = named(game, NAME, A);
    expect(obs).toHaveLength(2);
    const copy = obs.find((id) => game.state.objects[id].isToken === true)!;
    const original = obs.find((id) => id !== copy)!;
    expect(supertypes(game, copy)).not.toContain("legendary");
    expect(supertypes(game, original)).toContain("legendary");
    expect(counters(game, copy, "loyalty")).toBe(3);
    expect(counters(game, original, "loyalty")).toBe(3);
  });

  it("a smaller X is the caster's to choose: the copy's loyalty is that X", () => {
    const { game, a } = table();
    lands(game, "Swamp", 2);
    lands(game, "Mountain", 1);
    const giant = spawn(game, "Hill Giant");
    const ob = toHand(game, NAME);
    a.choosePermanentsFn = () => [giant];
    cast(game, ob, { x: 1 });
    const copy = named(game, NAME, A).find((id) => game.state.objects[id].isToken === true)!;
    expect(counters(game, copy, "loyalty")).toBe(1);
  });

  it("declined: nothing sacrificed, no copy", () => {
    const { game, a } = table();
    lands(game, "Swamp", 2);
    lands(game, "Mountain", 1);
    const giant = spawn(game, "Hill Giant");
    const ob = toHand(game, NAME);
    a.choosePermanentsFn = () => [];
    cast(game, ob, { x: 3 });
    expect(zone(game, giant)).toBe("battlefield");
    expect(named(game, NAME, A)).toHaveLength(1);
  });

  it("X past every creature's power: nothing to pay with, nothing asked", () => {
    const { game, a } = table();
    lands(game, "Swamp", 2);
    lands(game, "Mountain", 1);
    spawn(game, "Grizzly Bears");
    const ob = toHand(game, NAME);
    let asked = false;
    a.choosePermanentsFn = () => {
      asked = true;
      return [];
    };
    cast(game, ob, { x: 3 });
    expect(asked).toBe(false);
    expect(named(game, NAME, A)).toHaveLength(1);
  });

  it("+1: each opponent loses 2 unless they discard; 2 life with a Demon or Devil", () => {
    const { game, b } = table();
    const ob = spawn(game, NAME);
    toHand(game, "Grizzly Bears", B);
    const handBefore = hand(game, B).length;
    b.chooseModesFn = () => [];
    loyalty(game, ob, 1);
    // Declined: loses 2; no Demon or Devil, no life.
    expect(life(game, B)).toBe(18);
    expect(hand(game, B)).toHaveLength(handBefore);
    expect(life(game, A)).toBe(20);
  });

  it("+1 with a Devil: discarding saves the life, and the caster gains 2", () => {
    const { game, b } = table();
    const ob = spawn(game, NAME);
    spawn(game, "Devil Token");
    toHand(game, "Grizzly Bears", B);
    const handBefore = hand(game, B).length;
    b.chooseModesFn = () => [0];
    loyalty(game, ob, 1);
    expect(life(game, B)).toBe(20);
    expect(hand(game, B)).toHaveLength(handBefore - 1);
    expect(life(game, A)).toBe(22);
  });

  it("−7: target player draws seven and loses 7", () => {
    const { game } = table();
    const ob = spawn(game, NAME);
    const before = hand(game, B).length;
    loyalty(game, ob, -7, { atLeast: 7, targets: [ref(B)] });
    expect(hand(game, B)).toHaveLength(before + 7);
    expect(life(game, B)).toBe(13);
  });
});
