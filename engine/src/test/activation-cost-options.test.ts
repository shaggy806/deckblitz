/**
 * A choice of whole costs on an activated ability (`AbilityCost.options`):
 * "{3}, {T}, Sacrifice an artifact or discard a nonland card" (Bullseye,
 * Death Dealer). One branch is chosen as it's activated (rule 602.2b,
 * through 601.2f): the ability is offered once per branch that can be paid,
 * and the action names it (`costOption`). And each-player-may's discard
 * option with a filter — the enter trigger's "or discard a nonland card".
 */

import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, enter, graveyard, hand, lands, life, pickModes, pickTargets, ref, settle, spawn, table, toHand, zone } from "./harness.js";

type Offer = Extract<LegalAction, { kind: "activate-ability" }>;
const offers = (game: Game, source: ObjectId): Offer[] =>
  game.legalActions(A).filter((l): l is Offer => l.kind === "activate-ability" && l.source === source);

describe("Bullseye, Death Dealer: a choice of costs on an activated ability", () => {
  it("is offered once per branch that can be paid, each labelled", () => {
    const { game } = table();
    const bullseye = spawn(game, "Bullseye, Death Dealer");
    lands(game, "Swamp", 3);
    expect(offers(game, bullseye)).toEqual([]);
    spawn(game, "Ornithopter");
    expect(offers(game, bullseye).map((o) => o.costOption)).toEqual([0]);
    toHand(game, "Forest");
    expect(offers(game, bullseye).map((o) => o.costOption)).toEqual([0]);
    toHand(game, "Grizzly Bears");
    const both = offers(game, bullseye);
    expect(both.map((o) => o.costOption)).toEqual([0, 1]);
    expect(both[1].costOptionText).toBe("Discard a nonland card");
    expect(both[1].text).toContain("(Discard a nonland card)");
    expect(both[0].sacrifice?.choices.length).toBe(1);
    expect(both[1].sacrifice).toBeUndefined();
  });

  it("the sacrifice branch sacrifices the artifact and keeps the hand", () => {
    const { game } = table();
    const bullseye = spawn(game, "Bullseye, Death Dealer");
    lands(game, "Swamp", 3);
    const clue = spawn(game, "Ornithopter");
    const bears = toHand(game, "Grizzly Bears");
    game.dispatch({ type: "activate-ability", player: A, source: bullseye, abilityIndex: 0, costOption: 0, sacrifice: clue, targets: [ref(B)] });
    settle(game);
    expect(life(game, B)).toBe(18);
    expect(zone(game, clue)).toBe("graveyard");
    expect(zone(game, bears)).toBe("hand");
  });

  it("the discard branch discards a nonland card, never the land, and keeps the artifact", () => {
    const { game, a } = table();
    const bullseye = spawn(game, "Bullseye, Death Dealer");
    lands(game, "Swamp", 3);
    const clue = spawn(game, "Ornithopter");
    const forest = toHand(game, "Forest");
    const bears = toHand(game, "Grizzly Bears");
    let offered: readonly ObjectId[] = [];
    a.chooseDiscardsFn = (cards, count) => {
      offered = cards.map((c) => c.id);
      return cards.filter((c) => c.id === bears).slice(0, count).map((c) => c.id);
    };
    a.chooseFromZoneFn = (_view, eligible) => {
      offered = eligible;
      return eligible.filter((id) => id === bears);
    };
    game.dispatch({ type: "activate-ability", player: A, source: bullseye, abilityIndex: 0, costOption: 1, targets: [ref(B)] });
    settle(game);
    expect(life(game, B)).toBe(18);
    expect(graveyard(game)).toContain(bears);
    expect(hand(game)).toContain(forest);
    expect(offered).not.toContain(forest);
    expect(zone(game, clue)).toBe("battlefield");
  });

  it("an activation naming no branch, or one it can't pay, is refused", () => {
    const { game } = table();
    const bullseye = spawn(game, "Bullseye, Death Dealer");
    lands(game, "Swamp", 3);
    const thopter = spawn(game, "Ornithopter");
    toHand(game, "Forest");
    expect(game.canDispatch({ type: "activate-ability", player: A, source: bullseye, abilityIndex: 0, targets: [ref(B)] })).toMatch(
      /costs chosen/,
    );
    expect(game.canDispatch({ type: "activate-ability", player: A, source: bullseye, abilityIndex: 0, costOption: 1, targets: [ref(B)] })).toMatch(
      /too few cards in hand/,
    );
    expect(
      game.canDispatch({ type: "activate-ability", player: A, source: bullseye, abilityIndex: 0, costOption: 0, sacrifice: thopter, targets: [ref(B)] }),
    ).toBeNull();
  });
});

describe("Bullseye's enter trigger: may sacrifice an artifact or discard a nonland card", () => {
  it("discarding a nonland card as it enters deals 2 damage", () => {
    const { game, a } = table();
    const thopter = spawn(game, "Ornithopter");
    const bears = toHand(game, "Grizzly Bears");
    pickModes(a, 1);
    pickTargets(a, B);
    enter(game, "Bullseye, Death Dealer");
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, thopter)).toBe("battlefield");
    expect(life(game, B)).toBe(18);
  });

  it("with only a land in hand and no artifact there's nothing to pay", () => {
    const { game, a } = table();
    const forest = toHand(game, "Forest");
    pickModes(a, 1);
    pickTargets(a, B);
    enter(game, "Bullseye, Death Dealer");
    expect(zone(game, forest)).toBe("hand");
    expect(life(game, B)).toBe(20);
  });
});
