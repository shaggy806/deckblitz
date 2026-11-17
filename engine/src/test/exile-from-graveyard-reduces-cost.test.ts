/**
 * An additional cost of exiling any number of cards from your graveyard, each
 * taking some of the cost off (`additionalCost.exileFromGraveyard` of `"x"`
 * cards with `reducesPerX`): Gorex, the Tombshell's "you may exile any number
 * of creature cards from your graveyard. This spell costs {2} less to cast for
 * each card exiled this way". How many is announced as it's cast (rule
 * 601.2b), each taking {2} off the generic part only (601.2f — never below
 * {B}{B}), any number up to the creature cards there even past what lowers it
 * further (the rulings); which ones is chosen as it's paid (601.2h), and
 * they're exiled with the permanent it becomes (607.2a), one at random handed
 * back as it attacks or dies.
 */
import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, attack, cast, destroy, hand, lands, nextTurn, pickFromZone, table, toGraveyard, toHand, zone } from "./harness.js";

type CastOffer = Extract<LegalAction, { kind: "cast-spell" }>;
const castOffers = (game: Game, card: ObjectId): CastOffer[] =>
  game.legalActions(A).filter((x): x is CastOffer => x.kind === "cast-spell" && x.card === card);

describe("Gorex, the Tombshell", () => {
  it("the fewest and most creature cards that pay; each takes {2} off; which ones is chosen", () => {
    const { game, a } = table();
    lands(game, "Swamp", 4);
    const creatures = [0, 1, 2, 3].map(() => toGraveyard(game, "Grizzly Bears"));
    const land = toGraveyard(game, "Swamp");
    const gorex = toHand(game, "Gorex, the Tombshell");
    const [offer] = castOffers(game, gorex);
    // {6}{B}{B} with four Swamps: two cards leave {2}{B}{B}; all four, {B}{B}.
    expect(offer?.xCost).toEqual({ maxX: 4, minX: 2 });
    expect(() => cast(game, gorex, { x: 1 })).toThrow(/cannot pay/);
    const seen = pickFromZone(a, creatures[0], creatures[2]);
    cast(game, gorex, { x: 2 });
    expect([...seen.offered].sort()).toEqual([...creatures].sort());
    expect(seen.offered).not.toContain(land);
    expect(zone(game, gorex)).toBe("battlefield");
    expect(creatures.map((id) => zone(game, id))).toEqual(["exile", "graveyard", "exile", "graveyard"]);
    expect(game.state.players[A].manaPool.length).toBe(0);
    expect(game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].tapped).length).toBe(4);
  });

  it("any number may go, even past what lowers the cost further — never below {B}{B}", () => {
    const { game, a } = table();
    lands(game, "Swamp", 2);
    const creatures = [0, 1, 2, 3, 4].map(() => toGraveyard(game, "Grizzly Bears"));
    const gorex = toHand(game, "Gorex, the Tombshell");
    const [offer] = castOffers(game, gorex);
    expect(offer?.xCost).toEqual({ maxX: 5, minX: 3 });
    pickFromZone(a, ...creatures);
    cast(game, gorex, { x: 5 });
    expect(zone(game, gorex)).toBe("battlefield");
    expect(creatures.every((id) => zone(game, id) === "exile")).toBe(true);
  });

  it("with mana enough, none need go; with too few creature cards, it can't be cast", () => {
    const { game } = table();
    lands(game, "Swamp", 8);
    toGraveyard(game, "Grizzly Bears");
    const gorex = toHand(game, "Gorex, the Tombshell");
    expect(castOffers(game, gorex)[0]?.xCost).toEqual({ maxX: 1 });
    cast(game, gorex, { x: 0 });
    expect(zone(game, gorex)).toBe("battlefield");

    const short = table();
    lands(short.game, "Swamp", 3);
    toGraveyard(short.game, "Grizzly Bears");
    toGraveyard(short.game, "Island");
    const second = toHand(short.game, "Gorex, the Tombshell");
    // One creature card leaves {4}{B}{B}: not with three Swamps.
    expect(castOffers(short.game, second)).toEqual([]);
  });

  it("attacking and dying, a card exiled with it goes back to its owner's hand at random", () => {
    const { game, a } = table();
    lands(game, "Swamp", 2);
    const creatures = [0, 1, 2].map(() => toGraveyard(game, "Grizzly Bears"));
    const gorex = toHand(game, "Gorex, the Tombshell");
    pickFromZone(a, ...creatures);
    cast(game, gorex, { x: 3 });
    // A card exiled some other way isn't one of them.
    const other = toGraveyard(game, "Hill Giant");
    game.debugApplyEffect(A, { kind: "exile", target: 0 }, [{ kind: "object", object: other }]);
    nextTurn(game);
    nextTurn(game);
    attack(game, a, [gorex]);
    const back = creatures.filter((id) => zone(game, id) === "hand");
    expect(back.length).toBe(1);
    expect(hand(game, A)).toContain(back[0]);
    destroy(game, gorex, B);
    expect(zone(game, gorex)).toBe("graveyard");
    expect(creatures.filter((id) => zone(game, id) === "hand").length).toBe(2);
    expect(zone(game, other)).toBe("exile");
  });
});
