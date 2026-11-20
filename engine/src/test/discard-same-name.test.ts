/**
 * "Discard two nonland cards with the same name" as an activation cost
 * (`AbilityCost.discard.sameName` — Sphinx of the Chimes): offered only while
 * the hand holds that many matching cards of one name, paid with the
 * ordinary `discard` decision (rule 602.2b), which offers only cards with
 * enough namesakes, carries each one's name (`sameNames`) and refuses a mix;
 * the bots' and the fuzzer's answers keep to one name.
 */
import { describe, expect, it } from "vitest";

import type { Action, LegalAction } from "../actions.js";
import { discard } from "../decisions/discard.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, activate, graveyard, hand, settle, spawn, table, toHand, zone } from "./harness.js";

const canActivate = (game: Game, source: ObjectId): boolean =>
  game.legalActions(A).some((x) => x.kind === "activate-ability" && x.source === source && x.abilityIndex === 0);
const offer = (game: Game): Extract<LegalAction, { kind: "discard" }> | undefined =>
  game.legalActions(A).find((x): x is Extract<LegalAction, { kind: "discard" }> => x.kind === "discard");
const emptyHand = (game: Game): void => {
  for (const id of [...hand(game)]) game.debugMove(id, "exile");
};

describe("Sphinx of the Chimes: discard two nonland cards with the same name", () => {
  it("is offered only with two nonland cards of one name in hand", () => {
    const { game } = table();
    const sphinx = spawn(game, "Sphinx of the Chimes");
    emptyHand(game);
    toHand(game, "Shock");
    toHand(game, "Forest");
    toHand(game, "Forest");
    toHand(game, "Grizzly Bears");
    // Two Forests are lands; a Shock and a Bears share no name.
    expect(canActivate(game, sphinx)).toBe(false);
    toHand(game, "Shock");
    expect(canActivate(game, sphinx)).toBe(true);
  });

  it("offers only the cards with a namesake, refuses a mix, and draws four", () => {
    const { game } = table();
    const sphinx = spawn(game, "Sphinx of the Chimes");
    emptyHand(game);
    const shock = toHand(game, "Shock");
    const shock2 = toHand(game, "Shock");
    const bears = toHand(game, "Grizzly Bears");
    const bears2 = toHand(game, "Grizzly Bears");
    const lions = toHand(game, "Savannah Lions");
    activate(game, sphinx, 0, { settle: false });
    expect(game.state.awaiting?.kind).toBe("discard");
    const asked = offer(game);
    expect(asked?.count).toBe(2);
    expect(asked?.from).toEqual([shock, shock2, bears, bears2]);
    expect(asked?.sameNames).toEqual(["Shock", "Shock", "Grizzly Bears", "Grizzly Bears"]);
    expect(() => game.dispatch({ type: "discard", player: A, cards: [shock, bears] })).toThrow(/same name/);
    expect(() => game.dispatch({ type: "discard", player: A, cards: [lions, bears] })).toThrow();
    game.dispatch({ type: "discard", player: A, cards: [bears, bears2] });
    expect(graveyard(game)).toEqual(expect.arrayContaining([bears, bears2]));
    settle(game);
    expect(hand(game).length).toBe(7);
    expect(zone(game, shock)).toBe("hand");
  });

  it("with only one pair, pays with it without asking", () => {
    const { game } = table();
    const sphinx = spawn(game, "Sphinx of the Chimes");
    emptyHand(game);
    const shock = toHand(game, "Shock");
    const shock2 = toHand(game, "Shock");
    toHand(game, "Grizzly Bears");
    activate(game, sphinx, 0);
    expect(zone(game, shock)).toBe("graveyard");
    expect(zone(game, shock2)).toBe("graveyard");
    expect(hand(game).length).toBe(5);
  });

  it("the bots' candidates and the fuzzer's answer keep to one name", () => {
    const legal: LegalAction = {
      kind: "discard",
      count: 2,
      from: ["a", "b", "c", "d", "e"] as ObjectId[],
      sameNames: ["Shock", "Bears", "Shock", "Bears", "Shock"],
    };
    const nameOf = (id: ObjectId) => legal.sameNames?.[legal.from.indexOf(id)];
    const candidates = discard.candidates?.(legal, A, 20, { order: (ids) => ids, controllerOf: () => A }) ?? [];
    expect(candidates.length).toBe(4);
    for (const c of candidates) {
      const cards = (c as Extract<Action, { type: "discard" }>).cards;
      expect(cards.length).toBe(2);
      expect(new Set(cards.map(nameOf)).size).toBe(1);
    }
    let n = 0;
    const rng = { random: () => 0, pickIndex: (length: number) => (n++ * 7) % length, pickTargets: () => [] };
    for (let i = 0; i < 10; i += 1) {
      const answer = discard.randomAnswer?.(legal, A, rng as never) as Extract<Action, { type: "discard" }>;
      expect(answer.cards.length).toBe(2);
      expect(new Set(answer.cards.map(nameOf)).size).toBe(1);
    }
  });
});
