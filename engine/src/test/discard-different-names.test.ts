/**
 * "Discard three cards with different names" as an activation cost
 * (`AbilityCost.discard.differentNames` — Ormos, Archive Keeper): offered
 * only with that many names in hand, paid with the ordinary `discard`
 * decision (rule 602.2b), which carries each card's name and refuses a
 * repeat; the bots' and the fuzzer's answers keep to it. And a draw
 * replaced by counters: Ormos's "while your library has no cards in it",
 * checked draw by draw (rule 614.11, its ruling), and Pursuit of
 * Knowledge's optional study counter.
 */
import { describe, expect, it } from "vitest";

import type { Action, LegalAction } from "../actions.js";
import { discard } from "../decisions/discard.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, activate, counters, graveyard, hand, lands, settle, spawn, table, toHand, zone } from "./harness.js";

const canActivate = (game: Game, source: ObjectId): boolean =>
  game.legalActions(A).some((x) => x.kind === "activate-ability" && x.source === source && x.abilityIndex === 0);
const offer = (game: Game): Extract<LegalAction, { kind: "discard" }> | undefined =>
  game.legalActions(A).find((x): x is Extract<LegalAction, { kind: "discard" }> => x.kind === "discard");
const emptyLibrary = (game: Game, keep = 0): void => {
  for (const id of game.state.zones.perPlayer[A].library.slice(keep)) game.debugMove(id, "exile");
};

describe("Ormos's cost: discard three cards with different names", () => {
  it("is offered only with three names in hand", () => {
    const { game } = table();
    const ormos = spawn(game, "Ormos, Archive Keeper");
    lands(game, "Island", 3);
    for (const id of [...hand(game)]) game.debugMove(id, "exile");
    toHand(game, "Shock");
    toHand(game, "Shock");
    toHand(game, "Forest");
    expect(canActivate(game, ormos)).toBe(false);
    toHand(game, "Forest");
    expect(canActivate(game, ormos)).toBe(false);
    toHand(game, "Grizzly Bears");
    expect(canActivate(game, ormos)).toBe(true);
  });

  it("carries the names, refuses two of a name, and draws five once paid", () => {
    const { game } = table();
    const ormos = spawn(game, "Ormos, Archive Keeper");
    lands(game, "Island", 3);
    for (const id of [...hand(game)]) game.debugMove(id, "exile");
    const shock = toHand(game, "Shock");
    const shock2 = toHand(game, "Shock");
    const forest = toHand(game, "Forest");
    const bears = toHand(game, "Grizzly Bears");
    activate(game, ormos, 0, { settle: false });
    expect(game.state.awaiting?.kind).toBe("discard");
    const asked = offer(game);
    expect(asked?.count).toBe(3);
    expect(asked?.from).toEqual([shock, shock2, forest, bears]);
    expect(asked?.differentNames).toEqual(["Shock", "Shock", "Forest", "Grizzly Bears"]);
    expect(() => game.dispatch({ type: "discard", player: A, cards: [shock, shock2, forest] })).toThrow(/different names/);
    game.dispatch({ type: "discard", player: A, cards: [shock, forest, bears] });
    expect(graveyard(game)).toEqual(expect.arrayContaining([shock, forest, bears]));
    settle(game);
    // Shock's twin stayed, and five were drawn.
    expect(hand(game).length).toBe(6);
    expect(zone(game, shock2)).toBe("hand");
  });

  it("the bots' candidates and the fuzzer's answer never repeat a name", () => {
    const legal: LegalAction = {
      kind: "discard",
      count: 3,
      from: ["a", "b", "c", "d", "e"] as ObjectId[],
      differentNames: ["Shock", "Shock", "Shock", "Forest", "Island"],
    };
    const candidates = discard.candidates?.(legal, A, 20, { order: (ids) => ids, controllerOf: () => A }) ?? [];
    expect(candidates.length).toBeGreaterThan(0);
    for (const c of candidates) {
      const cards = (c as Extract<Action, { type: "discard" }>).cards;
      expect(cards.length).toBe(3);
      expect(new Set(cards.map((id) => legal.differentNames?.[legal.from.indexOf(id)])).size).toBe(3);
    }
    let n = 0;
    const rng = { random: () => 0, pickIndex: (length: number) => (n++ * 7) % length, pickTargets: () => [] };
    for (let i = 0; i < 10; i += 1) {
      const answer = discard.randomAnswer?.(legal, A, rng as never) as Extract<Action, { type: "discard" }>;
      expect(new Set(answer.cards.map((id) => legal.differentNames?.[legal.from.indexOf(id)])).size).toBe(3);
    }
  });
});

describe("a draw replaced by counters", () => {
  it("Ormos: draws what the library has, then five +1/+1 counters for each draw left, and no loss", () => {
    const { game } = table();
    const ormos = spawn(game, "Ormos, Archive Keeper");
    emptyLibrary(game, 2);
    const before = hand(game).length;
    game.debugApplyEffect(A, { kind: "draw", amount: 5 });
    settle(game);
    expect(hand(game).length).toBe(before + 2);
    expect(counters(game, ormos)).toBe(15);
    expect(game.state.players[A].hasLost).not.toBe(true);
  });

  it("Ormos: a draw from a library with cards in it is an ordinary draw", () => {
    const { game } = table();
    const ormos = spawn(game, "Ormos, Archive Keeper");
    const before = hand(game).length;
    game.debugApplyEffect(A, { kind: "draw", amount: 1 });
    settle(game);
    expect(hand(game).length).toBe(before + 1);
    expect(counters(game, ormos)).toBe(0);
  });

  it("Pursuit of Knowledge: a study counter instead of the draw if you choose, then seven for three", () => {
    const { game, a } = table();
    const pursuit = spawn(game, "Pursuit of Knowledge");
    a.chooseModesFn = (_view, _min, _max, texts) => [texts.findIndex((t) => t.startsWith("Pursuit of Knowledge"))];
    const before = hand(game).length;
    game.debugApplyEffect(A, { kind: "draw", amount: 3 });
    settle(game);
    expect(hand(game).length).toBe(before);
    expect(counters(game, pursuit, "study")).toBe(3);
    activate(game, pursuit);
    expect(zone(game, pursuit)).toBe("graveyard");
    expect(hand(game).length).toBe(before + 7);
  });

  it("Pursuit of Knowledge: declined, the card is drawn", () => {
    const { game, a } = table();
    const pursuit = spawn(game, "Pursuit of Knowledge");
    a.chooseModesFn = (_view, _min, _max, texts) => [texts.indexOf("Draw a card")];
    const before = hand(game).length;
    game.debugApplyEffect(A, { kind: "draw", amount: 1 });
    settle(game);
    expect(hand(game).length).toBe(before + 1);
    expect(counters(game, pursuit, "study")).toBe(0);
  });
});
