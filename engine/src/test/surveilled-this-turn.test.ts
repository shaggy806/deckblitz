/**
 * "Cards in your graveyard you've surveilled this turn" (Eye of Duskmantle):
 * the journal's `surveilled` word — `to-graveyard` entries a surveil wrote
 * (rule 701.25a) — read by a `journaled` clause on a graveyard permission
 * paid for with life (rule 118.9). Its rulings: a card seen while surveilling,
 * left on top and put into the graveyard later by other means isn't one; X
 * is 0.
 */
import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, cast, lands, life, ref, spawn, table, toGraveyard, toLibrary, toStep, zone } from "./harness.js";

type CastOffer = Extract<LegalAction, { kind: "cast-spell" }>;
const castOffers = (game: Game, card: ObjectId, player: PlayerId = A): CastOffer[] =>
  game.legalActions(player).filter((a): a is CastOffer => a.kind === "cast-spell" && a.card === card);
const landOffers = (game: Game, card: ObjectId, player: PlayerId = A): LegalAction[] =>
  game.legalActions(player).filter((a) => a.kind === "play-land" && a.card === card);

/** Alice surveils as many cards as `cards`, which are on top of her library,
 * putting `away` of them into her graveyard. */
function surveil(game: Game, count: number, away: readonly ObjectId[], player: PlayerId = A): void {
  game.debugApplyEffect(player, { kind: "surveil", amount: count });
  game.dispatch({ type: "scry", player, away });
}

describe("Eye of Duskmantle — cards you've surveilled this turn", () => {
  it("casts a card surveilled into the graveyard this turn, for life equal to its mana value", () => {
    const { game } = table();
    spawn(game, "Eye of Duskmantle");
    // toLibrary puts each on top: the dreadmaw ends up second, the bears on top.
    const dreadmaw = toLibrary(game, "Colossal Dreadmaw");
    const bears = toLibrary(game, "Grizzly Bears");
    surveil(game, 2, [bears, dreadmaw]);
    expect(zone(game, bears)).toBe("graveyard");
    const [offer, ...rest] = castOffers(game, dreadmaw);
    expect(rest).toEqual([]);
    expect(offer.via).toBe("graveyard-permission");
    expect(offer.altCostText).toBe("pay 6 life");
    cast(game, dreadmaw, { via: "graveyard-permission", altCost: true });
    expect(zone(game, dreadmaw)).toBe("battlefield");
    expect(life(game, A)).toBe(14);
    expect(castOffers(game, bears).map((o) => o.altCostText)).toEqual(["pay 2 life"]);
  });

  it("only for the life, not its mana cost, with lands to pay it; an X spell with X 0", () => {
    const { game } = table();
    spawn(game, "Eye of Duskmantle");
    const forests = lands(game, "Forest", 4);
    lands(game, "Mountain", 4);
    const blaze = toLibrary(game, "Blaze");
    const bears = toLibrary(game, "Grizzly Bears");
    surveil(game, 2, [bears, blaze]);
    expect(castOffers(game, bears).map((o) => o.altCostText)).toEqual(["pay 2 life"]);
    expect(game.canDispatch({ type: "cast-spell", player: A, card: bears, targets: [], via: "graveyard-permission" })).toMatch(
      /only by paying life/,
    );
    cast(game, bears, { via: "graveyard-permission", altCost: true });
    expect(life(game, A)).toBe(18);
    expect(forests.some((id) => game.state.objects[id].tapped === true)).toBe(false);
    const [offer] = castOffers(game, blaze);
    expect(offer.altCostText).toBe("pay 1 life");
    expect(offer.xCost).toBeUndefined();
    cast(game, blaze, { via: "graveyard-permission", altCost: true, targets: [ref(B)] });
    expect(life(game, A)).toBe(17);
    expect(life(game, B)).toBe(20);
  });

  it("plays a land surveilled into the graveyard this turn", () => {
    const { game } = table();
    spawn(game, "Eye of Duskmantle");
    const forest = toLibrary(game, "Forest");
    surveil(game, 1, [forest]);
    expect(landOffers(game, forest)).toHaveLength(1);
    game.dispatch({ type: "play-land", player: A, card: forest });
    expect(zone(game, forest)).toBe("battlefield");
  });

  it("not a card put into the graveyard some other way, nor one left on top and milled later", () => {
    const { game } = table();
    spawn(game, "Eye of Duskmantle");
    const discarded = toGraveyard(game, "Grizzly Bears");
    const kept = toLibrary(game, "Hill Giant");
    surveil(game, 1, []);
    expect(zone(game, kept)).toBe("library");
    game.debugApplyEffect(A, { kind: "mill", target: "you", amount: 1 });
    expect(zone(game, kept)).toBe("graveyard");
    expect(castOffers(game, kept)).toEqual([]);
    expect(castOffers(game, discarded)).toEqual([]);
  });

  it("only this turn: a card surveilled last turn isn't one", () => {
    const { game } = table();
    spawn(game, "Eye of Duskmantle");
    const bears = toLibrary(game, "Grizzly Bears");
    surveil(game, 1, [bears]);
    expect(castOffers(game, bears)).toHaveLength(1);
    toStep(game, "precombat-main", A);
    expect(game.state.turn.number).toBe(3);
    expect(zone(game, bears)).toBe("graveyard");
    expect(castOffers(game, bears)).toEqual([]);
  });

  it("a card that left the graveyard and came back is a new object, not surveilled", () => {
    const { game } = table();
    spawn(game, "Eye of Duskmantle");
    const bears = toLibrary(game, "Grizzly Bears");
    surveil(game, 1, [bears]);
    game.debugMove(bears, "exile");
    game.debugMove(bears, "graveyard");
    expect(castOffers(game, bears)).toEqual([]);
  });

  it("only its controller's own: an opponent's surveilled card isn't", () => {
    const { game } = table();
    spawn(game, "Eye of Duskmantle");
    const theirs = toLibrary(game, "Grizzly Bears", B);
    surveil(game, 1, [theirs], B);
    expect(zone(game, theirs)).toBe("graveyard");
    expect(castOffers(game, theirs)).toEqual([]);
    // Without the Eye, nothing at all.
    const { game: bare } = table();
    const mine = toLibrary(bare, "Grizzly Bears");
    surveil(bare, 1, [mine]);
    expect(castOffers(bare, mine)).toEqual([]);
  });
});
