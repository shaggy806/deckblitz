/**
 * Two cost extensions: a card with two typecycling abilities (`moreCycling`,
 * rule 702.29e), and a flashback cost that taps creatures or discards cards,
 * X of them included (`flashback.tapCreatures`, `flashback.discard`, rule 702.34a).
 */

import { describe, expect, it } from "vitest";

import type { Action, LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, lands, settle, spawn, table, toGraveyard, toHand, toLibrary, turnTotal } from "./harness.js";

type CastOffer = Extract<LegalAction, { kind: "cast-spell" }>;
type AbilityOffer = Extract<LegalAction, { kind: "activate-ability" }>;

const flashbackOffer = (game: Game, card: ObjectId): CastOffer | undefined =>
  game.legalActions(A).find((a): a is CastOffer => a.kind === "cast-spell" && a.card === card && a.via === "flashback");

const castFlashback = (game: Game, card: ObjectId, more: Partial<Extract<Action, { type: "cast-spell" }>> = {}): void => {
  game.dispatch({ type: "cast-spell", player: A, card, targets: [], via: "flashback", ...more } as Action);
};

describe("two typecycling abilities on one card", () => {
  const offersOf = (game: Game, card: ObjectId): AbilityOffer[] =>
    game.legalActions(A).filter((a): a is AbilityOffer => a.kind === "activate-ability" && a.source === card);

  it("offers each by its own name, and not the plain cycle action", () => {
    const { game } = table();
    lands(game, "Wastes", 2);
    const rannet = toHand(game, "Valley Rannet");
    const offers = offersOf(game, rannet);
    expect(offers.map((o) => o.text)).toEqual(["Mountaincycling {2}", "Forestcycling {2}"]);
    expect(game.legalActions(A).some((a) => a.kind === "cycle" && a.card === rannet)).toBe(false);
    expect(() => game.dispatch({ type: "cycle", player: A, card: rannet })).toThrow(/activate it/);
  });

  it("searches for the type of the ability chosen, and only that", () => {
    const { game, a } = table();
    lands(game, "Wastes", 2);
    const rannet = toHand(game, "Valley Rannet");
    const mountain = toLibrary(game, "Mountain");
    const forest = toLibrary(game, "Forest");
    let offered: readonly ObjectId[] = [];
    a.chooseFromZoneFn = (_view, eligible) => {
      offered = eligible;
      return [forest];
    };
    const offer = offersOf(game, rannet)[1];
    game.dispatch({ type: "activate-ability", player: A, source: rannet, abilityIndex: offer.abilityIndex, targets: [] });
    expect(game.state.objects[rannet].zone).toBe("graveyard");
    settle(game);
    expect(offered).toContain(forest);
    expect(offered).not.toContain(mountain);
    expect(game.state.objects[forest].zone).toBe("hand");
    expect(turnTotal(game.state, A, "cycled")).toBe(1);
  });

  it("isn't offered without the mana", () => {
    const { game } = table();
    lands(game, "Wastes", 1);
    const pouncer = toHand(game, "Igneous Pouncer");
    expect(offersOf(game, pouncer)).toEqual([]);
  });

  it("leaves a card with one typecycling on the plain action", () => {
    const { game } = table();
    lands(game, "Wastes", 2);
    const eagles = toHand(game, "Eagles of the North");
    expect(game.legalActions(A).some((a) => a.kind === "cycle" && a.card === eagles)).toBe(true);
  });
});

describe("a flashback cost that taps creatures", () => {
  it("taps three white creatures, picked from the offer, for no mana", () => {
    const { game } = table();
    const screech = toGraveyard(game, "Battle Screech");
    const whites = [spawn(game, "Savannah Lions"), spawn(game, "Savannah Lions"), spawn(game, "Savannah Lions", A, { sick: true })];
    const fourth = spawn(game, "Savannah Lions");
    spawn(game, "Grizzly Bears");
    const offer = flashbackOffer(game, screech);
    expect(offer?.tapCost?.count).toBe(3);
    expect(offer?.tapCost?.choices).not.toContain(undefined);
    castFlashback(game, screech, { tap: whites });
    settle(game);
    // A summoning-sick one pays: it's no {T} cost (rule 302.6).
    for (const id of whites) expect(game.state.objects[id].tapped).toBe(true);
    expect(game.state.objects[fourth].tapped).toBe(false);
    const birds = game.battlefield.filter((id) => game.state.objects[id].cardName === "Bird Token");
    expect(birds.length).toBeGreaterThanOrEqual(1);
    expect(birds.reduce((n, id) => n + (game.state.objects[id].stackCount ?? 1), 0)).toBe(2);
    expect(game.state.objects[screech].zone).toBe("exile");
  });

  it("isn't offered with two, or with other colours", () => {
    const { game } = table();
    const screech = toGraveyard(game, "Battle Screech");
    spawn(game, "Savannah Lions");
    spawn(game, "Savannah Lions");
    spawn(game, "Grizzly Bears");
    expect(flashbackOffer(game, screech)).toBeUndefined();
    spawn(game, "Savannah Lions", A, { tapped: true });
    expect(flashbackOffer(game, screech)).toBeUndefined();
    spawn(game, "Savannah Lions");
    expect(flashbackOffer(game, screech)).toBeDefined();
  });

  it("refuses a pick the offer doesn't hold", () => {
    const { game } = table();
    const screech = toGraveyard(game, "Battle Screech");
    const whites = [spawn(game, "Savannah Lions"), spawn(game, "Savannah Lions"), spawn(game, "Savannah Lions")];
    const bears = spawn(game, "Grizzly Bears");
    expect(() => castFlashback(game, screech, { tap: [whites[0], whites[1], bears] })).toThrow();
    expect(() => castFlashback(game, screech, { tap: [whites[0], whites[1]] })).toThrow();
    expect(game.state.objects[screech].zone).toBe("graveyard");
  });

  it("taps any three for Group Project, leaving a spell from a hand free of it", () => {
    const { game } = table();
    const project = toGraveyard(game, "Group Project");
    const creatures = [spawn(game, "Grizzly Bears"), spawn(game, "Savannah Lions"), spawn(game, "Grizzly Bears")];
    castFlashback(game, project, { tap: creatures });
    settle(game);
    expect(game.battlefield.some((id) => game.state.objects[id].cardName === "Spirit Token (Red-White 2/2)")).toBe(true);
    const inHand = toHand(game, "Group Project");
    const wastes = lands(game, "Plains", 2);
    game.dispatch({ type: "cast-spell", player: A, card: inHand, targets: [] } as Action);
    settle(game);
    expect(wastes.every((id) => game.state.objects[id].tapped)).toBe(true);
  });
});

describe("a flashback cost that discards", () => {
  it("discards a card for Twinned Vision, which then draws two", () => {
    const { game, a } = table();
    const vision = toGraveyard(game, "Twinned Vision");
    lands(game, "Island", 3);
    const pitch = toHand(game, "Grizzly Bears");
    let discarded = false;
    a.chooseDiscardsFn = (_hand, count) => {
      discarded = true;
      expect(count).toBe(1);
      return [pitch];
    };
    const hand = game.handOf(A).length;
    castFlashback(game, vision);
    settle(game);
    expect(discarded).toBe(true);
    expect(game.state.objects[pitch].zone).toBe("graveyard");
    expect(game.handOf(A).length).toBe(hand - 1 + 2);
    expect(game.state.objects[vision].zone).toBe("exile");
  });

  it("draws one from a hand, and needs a card to discard from a graveyard", () => {
    const { game } = table();
    const inHand = toHand(game, "Twinned Vision");
    lands(game, "Island", 5);
    const before = game.handOf(A).length;
    game.dispatch({ type: "cast-spell", player: A, card: inHand, targets: [] } as Action);
    settle(game);
    expect(game.handOf(A).length).toBe(before - 1 + 1);
    const again = table().game;
    const vision = toGraveyard(again, "Twinned Vision");
    lands(again, "Island", 3);
    for (const id of again.handOf(A)) again.state.objects[id].zone = "library";
    again.state.zones.perPlayer[A].hand = [];
    expect(flashbackOffer(again, vision)).toBeUndefined();
  });

  it("announces X for Conflagrate, no more than the hand, and discards that many", () => {
    const { game, a } = table();
    const fire = toGraveyard(game, "Conflagrate");
    lands(game, "Mountain", 2);
    game.state.zones.perPlayer[A].hand = [];
    const held = [toHand(game, "Grizzly Bears"), toHand(game, "Grizzly Bears"), toHand(game, "Grizzly Bears")];
    const offer = flashbackOffer(game, fire);
    expect(offer?.xCost?.maxX).toBe(3);
    a.chooseDiscardsFn = (_hand, count) => held.slice(0, count);
    const life = game.state.players[B].life;
    expect(() =>
      game.dispatch({
        type: "cast-spell",
        player: A,
        card: fire,
        via: "flashback",
        xValue: 4,
        targets: [{ kind: "player", player: B }],
        division: [4],
      } as unknown as Action),
    ).toThrow(/no card to discard/);
    game.dispatch({
      type: "cast-spell",
      player: A,
      card: fire,
      via: "flashback",
      xValue: 2,
      targets: [{ kind: "player", player: B }],
      division: [2],
    } as unknown as Action);
    settle(game);
    expect(held.filter((id) => game.state.objects[id].zone === "graveyard")).toHaveLength(2);
    expect(game.state.players[B].life).toBe(life - 2);
    expect(game.state.objects[fire].zone).toBe("exile");
  });
});
