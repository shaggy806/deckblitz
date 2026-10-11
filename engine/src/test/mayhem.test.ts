/**
 * Mayhem (rule 702.187): "As long as you discarded this card this turn, you
 * may cast it from your graveyard by paying [cost] rather than its mana cost"
 * (702.187a) — an alternative cost; a cost-less mayhem card is played from
 * your graveyard instead (702.187c). "Discarded this turn" is the card that
 * was put there by a discard this turn: a new object after any other zone
 * change (400.7).
 */
import { describe, expect, it } from "vitest";

import type { ScriptedController } from "../controller.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

import { A, B, cast, graveyard, lands, life, nextTurn, pt, settle, spawn, table, toGraveyard, toHand, toStep } from "./harness.js";

/** `seat`'s player discards `card` (from a hand of Wastes besides). */
const discard = (game: Game, seat: ScriptedController, card: ObjectId): void => {
  seat.chooseDiscardsFn = () => [card];
  game.debugApplyEffect(seat.playerId, { kind: "discard", target: "you", amount: 1 });
  settle(game);
};
const castOffers = (game: Game, card: ObjectId, player: PlayerId = A) =>
  game.legalActions(player).filter((a) => a.kind === "cast-spell" && a.card === card);

describe("mayhem", () => {
  it("a card discarded this turn is cast from the graveyard for its mayhem cost", () => {
    const { game, a } = table();
    const abomination = toHand(game, "Abomination, World Ravager");
    discard(game, a, abomination);
    expect(graveyard(game)).toContain(abomination);
    // {4}{R}, not {7}{R}: five lands pay it.
    lands(game, "Mountain", 5);
    const offers = castOffers(game, abomination);
    expect(offers).toHaveLength(1);
    expect(offers[0]).toMatchObject({ via: "mayhem" });
    cast(game, abomination, { via: "mayhem" });
    expect(game.state.objects[abomination].zone).toBe("battlefield");
  });

  it("not a card put into the graveyard some other way, nor one discarded on an earlier turn", () => {
    const { game, a } = table();
    lands(game, "Mountain", 5);
    const milled = toGraveyard(game, "Abomination, World Ravager");
    expect(castOffers(game, milled)).toHaveLength(0);
    const discarded = toHand(game, "Abomination, World Ravager");
    discard(game, a, discarded);
    expect(castOffers(game, discarded)).toHaveLength(1);
    nextTurn(game);
    toStep(game, "precombat-main", A);
    expect(castOffers(game, discarded)).toHaveLength(0);
  });

  it("timing rules still apply: a creature isn't cast on an opponent's turn", () => {
    const { game, a } = table();
    toStep(game, "precombat-main", B);
    const card = toHand(game, "Abomination, World Ravager");
    discard(game, a, card);
    lands(game, "Mountain", 5);
    expect(castOffers(game, card)).toHaveLength(0);
  });

  it("only its owner may cast it", () => {
    const { game, a } = table();
    const card = toHand(game, "Abomination, World Ravager");
    discard(game, a, card);
    lands(game, "Mountain", 5, B);
    expect(castOffers(game, card, B)).toHaveLength(0);
  });

  it("a cost-less mayhem land is played from the graveyard, and enters from a graveyard", () => {
    const { game, a } = table();
    const oscorp = toHand(game, "Oscorp Industries");
    discard(game, a, oscorp);
    expect(castOffers(game, oscorp)).toHaveLength(0);
    const play = game.legalActions(A).find((a) => a.kind === "play-land" && a.card === oscorp);
    expect(play).toBeDefined();
    game.dispatch({ type: "play-land", player: A, card: oscorp });
    toStep(game, "begin-combat");
    expect(game.state.objects[oscorp].zone).toBe("battlefield");
    expect(game.state.objects[oscorp].tapped).toBe(true);
    expect(life(game)).toBe(18);
  });

  it("Chameleon, Master of Disguise cast with mayhem may enter as a copy of a creature you control", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Llanowar Elves", B);
    let offered: readonly ObjectId[] = [];
    a.chooseCopyFn = (_view, _source, options) => {
      offered = options;
      return bears;
    };
    const chameleon = toHand(game, "Chameleon, Master of Disguise");
    discard(game, a, chameleon);
    lands(game, "Island", 3);
    cast(game, chameleon, { via: "mayhem" });
    // Only a creature you control is offered; the copy keeps his name.
    expect(offered).toEqual([bears]);
    const object = game.state.objects[chameleon];
    expect(object.zone).toBe("battlefield");
    expect(object.copyOf).toBe("Grizzly Bears");
    expect(pt(game, chameleon)).toEqual({ power: 2, toughness: 2 });
    expect(game.viewFor(A).objects[chameleon]?.name).toBe("Chameleon, Master of Disguise");
  });
});
