/**
 * Rule 601.2f: a target reduction that either of two interchangeable slots
 * can earn, where the spell is payable only reduced: the first slot offers
 * only earners, so a cast the mana can't pay isn't offered.
 */

import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, lands, ref, spawn, table, toHand } from "./harness.js";

type CastOffer = Extract<LegalAction, { kind: "cast-spell" }>;

const offerOf = (game: Game, card: ObjectId): CastOffer | undefined =>
  game.legalActions(A).find((o): o is CastOffer => o.kind === "cast-spell" && o.card === card);

describe("a target cost reduction two slots can earn", () => {
  /** This Town Ain't Big Enough under Thorn of Amethyst: {5}{U}, three
   * Islands and a tapped Sol Ring, payable only reduced to {2}{U}. */
  const town = () => {
    const { game } = table();
    spawn(game, "Thorn of Amethyst", B);
    lands(game, "Island", 3);
    const mine = spawn(game, "Sol Ring", A, { tapped: true });
    const theirs = spawn(game, "Grizzly Bears", B);
    const card = toHand(game, "This Town Ain't Big Enough");
    return { game, mine, theirs, card };
  };

  it("offers only earners in the first slot", () => {
    const { game, mine, theirs, card } = town();
    const slots = offerOf(game, card)!.targetOptions;
    expect(slots[0].map((r) => (r.kind === "object" ? r.object : r.player))).toEqual([mine]);
    expect(slots[1].some((r) => r.kind === "object" && r.object === theirs)).toBe(true);
  });

  it("still allows the earner and another, and refuses a non-earner alone", () => {
    const { game, mine, theirs, card } = town();
    expect(game.canDispatch({ type: "cast-spell", player: A, card, targets: [ref(mine), ref(theirs)] })).toBeNull();
    expect(game.canDispatch({ type: "cast-spell", player: A, card, targets: [ref(theirs), null] })).not.toBeNull();
  });

  it("offers everything where the full price is payable", () => {
    const { game, theirs, card } = town();
    lands(game, "Island", 3);
    const slots = offerOf(game, card)!.targetOptions;
    expect(slots[0].some((r) => r.kind === "object" && r.object === theirs)).toBe(true);
  });
});
