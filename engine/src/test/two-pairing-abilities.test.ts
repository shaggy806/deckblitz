/**
 * A commander with two partner abilities (rule 702.124g: "If a legendary card
 * has more than one partner ability, you may choose which one to use when
 * designating your commander, but you can't use both"): Amy Pond's "Partner
 * with Rory Williams" and Doctor's companion, each pairing her on its own.
 * And her combat damage trigger: "choose a suspended card you own and remove
 * that many time counters from it".
 *
 * Proving card: Amy Pond (with Rory Williams and The Eleventh Doctor).
 */

import { describe, expect, it } from "vitest";

import type { Action } from "../actions.js";
import { createDefaultRegistry } from "../cards.js";
import { canPairCommanders, pairingProblem, validateCommanderDeck } from "../deck-validation.js";
import { matchesFilter } from "../filter.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, attack, lands, nextTurn, pickFromZone, settle, spawn, table, toHand, zone } from "./harness.js";

const reg = createDefaultRegistry();
const AMY = "Amy Pond";
const RORY = "Rory Williams";
const DOCTOR = "The Eleventh Doctor";

const deckOf = (commanders: readonly string[]) =>
  validateCommanderDeck(
    { commanders, cards: Array<string>(100 - commanders.length).fill("Unimplemented Filler"), size: 100 },
    reg,
  );

describe("two partner abilities on one commander — Amy Pond", () => {
  it("declares both, as printed", () => {
    expect(reg.get(AMY).pairings).toEqual([{ kind: "partner-with", name: RORY }, { kind: "doctors-companion" }]);
  });

  it("pairs with Rory Williams through Partner with, either way round", () => {
    expect(deckOf([AMY, RORY]).violations).toEqual([]);
    expect(deckOf([RORY, AMY]).violations).toEqual([]);
  });

  it("pairs with a Time Lord Doctor through Doctor's companion", () => {
    expect(deckOf([AMY, DOCTOR]).violations).toEqual([]);
    expect(canPairCommanders(reg, DOCTOR, AMY)).toBe(true);
    // Rory has only Partner with: the Doctor is nothing to him.
    expect(canPairCommanders(reg, RORY, DOCTOR)).toBe(false);
  });

  it("pairs with nothing else, and says what she can pair with", () => {
    expect(pairingProblem(reg, AMY, "Thrasios, Triton Hero")).toBe(
      `"Amy Pond" and "Thrasios, Triton Hero" can't be paired: "Amy Pond" can only be paired with "Rory Williams" or a Time Lord Doctor`,
    );
    // Another companion: two Doctor's companions don't pair (702.124m).
    expect(canPairCommanders(reg, AMY, "Adric, Mathematical Genius")).toBe(false);
  });

  it("never makes three commanders (702.124g)", () => {
    expect(deckOf([AMY, RORY, DOCTOR]).legal).toBe(false);
  });

  it("has partner (its Partner with) and Doctor's companion, for a filter that asks", () => {
    const { game } = table();
    const amy = spawn(game, AMY);
    const rory = spawn(game, RORY);
    const has = (id: ObjectId, keyword: "partner" | "doctors-companion"): boolean =>
      matchesFilter(game.state, game.registry, id, { hasKeyword: keyword }, { you: A, source: id });
    expect([has(amy, "partner"), has(amy, "doctors-companion")]).toEqual([true, true]);
    expect([has(rory, "partner"), has(rory, "doctors-companion")]).toEqual([true, false]);
  });
});

type G = ReturnType<typeof table>["game"];

/** `card` suspended from a hand, for its suspend cost. */
const suspend = (game: G, name: string, cost: readonly [string, number], player: PlayerId = A): ObjectId => {
  const card = toHand(game, name, player);
  lands(game, cost[0], cost[1], player);
  game.dispatch({ type: "suspend", player, card } as Action);
  settle(game);
  expect(game.state.objects[card].suspended).toBe(true);
  return card;
};
const time = (game: G, id: ObjectId): number => game.state.objects[id].counters.time ?? 0;

describe("Amy Pond's combat damage: that many time counters off a suspended card you own", () => {
  it("offers only your own suspended cards, and takes her damage off the one chosen", () => {
    const { game, a } = table();
    nextTurn(game);
    const theirs = suspend(game, "Pardic Dragon", ["Mountain", 2], B);
    nextTurn(game);
    const vision = suspend(game, "Ancestral Vision", ["Island", 1]);
    const bloom = suspend(game, "Lotus Bloom", ["Island", 0]);
    expect([time(game, vision), time(game, bloom)]).toEqual([4, 3]);
    const amy = spawn(game, AMY);
    const seen = pickFromZone(a, vision);
    attack(game, a, [amy]);
    expect([...seen.offered].sort()).toEqual([vision, bloom].sort());
    expect(seen.offered).not.toContain(theirs);
    expect(time(game, vision)).toBe(2);
    expect(time(game, bloom)).toBe(3);
    expect(time(game, theirs)).toBe(2);
  });

  it("casts the card when she takes its last counters off", () => {
    const { game, a } = table();
    const dragon = suspend(game, "Pardic Dragon", ["Mountain", 2]);
    expect(time(game, dragon)).toBe(2);
    const amy = spawn(game, AMY);
    pickFromZone(a, dragon);
    a.chooseCastNowFn = () => ({ type: "cast-spell", player: A, card: dragon, targets: [], via: "effect", free: true });
    attack(game, a, [amy]);
    expect(time(game, dragon)).toBe(0);
    expect(zone(game, dragon)).toBe("battlefield");
  });

  it("asks nothing with no suspended card", () => {
    const { game, a } = table();
    const amy = spawn(game, AMY);
    const seen = pickFromZone(a);
    attack(game, a, [amy]);
    expect(seen.offered).toEqual([]);
    expect(game.state.players[B].life).toBe(18);
  });
});
