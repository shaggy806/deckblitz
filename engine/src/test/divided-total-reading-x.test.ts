/**
 * A divided total read from X other than as plain X (rule 601.2d, after X is
 * chosen in 601.2b): Meteor Shower's "X plus 1", Shatterskull Smashing's
 * "twice X if X is 6 or more" (its ruling: twice X is what's divided). The
 * cast offer carries the total at every X (`divide.totalByX`) and the least
 * X each number of targets needs (at least 1 each); the cast divides the
 * total at the X it chose.
 */

import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { maxXForTargets } from "../target-count.js";
import { A, B, cast, lands, life, ref, spawn, table, toHand, zone } from "./harness.js";

const castOffer = (game: Game, card: ObjectId) =>
  game.legalActions(A).find((a): a is Extract<LegalAction, { kind: "cast-spell" }> => a.kind === "cast-spell" && a.card === card);
const damage = (game: Game, id: ObjectId): number => game.state.objects[id].damageMarked;

describe("Shatterskull Smashing: X, or twice X at 6 or more, divided among up to two", () => {
  it("offers the total at each X, and the least X for each number of targets", () => {
    const { game } = table();
    spawn(game, "Grizzly Bears", B);
    spawn(game, "Hill Giant", B);
    lands(game, "Mountain", 9);
    const card = toHand(game, "Shatterskull Smashing");
    const offer = castOffer(game, card);
    expect(offer?.divide?.totalByX).toEqual([0, 1, 2, 3, 4, 5, 12, 14]);
    expect(offer?.targetCount).toMatchObject({ min: 0, max: 2 });
    expect(offer?.xCost?.minXByTargetCount).toEqual([0, 1, 2]);
    expect(offer?.xCost?.maxX).toBe(7);
  });

  it("X 3 divides 3 between two creatures", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Mountain", 5);
    cast(game, toHand(game, "Shatterskull Smashing"), { x: 3, targets: [ref(bears), ref(giant)], division: [1, 2] });
    expect(damage(game, bears)).toBe(1);
    expect(damage(game, giant)).toBe(2);
  });

  it("X 6 divides 12, not 6", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Mountain", 8);
    const card = toHand(game, "Shatterskull Smashing");
    expect(() => cast(game, card, { x: 6, targets: [ref(bears), ref(giant)], division: [3, 3] })).toThrow();
    cast(game, card, { x: 6, targets: [ref(bears), ref(giant)], division: [2, 10] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, giant)).toBe("graveyard");
  });

  it("an X a target's cost reduction pays for is offered only with that target (Spellwild Ouphe)", () => {
    // The situation fuzzer's seed 182: the offer counted on the {2} off
    // targeting Spellwild Ouphe at every count, so a cast at X 7 without
    // the Ouphe was offered and refused.
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    const ouphe = spawn(game, "Spellwild Ouphe", B);
    lands(game, "Mountain", 7);
    const card = toHand(game, "Shatterskull Smashing");
    const offer = castOffer(game, card);
    expect(offer?.xCost).toMatchObject({ maxX: 7, maxXUnreduced: 5, reducingTargets: [ouphe] });
    expect(maxXForTargets(offer!.xCost!, offer!.targetCount, [ref(bears), ref(giant)])).toBe(5);
    expect(maxXForTargets(offer!.xCost!, offer!.targetCount, [ref(ouphe), ref(giant)])).toBe(7);
    expect(() => cast(game, card, { x: 7, targets: [ref(bears), ref(giant)], division: [7, 7] })).toThrow(/cannot pay/);
    cast(game, card, { x: 7, targets: [ref(ouphe), ref(giant)], division: [4, 10] });
    expect(zone(game, giant)).toBe("graveyard");
  });

  it("X 1 can't be divided between two targets", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Mountain", 3);
    expect(() =>
      cast(game, toHand(game, "Shatterskull Smashing"), { x: 1, targets: [ref(bears), ref(giant)] }),
    ).toThrow();
  });
});

describe("Meteor Shower: X plus 1 divided among any number of targets", () => {
  it("X 2 divides 3 among two creatures and a player", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Mountain", 5);
    const card = toHand(game, "Meteor Shower");
    const offer = castOffer(game, card);
    expect(offer?.divide?.totalByX).toEqual([1, 2, 3]);
    expect(offer?.xCost?.minXByTargetCount).toEqual([0, 0, 1, 2]);
    cast(game, card, { x: 2, targets: [ref(bears), ref(giant), ref(B)], division: [1, 1, 1] });
    expect(damage(game, bears)).toBe(1);
    expect(damage(game, giant)).toBe(1);
    expect(life(game, B)).toBe(19);
  });

  it("X 0 still deals 1, to one target", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Meteor Shower"), { x: 0, targets: [ref(bears)] });
    expect(damage(game, bears)).toBe(1);
  });
});
