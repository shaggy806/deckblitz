/**
 * Suspend X (rule 702.62a, 107.3a: "Suspend X—{X}{W}{W}. X can't be 0.") and a
 * suspend cost paid to cast the card (The Face of Boe, rule 118.9).
 */
import { describe, expect, it } from "vitest";

import { computeCharacteristics } from "../characteristics.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { activePlayerOf } from "../state.js";
import {
  A,
  B,
  activate,
  graveyard,
  hand,
  lands,
  named,
  nextTurn,
  pickTargets,
  pt,
  ref,
  registryOf,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  tokensNamed,
  zone,
} from "./harness.js";

const suspendOffer = (game: Game, card: ObjectId) =>
  game.legalActions(A).find((a) => a.kind === "suspend" && a.card === card);
const untapped = (game: Game, land: string): number =>
  named(game, land, A).filter((id) => game.state.objects[id].tapped !== true).length;
const hasHaste = (game: Game, id: ObjectId): boolean =>
  game.state.objects[id].hastyUntilItLeaves === true ||
  computeCharacteristics(game.state, registryOf(game), id).keywords.has("haste");

describe("Suspend X", () => {
  it("offers X from 1 to what the mana pays, and exiles it with that many time counters", () => {
    const { game } = table();
    lands(game, "Plains", 5);
    const commander = toHand(game, "Benalish Commander");

    // {X}{W}{W} with five Plains: X up to 3.
    expect(suspendOffer(game, commander)).toMatchObject({ n: "x", cost: "{X}{W}{W}", xCost: { minX: 1, maxX: 3 } });

    game.dispatch({ type: "suspend", player: A, card: commander, xValue: 2 });
    expect(zone(game, commander)).toBe("exile");
    expect(game.state.objects[commander].suspended).toBe(true);
    expect(game.state.objects[commander].counters.time).toBe(2);
    // Four of the five Plains paid {2}{W}{W}.
    expect(untapped(game, "Plains")).toBe(1);
  });

  it("X can't be 0, nor more than the mana pays", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    const commander = toHand(game, "Benalish Commander");
    expect(game.canDispatch({ type: "suspend", player: A, card: commander, xValue: 0 })).toMatch(/can't be 0/);
    expect(game.canDispatch({ type: "suspend", player: A, card: commander, xValue: 2 })).toMatch(/cannot pay/);
    expect(zone(game, commander)).toBe("hand");
    expect(suspendOffer(game, commander)).toMatchObject({ xCost: { minX: 1, maxX: 1 } });
  });

  it("isn't offered when even X=1 can't be paid", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const commander = toHand(game, "Benalish Commander");
    expect(suspendOffer(game, commander)).toBeUndefined();
  });

  it("a fixed suspend ignores any X sent with it", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    const bolt = toHand(game, "Rift Bolt");
    game.dispatch({ type: "suspend", player: A, card: bolt, xValue: 5 });
    expect(game.state.objects[bolt].counters.time).toBe(1);
    expect(untapped(game, "Mountain")).toBe(0);
  });

  it("Benalish Commander: a Soldier for each counter off, the last too, then cast free with haste", () => {
    const { game, a } = table();
    lands(game, "Plains", 4);
    const commander = toHand(game, "Benalish Commander");
    game.dispatch({ type: "suspend", player: A, card: commander, xValue: 2 });

    nextTurn(game);
    nextTurn(game);
    expect(activePlayerOf(game.state)).toBe(A);
    expect(game.state.objects[commander].counters.time).toBe(1);
    expect(tokensNamed(game, "Soldier Token", A)).toBe(1);

    a.chooseCastNowFn = (_view, offer) => {
      expect(offer.free).toBe(true);
      return { type: "cast-spell", player: A, card: commander, targets: [], via: "effect", free: true };
    };
    nextTurn(game);
    nextTurn(game);
    settle(game);
    expect(tokensNamed(game, "Soldier Token", A)).toBe(2);
    expect(zone(game, commander)).toBe("battlefield");
    // Two tokens and itself (a Human Soldier).
    expect(pt(game, commander)).toEqual({ power: 3, toughness: 3 });
    expect(hasHaste(game, commander)).toBe(true);
  });

  it("Aeon Chronicler draws for each counter off, and counts the hand", () => {
    const { game } = table();
    lands(game, "Island", 5);
    const chronicler = toHand(game, "Aeon Chronicler");
    game.dispatch({ type: "suspend", player: A, card: chronicler, xValue: 1 });
    expect(game.state.objects[chronicler].counters.time).toBe(1);
    const before = hand(game).length;
    nextTurn(game);
    expect(activePlayerOf(game.state)).toBe(B);
    nextTurn(game);
    // The upkeep's counter draws a card, then the turn's own draw.
    expect(hand(game).length).toBe(before + 2);
    const onBoard = spawn(game, "Aeon Chronicler", A);
    expect(pt(game, onBoard)).toEqual({ power: hand(game).length, toughness: hand(game).length });
  });

  it("Detritivore targets a nonbasic land as a counter comes off, and counts opponents' nonbasic lands", () => {
    const { game, a } = table();
    lands(game, "Mountain", 6);
    const quarter = spawn(game, "Ghost Quarter", B);
    const detritivore = toHand(game, "Detritivore");
    game.dispatch({ type: "suspend", player: A, card: detritivore, xValue: 2 });

    pickTargets(a, quarter);
    nextTurn(game);
    nextTurn(game);
    expect(zone(game, quarter)).toBe("graveyard");
    expect(game.state.objects[detritivore].counters.time).toBe(1);

    // A basic in the same graveyard doesn't count, nor a nonbasic in yours.
    toGraveyard(game, "Forest", B);
    toGraveyard(game, "Ghost Quarter", A);
    const onBoard = spawn(game, "Detritivore", A);
    expect(pt(game, onBoard)).toEqual({ power: 1, toughness: 1 });
  });
});

describe("The Face of Boe", () => {
  it("casts Ancestral Vision, which has no mana cost, for its suspend cost", () => {
    const { game, a } = table();
    const face = spawn(game, "The Face of Boe", A);
    lands(game, "Island", 1);
    const vision = toHand(game, "Ancestral Vision");
    const before = hand(game, B).length;

    a.chooseCastNowFn = (_view, offer) => {
      expect(offer.suspendCost).toBe(true);
      expect(offer.casts.map((c) => c.card)).toEqual([vision]);
      return { type: "cast-spell", player: A, card: vision, targets: [ref(B)], via: "effect" };
    };
    activate(game, face, 0);
    settle(game);
    expect(hand(game, B).length).toBe(before + 3);
    expect(graveyard(game)).toContain(vision);
    // {U} paid.
    expect(untapped(game, "Island")).toBe(0);
  });

  it("offers only spells with suspend it can pay, and no way but the suspend cost", () => {
    const { game, a } = table();
    const face = spawn(game, "The Face of Boe", A);
    lands(game, "Mountain", 1);
    const bolt = toHand(game, "Rift Bolt");
    toHand(game, "Lightning Bolt");
    toHand(game, "Ancestral Vision"); // Blue: {R} can't pay it.
    let offered: readonly ObjectId[] = [];
    a.chooseCastNowFn = (_view, offer) => {
      offered = offer.casts.map((c) => c.card);
      expect(offer.casts.every((c) => c.free !== true && c.altCost !== true)).toBe(true);
      return null;
    };
    activate(game, face, 0);
    settle(game);
    expect(offered).toEqual([bolt]);
    // Declined: the card stays in hand and nothing was paid.
    expect(zone(game, bolt)).toBe("hand");
    expect(untapped(game, "Mountain")).toBe(1);
  });

  it("casts a Suspend X card with X chosen, at least 1, with no time counters and no haste", () => {
    const { game, a } = table();
    const face = spawn(game, "The Face of Boe", A);
    lands(game, "Plains", 4);
    const commander = toHand(game, "Benalish Commander");
    let refusedAtZero: string | null = null;
    a.chooseCastNowFn = (_view, offer) => {
      expect(offer.casts[0]?.xCost).toMatchObject({ minX: 1, maxX: 2 });
      refusedAtZero = game.canDispatch({
        type: "cast-now",
        player: A,
        cast: { type: "cast-spell", player: A, card: commander, targets: [], via: "effect", xValue: 0 },
      });
      return { type: "cast-spell", player: A, card: commander, targets: [], via: "effect", xValue: 1 };
    };
    activate(game, face, 0);
    settle(game);
    expect(refusedAtZero).toMatch(/can't be 0/);
    expect(zone(game, commander)).toBe("battlefield");
    expect(game.state.objects[commander].suspended ?? false).toBe(false);
    expect(hasHaste(game, commander)).toBe(false);
    // {1}{W}{W} paid, one Plains left.
    expect(untapped(game, "Plains")).toBe(1);
  });

  it("activates only as a sorcery", () => {
    const { game } = table({ step: "upkeep" });
    const face = spawn(game, "The Face of Boe", A);
    expect(game.legalActions(A).some((a) => a.kind === "activate-ability" && a.source === face)).toBe(false);
  });
});
