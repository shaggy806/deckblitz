/**
 * "If you would pay life while your library has at least that many cards in
 * it, exile that many cards from the top of your library instead." (Ashiok,
 * Wicked Manipulator): the `would-pay-life` replacement
 * (`LifePaymentReplacement`, `whileLibraryHasThatMany`), applied in
 * `Game.payLife` to a cost's payment and an effect's alike (rule 614.1a), the
 * payment never happening (614.6). And the rest of Ashiok's text. Need key
 * replacement:pay-life-exile-library-instead.
 */

import { describe, expect, it } from "vitest";

import { A, B, activate, counters, hand, lands, life, loyalty, named, pickFromZone, ref, settle, spawn, table, toStep } from "./harness.js";
import type { Game } from "../game.js";
import type { PlayerId } from "../primitives.js";

const library = (game: Game, player: PlayerId = A) => game.state.zones.perPlayer[player].library;
const exile = (game: Game) => game.state.zones.shared.exile;

/** Alice's Greed ({B}, Pay 2 life: Draw a card), with a Swamp to pay. */
function greed(game: Game) {
  lands(game, "Swamp", 1);
  return spawn(game, "Greed");
}

describe("Ashiok, Wicked Manipulator — paying life", () => {
  it("exiles that many cards from the top of your library instead of paying life for a cost", () => {
    const { game } = table();
    spawn(game, "Ashiok, Wicked Manipulator");
    const source = greed(game);
    const top = library(game).slice(0, 2);
    const before = library(game).length;
    const handBefore = hand(game).length;
    activate(game, source, 0);
    expect(life(game, A)).toBe(20);
    expect(exile(game)).toEqual(expect.arrayContaining(top));
    // Two exiled, one drawn: the cost still counts as paid.
    expect(library(game)).toHaveLength(before - 3);
    expect(hand(game)).toHaveLength(handBefore + 1);
  });

  it("replaces an effect's payment of life too", () => {
    const { game } = table();
    spawn(game, "Ashiok, Wicked Manipulator");
    const before = library(game).length;
    game.debugApplyEffect(A, { kind: "lose-life", amount: 3, paid: true });
    settle(game);
    expect(life(game, A)).toBe(20);
    expect(library(game)).toHaveLength(before - 3);
  });

  it("pays life as usual when the library has fewer cards than that", () => {
    const { game } = table();
    spawn(game, "Ashiok, Wicked Manipulator");
    game.debugApplyEffect(A, { kind: "exile-from-library", whose: "you", amount: library(game).length - 1 });
    settle(game);
    expect(library(game)).toHaveLength(1);
    const source = greed(game);
    activate(game, source, 0);
    expect(life(game, A)).toBe(18);
  });

  it("still can't pay more life than you have", () => {
    const { game } = table();
    spawn(game, "Ashiok, Wicked Manipulator");
    const source = greed(game);
    game.state.players[A].life = 1;
    const before = library(game).length;
    expect(() => activate(game, source, 0)).toThrow();
    expect(library(game)).toHaveLength(before);
    // With the 2 life it could pay, the same activation goes through.
    game.state.players[A].life = 2;
    activate(game, source, 0);
    expect(life(game, A)).toBe(2);
    expect(library(game)).toHaveLength(before - 3);
  });

  it("doesn't touch an opponent's payment", () => {
    const { game } = table();
    spawn(game, "Ashiok, Wicked Manipulator");
    const before = library(game, B).length;
    game.debugApplyEffect(B, { kind: "lose-life", amount: 3, paid: true });
    settle(game);
    expect(life(game, B)).toBe(17);
    expect(library(game, B)).toHaveLength(before);
  });
});

describe("Ashiok, Wicked Manipulator — loyalty abilities", () => {
  it("+1: exiles one of the top two and puts the other into your hand", () => {
    const { game, a } = table();
    const ashiok = spawn(game, "Ashiok, Wicked Manipulator");
    const [first, second] = library(game).slice(0, 2);
    pickFromZone(a, first);
    loyalty(game, ashiok, 1);
    expect(game.state.objects[first].zone).toBe("exile");
    expect(game.state.objects[second].zone).toBe("hand");
    expect(counters(game, ashiok, "loyalty")).toBe(6);
  });

  it("−2: two 1/1 Nightmares that grow at your beginning of combat if a card was exiled this turn", () => {
    const { game } = table();
    const ashiok = spawn(game, "Ashiok, Wicked Manipulator");
    loyalty(game, ashiok, -2);
    const tokens = named(game, "Nightmare Token (Ashiok, Wicked Manipulator)");
    expect(tokens.reduce((n, id) => n + (game.state.objects[id].stackCount ?? 1), 0)).toBe(2);
    toStep(game, "begin-combat");
    settle(game);
    for (const id of named(game, "Nightmare Token (Ashiok, Wicked Manipulator)")) expect(counters(game, id)).toBe(0);
  });

  it("−2's Nightmares get a counter when a card was put into exile this turn", () => {
    const { game } = table();
    const ashiok = spawn(game, "Ashiok, Wicked Manipulator");
    loyalty(game, ashiok, -2);
    game.debugApplyEffect(A, { kind: "exile-from-library", whose: "you", amount: 1 });
    settle(game);
    toStep(game, "begin-combat");
    settle(game);
    const tokens = named(game, "Nightmare Token (Ashiok, Wicked Manipulator)");
    expect(tokens.length).toBeGreaterThan(0);
    for (const id of tokens) expect(counters(game, id)).toBe(1);
  });

  it("−7: target player exiles the top X, X the total mana value of cards you own in exile", () => {
    const { game } = table();
    const ashiok = spawn(game, "Ashiok, Wicked Manipulator");
    // Alice's exile: a Hill Giant (4) and a Grizzly Bears (2); bob's own exiled card doesn't count.
    for (const name of ["Hill Giant", "Grizzly Bears"]) {
      const card = spawn(game, name);
      game.debugApplyEffect(A, { kind: "exile", target: 0 }, [ref(card)]);
    }
    const theirs = spawn(game, "Hill Giant", B);
    game.debugApplyEffect(A, { kind: "exile", target: 0 }, [ref(theirs)]);
    settle(game);
    const before = library(game, B).length;
    loyalty(game, ashiok, -7, { atLeast: 7, targets: [ref(B)] });
    expect(library(game, B)).toHaveLength(before - 6);
  });
});
