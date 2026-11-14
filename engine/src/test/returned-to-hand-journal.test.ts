/**
 * The journal's "put-into-hand" (`JOURNAL_VIEWS`): a permanent put into its
 * owner's hand from the battlefield this turn, in the owner's list whoever
 * controlled it (`JournalView.whose: "owner"`), a token too — it gets to the
 * hand before it ceases to exist (rule 111.7). Proved on Barrin, Tolarian
 * Archmage and Miles O'Brien, Transporter Ops, whose end-step draws are an
 * intervening "if" (rule 603.4).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

import { journalCount } from "../characteristics.js";
import { A, B, enter, hand, named, nextTurn, pickTargets, ref, settle, spawn, table, toStep, watchTargets } from "./harness.js";

const bounce = (game: Game, id: ObjectId, by: PlayerId = A): void => {
  game.debugApplyEffect(by, { kind: "return-to-hand", target: 0 }, [ref(id)]);
  settle(game);
};
const putIntoHand = (game: Game, player: PlayerId): number =>
  journalCount(game.state, game.registry, [player], "put-into-hand", undefined, player);
/** A table with alice's opening hand put back into her library. */
const board = (): ReturnType<typeof table> => {
  const t = table();
  for (const id of [...hand(t.game, A)]) t.game.debugMove(id, "library");
  return t;
};

describe("the journal's put-into-hand", () => {
  it("is in the owner's list: a creature bob took from alice, returned, is alice's", () => {
    const { game } = board();
    const bears = spawn(game, "Grizzly Bears", A);
    game.debugApplyEffect(B, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [ref(bears)]);
    settle(game);
    expect(game.state.objects[bears].controller).toBe(B);
    bounce(game, bears, B);
    expect(hand(game, A)).toContain(bears);
    expect(putIntoHand(game, A)).toBe(1);
    expect(putIntoHand(game, B)).toBe(0);
  });

  it("counts a token, and not a permanent that went anywhere but a hand", () => {
    const { game } = board();
    game.debugApplyEffect(A, { kind: "create-token", token: "Soldier Token", count: 1 });
    settle(game);
    const soldier = named(game, "Soldier Token", A)[0];
    game.debugApplyEffect(A, { kind: "exile", target: 0 }, [ref(spawn(game, "Grizzly Bears", A))]);
    settle(game);
    expect(putIntoHand(game, A)).toBe(0);
    bounce(game, soldier);
    expect(putIntoHand(game, A)).toBe(1);
  });
});

describe("Barrin, Tolarian Archmage", () => {
  it("draws one card at your end step after its own bounce of your creature, however many went back", () => {
    const { game, a } = board();
    const bears = spawn(game, "Grizzly Bears", A);
    pickTargets(a, bears);
    enter(game, "Barrin, Tolarian Archmage", A);
    expect(hand(game, A)).toEqual([bears]);
    bounce(game, spawn(game, "Hill Giant", A));
    toStep(game, "end");
    settle(game);
    expect(hand(game, A).length).toBe(3);
  });

  it("doesn't draw for an opponent's creature returned to their hand, or on a quiet turn", () => {
    const { game, a } = board();
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    enter(game, "Barrin, Tolarian Archmage", A);
    expect(hand(game, B)).toContain(bears);
    toStep(game, "end");
    settle(game);
    expect(hand(game, A).length).toBe(0);
    nextTurn(game);
    nextTurn(game);
    const before = hand(game, A).length;
    toStep(game, "end");
    settle(game);
    expect(hand(game, A).length).toBe(before);
  });

  it("reads the whole turn, before it entered, though the card has left your hand since", () => {
    const { game, a } = board();
    const bears = spawn(game, "Grizzly Bears", A);
    bounce(game, bears);
    game.debugMove(bears, "graveyard");
    pickTargets(a, null);
    enter(game, "Barrin, Tolarian Archmage", A);
    toStep(game, "end");
    settle(game);
    expect(hand(game, A).length).toBe(1);
  });
});

describe("Miles O'Brien, Transporter Ops", () => {
  it("draws at each end step, an opponent's too, after one of yours went back to your hand", () => {
    const { game, a } = board();
    const relic = spawn(game, "Sol Ring", A);
    pickTargets(a, relic);
    enter(game, "Miles O'Brien, Transporter Ops", A);
    expect(hand(game, A)).toEqual([relic]);
    toStep(game, "end");
    settle(game);
    expect(hand(game, A).length).toBe(2);
    // Bob's turn: his creature goes back to his hand, not yours — no draw.
    nextTurn(game);
    const before = hand(game, A).length;
    bounce(game, spawn(game, "Grizzly Bears", B), B);
    toStep(game, "end", B);
    settle(game);
    expect(hand(game, A).length).toBe(before);
  });

  it("offers only another creature or artifact you control", () => {
    const { game, a } = board();
    const mine = spawn(game, "Grizzly Bears", A);
    const theirs = spawn(game, "Grizzly Bears", B);
    const enchantment = spawn(game, "Pacifism", A);
    const watch = watchTargets(a);
    enter(game, "Miles O'Brien, Transporter Ops", A);
    expect(watch.asked).toBe(1);
    const offered = watch.offered[0];
    expect(offered).toContain(mine);
    expect(offered).not.toContain(theirs);
    expect(offered).not.toContain(enchantment);
    expect(offered.length).toBe(1);
  });
});
