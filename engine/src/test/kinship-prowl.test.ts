import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  attack,
  cast,
  hand,
  keywords,
  lands,
  life,
  nextTurn,
  pickFromZone,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toLibrary,
  toStep,
  zone,
} from "./harness.js";

// Kinship — Morningtide's ability word: "At the beginning of your upkeep, you
// may look at the top card of your library. If it shares a creature type with
// this creature, you may reveal it. If you do, …" (`kinship()`, the
// `sharesCreatureTypeWith: "source"` filter). Prowl [cost] (rule 702.76a): an
// alternative cost offered once a source you controlled dealt combat damage
// to a player this turn while it had one of the spell's creature types
// (`prowl()`, the `prowl` condition), answering `self-prowl-paid`.

const libraryTop = (game: Game): ObjectId | undefined => {
  return game.state.zones.perPlayer[A].library[0];
};

describe("kinship", () => {
  it("Waterspout Weavers: a revealed Merfolk gives your creatures flying, and stays on top", () => {
    const { game, a } = table();
    const weavers = spawn(game, "Waterspout Weavers");
    const bears = spawn(game, "Grizzly Bears");
    nextTurn(game);
    const top = toLibrary(game, "Merrow Witsniper");
    const seen = pickFromZone(a, top);
    toStep(game, "upkeep", A);
    settle(game);
    expect(seen.offered).toEqual([top]);
    expect(libraryTop(game)).toBe(top);
    expect(keywords(game, weavers).has("flying")).toBe(true);
    expect(keywords(game, bears).has("flying")).toBe(true);
  });

  it("offers nothing when the top card shares no creature type, and nothing happens", () => {
    const { game, a } = table();
    const weavers = spawn(game, "Waterspout Weavers");
    nextTurn(game);
    toLibrary(game, "Grizzly Bears");
    const seen = pickFromZone(a);
    toStep(game, "upkeep", A);
    settle(game);
    expect(seen.offered).toEqual([]);
    expect(keywords(game, weavers).has("flying")).toBe(false);
  });

  it("not revealing it does nothing", () => {
    const { game, a } = table();
    spawn(game, "Nightshade Schemers");
    nextTurn(game);
    toLibrary(game, "Inspired Sprite");
    pickFromZone(a);
    toStep(game, "upkeep", A);
    settle(game);
    expect(life(game, B)).toBe(20);
  });

  it("a changeling on top shares a creature type with anything", () => {
    const { game, a } = table();
    spawn(game, "Nightshade Schemers");
    nextTurn(game);
    const top = toLibrary(game, "Changeling Sentinel");
    pickFromZone(a, top);
    toStep(game, "upkeep", A);
    settle(game);
    expect(life(game, B)).toBe(18);
  });

  it("Leaf-Crowned Elder casts the revealed Treefolk from the library for free", () => {
    const { game, a } = table();
    spawn(game, "Leaf-Crowned Elder");
    nextTurn(game);
    const top = toLibrary(game, "Ambassador Oak");
    pickFromZone(a, top);
    a.chooseCastNowFn = (_v, offer) =>
      offer.casts.length === 0 ? null : { type: "cast-spell", player: A, card: offer.cards[0], targets: [], via: "effect", free: true };
    toStep(game, "upkeep", A);
    settle(game);
    expect(zone(game, top)).toBe("battlefield");
  });
});

const prowlOffers = (game: Game, card: ObjectId) =>
  game.legalActions(A).filter((a) => a.kind === "cast-spell" && a.card === card && a.altCost === true);

describe("prowl", () => {
  it("is offered only after a creature of the spell's types dealt you combat damage to a player", () => {
    const { game, a } = table();
    const faerie = toHand(game, "Latchkey Faerie");
    lands(game, "Island", 3);
    expect(prowlOffers(game, faerie)).toHaveLength(0);
    // A Bear dealing combat damage doesn't count: it's neither Faerie nor Rogue.
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [bears]);
    expect(life(game, B)).toBe(18);
    expect(prowlOffers(game, faerie)).toHaveLength(0);
    nextTurn(game);
    nextTurn(game);
    const boggart = spawn(game, "Prickly Boggart");
    attack(game, a, [boggart]);
    const offer = prowlOffers(game, faerie);
    expect(offer).toHaveLength(1);
    expect(offer[0]).toMatchObject({ altCostText: "prowl {2}{U}" });
    const before = hand(game, A).length;
    cast(game, faerie, { altCost: true });
    expect(zone(game, faerie)).toBe("battlefield");
    // The Faerie left the hand; its enters trigger drew one.
    expect(hand(game, A).length).toBe(before);
  });

  it("a changeling's combat damage counts for any creature type, and it ends with the turn", () => {
    const { game, a } = table();
    const theft = toHand(game, "Morsel Theft");
    lands(game, "Swamp", 2);
    const sentinel = spawn(game, "Changeling Sentinel");
    attack(game, a, [sentinel]);
    expect(prowlOffers(game, theft)).toHaveLength(1);
    nextTurn(game);
    nextTurn(game);
    expect(prowlOffers(game, theft)).toHaveLength(0);
  });

  it("Morsel Theft draws only when its prowl cost was paid", () => {
    const { game, a } = table();
    const full = toHand(game, "Morsel Theft");
    lands(game, "Swamp", 4);
    const before = hand(game, A).length;
    cast(game, full, { targets: [ref(B)] });
    expect(life(game, B)).toBe(17);
    expect(life(game, A)).toBe(23);
    expect(hand(game, A).length).toBe(before - 1);
    const boggart = spawn(game, "Prickly Boggart");
    attack(game, a, [boggart]);
    const prowled = toHand(game, "Morsel Theft");
    lands(game, "Swamp", 2);
    const held = hand(game, A).length;
    cast(game, prowled, { targets: [ref(B)], altCost: true });
    expect(hand(game, A).length).toBe(held);
  });
});
