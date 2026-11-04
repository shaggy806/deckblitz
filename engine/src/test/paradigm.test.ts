/**
 * Paradigm (rule 702.192a): the spell is exiled, and the first time a spell its
 * controller controls with that name has resolved, at the beginning of each of
 * their precombat main phases for the rest of the game a copy is created in
 * exile, which they may cast without paying its mana cost.
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ScriptedController } from "../controller.js";
import type { TargetRef } from "../target.js";
import { A, B, cast, counters, hand, lands, life, nextTurn, ref, settle, spawn, table, toGraveyard, toHand, zone } from "./harness.js";

/** The emblems `player` has, by their text. */
const emblems = (game: Game, player: typeof A): string[] =>
  Object.values(game.state.objects).flatMap((o) =>
    o.kind === "emblem" && o.controller === player ? [o.cardName] : [],
  );

/** Copies in exile: a copy not cast is gone with the next state-based check. */
const copiesInExile = (game: Game, name: string): number =>
  Object.values(game.state.objects).filter((o) => o.zone === "exile" && o.cardName === name && o.isCopy === true).length;

/** Answer each cast-now offer: cast it, or decline; returns what was offered. */
function casting(seat: ScriptedController, yes: boolean, targets: readonly TargetRef[] = []): string[] {
  const offers: string[] = [];
  seat.chooseCastNowFn = (_view, offer) => {
    offers.push(offer.casts[0].cardName);
    return yes
      ? { type: "cast-spell", player: seat.playerId, card: offer.casts[0].card, targets: [...targets], via: offer.casts[0].via, free: true }
      : null;
  };
  return offers;
}

describe("paradigm (rule 702.192a)", () => {
  it("the spell is exiled instead of going to the graveyard, and its effect happened", () => {
    const { game } = table();
    lands(game, "Forest", 5);
    const bears = spawn(game, "Grizzly Bears");
    const spell = toHand(game, "Germination Practicum");
    cast(game, spell);
    expect(zone(game, spell)).toBe("exile");
    expect(counters(game, bears)).toBe(2);
  });

  it("each of your precombat main phases, a copy may be cast free; its own effect happens, and it's gone", () => {
    const { game, a } = table();
    lands(game, "Forest", 5);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Germination Practicum"));
    const offers = casting(a, true);
    nextTurn(game); // bob's
    expect(offers).toEqual([]);
    nextTurn(game); // alice's
    settle(game);
    expect(offers).toEqual(["Germination Practicum"]);
    expect(counters(game, bears)).toBe(4);
    expect(copiesInExile(game, "Germination Practicum")).toBe(0);
    nextTurn(game);
    nextTurn(game);
    settle(game);
    expect(counters(game, bears)).toBe(6);
  });

  it("declined, the copy ceases to exist, and it's offered again the next time", () => {
    const { game, a } = table();
    lands(game, "Forest", 5);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Germination Practicum"));
    const offers = casting(a, false);
    nextTurn(game);
    nextTurn(game);
    settle(game);
    expect(offers).toHaveLength(1);
    expect(counters(game, bears)).toBe(2);
    expect(copiesInExile(game, "Germination Practicum")).toBe(0);
    nextTurn(game);
    nextTurn(game);
    settle(game);
    expect(offers).toHaveLength(2);
  });

  it("the copy's own resolution and a second card with the name set nothing more up", () => {
    const { game, a } = table();
    lands(game, "Forest", 10);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Germination Practicum"));
    cast(game, toHand(game, "Germination Practicum"));
    expect(counters(game, bears)).toBe(4);
    expect(emblems(game, A)).toHaveLength(1);
    const offers = casting(a, true);
    nextTurn(game);
    nextTurn(game);
    settle(game);
    expect(offers).toHaveLength(1);
    expect(counters(game, bears)).toBe(6);
    expect(emblems(game, A)).toHaveLength(1);
  });

  it("whatever becomes of the exiled card, the copy still comes (the ruling)", () => {
    const { game, a } = table();
    lands(game, "Forest", 5);
    const bears = spawn(game, "Grizzly Bears");
    const spell = toHand(game, "Germination Practicum");
    cast(game, spell);
    game.debugMove(spell, "graveyard");
    const offers = casting(a, true);
    nextTurn(game);
    nextTurn(game);
    settle(game);
    expect(offers).toHaveLength(1);
    expect(counters(game, bears)).toBe(4);
  });

  it("a spell that doesn't resolve isn't exiled and sets nothing up", () => {
    const { game } = table();
    lands(game, "Plains", 7);
    const yard = toGraveyard(game, "Grizzly Bears");
    const spell = toHand(game, "Restoration Seminar");
    cast(game, spell, { targets: [ref(yard)], settle: false });
    game.debugMove(yard, "exile");
    settle(game);
    expect(zone(game, spell)).toBe("graveyard");
    expect(emblems(game, A)).toHaveLength(0);
  });

  it("Decorum Dissertation: the copy's target is chosen as it's cast", () => {
    const { game, a } = table();
    lands(game, "Swamp", 5);
    const spell = toHand(game, "Decorum Dissertation");
    const before = life(game, A);
    const held = hand(game, A).length - 1;
    cast(game, spell, { targets: [ref(A)] });
    expect(hand(game, A).length).toBe(held + 2);
    expect(life(game, A)).toBe(before - 2);
    expect(zone(game, spell)).toBe("exile");
    const bob = life(game, B);
    casting(a, true, [ref(B)]);
    nextTurn(game);
    nextTurn(game);
    settle(game);
    expect(life(game, B)).toBe(bob - 2);
  });

  it("Restoration Seminar: no legal target for the copy, no cast to offer", () => {
    const { game, a } = table();
    lands(game, "Plains", 7);
    const yard = toGraveyard(game, "Grizzly Bears");
    cast(game, toHand(game, "Restoration Seminar"), { targets: [ref(yard)] });
    expect(zone(game, yard)).toBe("battlefield");
    const offers = casting(a, true);
    nextTurn(game);
    nextTurn(game);
    settle(game);
    expect(offers).toEqual([]);
    expect(copiesInExile(game, "Restoration Seminar")).toBe(0);
  });
});
