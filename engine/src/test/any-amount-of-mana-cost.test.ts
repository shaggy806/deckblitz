/**
 * `grantsToSpells.anyAmountOfMana` (Chorus of the Conclave): "As an
 * additional cost to cast creature spells, you may pay any amount of mana. If
 * you do, that creature enters with that many additional +1/+1 counters on
 * it." An optional additional cost (rule 601.2b), generic mana in the total
 * cost (601.2f), offered as one cast per amount (`keywordCosts
 * .anyAmountOfMana`).
 */
import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, cast, counters, lands, nextTurn, spawn, table, toHand, zone } from "./harness.js";

type Cast = Extract<LegalAction, { kind: "cast-spell" }>;

const amounts = (game: Game, card: ObjectId, player: PlayerId = A): number[] =>
  game
    .legalActions(player)
    .filter((a): a is Cast => a.kind === "cast-spell" && a.card === card)
    .map((a) => a.keywordCosts?.anyAmountOfMana ?? 0)
    .sort((x, y) => x - y);

const tappedCount = (game: Game, ids: readonly ObjectId[]): number => ids.filter((id) => game.state.objects[id].tapped).length;

describe("Chorus of the Conclave", () => {
  it("offers a creature spell at every amount its mana reaches", () => {
    const { game } = table();
    spawn(game, "Chorus of the Conclave");
    lands(game, "Forest", 5);
    const bears = toHand(game, "Grizzly Bears");
    expect(amounts(game, bears)).toEqual([0, 1, 2, 3]);
  });

  it("paying three more, it enters with three +1/+1 counters", () => {
    const { game } = table();
    spawn(game, "Chorus of the Conclave");
    const forests = lands(game, "Forest", 5);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears, { keywordCosts: { anyAmountOfMana: 3 } });
    expect(zone(game, bears)).toBe("battlefield");
    expect(counters(game, bears)).toBe(3);
    expect(tappedCount(game, forests)).toBe(5);
  });

  it("paying nothing more, it enters with none", () => {
    const { game } = table();
    spawn(game, "Chorus of the Conclave");
    const forests = lands(game, "Forest", 5);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears);
    expect(counters(game, bears)).toBe(0);
    expect(tappedCount(game, forests)).toBe(2);
  });

  it("more than its mana reaches is refused", () => {
    const { game } = table();
    spawn(game, "Chorus of the Conclave");
    lands(game, "Forest", 3);
    const bears = toHand(game, "Grizzly Bears");
    expect(() => cast(game, bears, { keywordCosts: { anyAmountOfMana: 2 } })).toThrow();
    expect(zone(game, bears)).toBe("hand");
  });

  it("not a noncreature spell, and not an opponent's creature spell", () => {
    const { game } = table();
    spawn(game, "Chorus of the Conclave");
    lands(game, "Forest", 4);
    const growth = toHand(game, "Giant Growth");
    expect(amounts(game, growth)).toEqual([0]);
    expect(() => cast(game, growth, { keywordCosts: { anyAmountOfMana: 1 } })).toThrow();
    nextTurn(game);
    lands(game, "Forest", 4, B);
    const bobs = toHand(game, "Grizzly Bears", B);
    expect(amounts(game, bobs, B)).toEqual([0]);
  });

  it("not while it's off the battlefield: not for itself (the ruling)", () => {
    const { game } = table();
    lands(game, "Forest", 6);
    lands(game, "Plains", 4);
    const chorus = toHand(game, "Chorus of the Conclave");
    expect(amounts(game, chorus)).toEqual([0]);
  });
});
