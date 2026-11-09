/**
 * Rule 601.2h: a cost's parts are paid in any order, so what the mana plan
 * would tap can still be picked for a tap cost, where the mana can be paid
 * without it. Any `count` of a tap cost's choices leaves the mana payable.
 */

import { describe, expect, it } from "vitest";

import type { TapCostOffer } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, lands, registryOf, settle, spawn, table } from "./harness.js";

const DOCKHAND = "Merchant's Dockhand";

/** Merchant's Dockhand ({3}{U}, {T}, tap X artifacts) with two Islands. */
const board = (...artifacts: readonly string[]) => {
  const { game } = table();
  const dock = spawn(game, DOCKHAND);
  lands(game, "Island", 2);
  return { game, dock, artifacts: artifacts.map((name) => spawn(game, name)) };
};

type OfferAt = (player: PlayerId, source: ObjectId, ability: unknown, x: number) => TapCostOffer | null;
const offerAt = (game: Game, dock: ObjectId, x: number): TapCostOffer | null =>
  (game as unknown as { abilityTapCostOffer: OfferAt }).abilityTapCostOffer(
    A,
    dock,
    registryOf(game).get(DOCKHAND).activated[0],
    x,
  );

describe("a tap cost's choices and the mana plan", () => {
  it("offers a source the plan would tap, when another can pay in its place", () => {
    const { game, dock, artifacts } = board("Sol Ring", "Sol Ring");
    expect([...offerAt(game, dock, 1)!.choices].sort()).toEqual([...artifacts].sort());
  });

  it("taps the one named and pays the mana with the other", () => {
    const { game, dock, artifacts } = board("Sol Ring", "Sol Ring");
    for (const picked of artifacts) {
      expect(offerAt(game, dock, 1)!.choices).toContain(picked);
    }
    const [picked, other] = artifacts;
    game.dispatch({ type: "activate-ability", player: A, source: dock, abilityIndex: 0, targets: [], xValue: 1, tap: [picked] });
    settle(game);
    expect(game.state.objects[picked].tapped).toBe(true);
    expect(game.state.objects[other].tapped).toBe(true);
  });

  it("leaves out the source the mana can't be paid without", () => {
    const { game, dock, artifacts } = board("Sol Ring", "Mind Stone");
    const [ring, stone] = artifacts;
    expect(offerAt(game, dock, 1)!.choices).toEqual([stone]);
    expect(offerAt(game, dock, 1)!.choices).not.toContain(ring);
  });

  it("keeps any count of them payable", () => {
    const { game, dock, artifacts } = board("Sol Ring", "Sol Ring", "Mind Stone");
    const stone = artifacts[2];
    const offer = offerAt(game, dock, 2)!;
    // Two Rings tapped would leave the Stone and the Islands, 3 of {3}{U}: only
    // one Ring can be among the choices.
    expect(offer.choices).toHaveLength(2);
    expect(offer.choices).toContain(stone);
  });

  it("offers them all when any two leave enough", () => {
    const { game, dock, artifacts } = board("Sol Ring", "Sol Ring", "Sol Ring");
    expect([...offerAt(game, dock, 2)!.choices].sort()).toEqual([...artifacts].sort());
  });
});
