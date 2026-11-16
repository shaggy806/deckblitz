/**
 * A mana ability a player has rather than a permanent (rule 605.1a; Channel's
 * "until end of turn, any time you could activate a mana ability, you may pay
 * 1 life. If you do, add {C}"): activated by hand with priority, and reached
 * for by a payment after every permanent (605.3a). Channel, and Yavimaya
 * Bloomsage, whose prepare spell it is.
 */
import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

import { A, B, cast, counters, lands, life, nextTurn, pickTargets, settle, spawn, table, toHand, toStep, zone } from "./harness.js";

type HeldOffer = Extract<LegalAction, { kind: "player-mana-ability" }>;
const heldOffers = (game: Game, player: PlayerId = A): HeldOffer[] =>
  game.legalActions(player).filter((a): a is HeldOffer => a.kind === "player-mana-ability");
const colorless = (game: Game, player: PlayerId = A): number =>
  game.state.players[player].manaPool.filter((u) => u.type === "C").length;
const castable = (game: Game, card: ObjectId): boolean =>
  game.legalActions(A).some((a) => a.kind === "cast-spell" && a.card === card);
/** Channel cast and resolved, paid with two Forests. */
const channelled = (game: Game): void => {
  lands(game, "Forest", 2);
  cast(game, toHand(game, "Channel"));
};

describe("Channel — a mana ability the player has", () => {
  it("is offered with priority once it resolves: 1 life for {C}, as often as there's life to pay", () => {
    const { game } = table();
    expect(heldOffers(game)).toEqual([]);
    channelled(game);
    const [offer] = heldOffers(game);
    expect(offer).toMatchObject({ payLife: 1, mana: ["C"] });
    for (let i = 0; i < 3; i += 1) game.dispatch({ type: "player-mana-ability", player: A, ability: offer.ability });
    expect(life(game)).toBe(17);
    expect(colorless(game)).toBe(3);
    // Bob has none, and it's not his to activate.
    expect(heldOffers(game, B)).toEqual([]);
    expect(game.canDispatch({ type: "player-mana-ability", player: B, ability: 0 })).not.toBeNull();
  });

  it("pays for a spell the permanents can't, a life for each {C}", () => {
    const { game } = table();
    channelled(game);
    const stone = toHand(game, "Mind Stone");
    expect(castable(game, stone)).toBe(true);
    cast(game, stone);
    expect(zone(game, stone)).toBe("battlefield");
    expect(life(game)).toBe(18);
  });

  it("is reached for after the permanents: a land pays first, life the rest", () => {
    const { game } = table();
    channelled(game);
    const [wastes] = lands(game, "Wastes", 1);
    cast(game, toHand(game, "Mind Stone"));
    expect(game.state.objects[wastes].tapped).toBe(true);
    expect(life(game)).toBe(19);
    // With enough lands, no life at all.
    lands(game, "Wastes", 2);
    cast(game, toHand(game, "Mind Stone"));
    expect(life(game)).toBe(19);
  });

  it("pays the generic beside lands paying the coloured pips: Colossal Dreadmaw off two Forests and 4 life", () => {
    const { game } = table();
    channelled(game);
    lands(game, "Forest", 2);
    const dreadmaw = toHand(game, "Colossal Dreadmaw");
    cast(game, dreadmaw);
    expect(zone(game, dreadmaw)).toBe("battlefield");
    expect(life(game)).toBe(16);
  });

  it("makes only {C}: a coloured pip it can't pay", () => {
    const { game } = table();
    channelled(game);
    const bears = toHand(game, "Grizzly Bears");
    expect(castable(game, bears)).toBe(false);
    lands(game, "Forest", 1);
    cast(game, bears);
    expect(zone(game, bears)).toBe("battlefield");
    expect(life(game)).toBe(19);
  });

  it("counts toward an X: Endless One for as much as the life above 1", () => {
    const { game } = table({ life: 6 });
    channelled(game);
    const one = toHand(game, "Endless One");
    const offer = game
      .legalActions(A)
      .find((a): a is Extract<LegalAction, { kind: "cast-spell" }> => a.kind === "cast-spell" && a.card === one);
    expect(offer?.xCost?.maxX).toBe(5);
    cast(game, one, { x: 5 });
    expect(counters(game, one)).toBe(5);
    expect(life(game)).toBe(1);
  });

  it("a payment never pays the last life, but by hand the player may (rule 119.4), and not past 0", () => {
    const { game } = table({ life: 2 });
    channelled(game);
    expect(castable(game, toHand(game, "Mind Stone"))).toBe(false);
    const sol = toHand(game, "Sol Ring");
    cast(game, sol);
    expect(life(game)).toBe(1);
    game.dispatch({ type: "player-mana-ability", player: A, ability: 0 });
    expect(colorless(game)).toBe(1);
    expect(life(game)).toBe(0);
    // A state-based action as she next would get priority (rule 704.5a).
    expect(game.state.players[A].hasLost).toBe(true);
  });

  it("isn't there while the player can't lose life (rule 119.8)", () => {
    const { game } = table();
    spawn(game, "Platinum Emperion");
    channelled(game);
    expect(heldOffers(game)).toEqual([]);
    expect(castable(game, toHand(game, "Sol Ring"))).toBe(false);
  });

  it("lasts until end of turn", () => {
    const { game } = table();
    channelled(game);
    expect(heldOffers(game)).toHaveLength(1);
    nextTurn(game);
    expect(heldOffers(game, B)).toEqual([]);
    nextTurn(game);
    expect(heldOffers(game)).toEqual([]);
  });

  it("two Channels in a turn are one offer", () => {
    const { game } = table();
    channelled(game);
    channelled(game);
    expect(heldOffers(game)).toHaveLength(1);
  });
});

describe("Yavimaya Bloomsage", () => {
  it("puts a +1/+1 counter on its target at your end step; at power 7 it becomes prepared, and the copy is Channel", () => {
    const { game, a } = table();
    const sage = spawn(game, "Yavimaya Bloomsage");
    const dreadmaw = spawn(game, "Colossal Dreadmaw");
    pickTargets(a, dreadmaw);
    toStep(game, "end");
    settle(game);
    expect(counters(game, dreadmaw)).toBe(1);
    expect(game.state.objects[sage].prepared).toBeDefined();
    const copy = game.state.objects[sage].prepared!.copy;
    expect(game.state.objects[copy].cardName).toBe("Channel");
  });

  it("doesn't below power 7", () => {
    const { game, a } = table();
    const sage = spawn(game, "Yavimaya Bloomsage");
    pickTargets(a, sage);
    toStep(game, "end");
    settle(game);
    expect(counters(game, sage)).toBe(1);
    expect(game.state.objects[sage].prepared).toBeUndefined();
  });

  it("its copy of Channel gives the mana ability", () => {
    const { game, a } = table();
    const sage = spawn(game, "Yavimaya Bloomsage");
    const dreadmaw = spawn(game, "Colossal Dreadmaw");
    pickTargets(a, dreadmaw);
    toStep(game, "end");
    settle(game);
    nextTurn(game);
    nextTurn(game);
    lands(game, "Forest", 2);
    cast(game, game.state.objects[sage].prepared!.copy, { via: "prepared" });
    expect(game.state.objects[sage].prepared).toBeUndefined();
    expect(heldOffers(game)).toHaveLength(1);
  });
});
