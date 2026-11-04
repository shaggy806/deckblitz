/**
 * "As an additional cost to cast this spell, you may exile any number of blue
 * cards from your hand. This spell costs {2} less to cast for each card exiled
 * this way" (`additionalCost.exileFromHandReduces` — the March cycle; rules
 * 601.2b, 601.2f, 601.2h): named on the cast's `delve` from its offer's
 * `fromHand`, {2} off the generic part, X's included, never the colored part,
 * and any number may go.
 */
import { describe, expect, it } from "vitest";

import { delvePicks } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import { A, B, cast, graveyard, keywords, lands, life, nextTurn, ref, settle, spawn, table, toGraveyard, toHand, zone } from "./harness.js";

const castOffers = (game: Game, card: ObjectId) =>
  game
    .legalActions(A)
    .filter((o) => o.kind === "cast-spell" && o.card === card) as Extract<
    ReturnType<Game["legalActions"]>[number],
    { kind: "cast-spell" }
  >[];

const dispatchRefusal = (game: Game, card: ObjectId, opts: Parameters<typeof cast>[2]): string => {
  try {
    cast(game, card, opts);
  } catch (error) {
    return (error as Error).message;
  }
  return "";
};

describe("March of Wretched Sorrow", () => {
  it("each card from hand takes {2} off, X's generic included; X stays what was announced", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const giant = spawn(game, "Hill Giant", B);
    const fodder = toHand(game, "Dark Ritual");
    const march = toHand(game, "March of Wretched Sorrow");
    const [offer] = castOffers(game, march);
    // {X}{B}: one mana left for X, and {2} more from the one card.
    expect(offer.xCost?.maxX).toBe(3);
    expect(offer.delve?.fromHand).toEqual({ count: 1, each: 2 });
    expect(offer.delve?.choices).toEqual([fodder]);
    cast(game, march, { targets: [ref(giant)], x: 3, delve: [fodder] });
    expect(zone(game, fodder)).toBe("exile");
    expect(zone(game, giant)).toBe("graveyard");
    expect(life(game, A)).toBe(23);
  });

  it("only cards of its color, never itself or a card elsewhere", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    const bears = spawn(game, "Grizzly Bears", B);
    const green = toHand(game, "Llanowar Elves");
    const land = toHand(game, "Swamp");
    const buried = toGraveyard(game, "Dark Ritual");
    const black = toHand(game, "Dark Ritual");
    const march = toHand(game, "March of Wretched Sorrow");
    expect(castOffers(game, march)[0].delve?.choices).toEqual([black]);
    expect(dispatchRefusal(game, march, { targets: [ref(bears)], x: 2, delve: [green] })).toMatch(/can't be exiled/);
    expect(dispatchRefusal(game, march, { targets: [ref(bears)], x: 2, delve: [land] })).toMatch(/can't be exiled/);
    expect(dispatchRefusal(game, march, { targets: [ref(bears)], x: 2, delve: [buried] })).toMatch(/can't be exiled/);
    expect(dispatchRefusal(game, march, { targets: [ref(bears)], x: 2, delve: [march] })).toMatch(/itself/);
    cast(game, march, { targets: [ref(bears)], x: 2, delve: [black] });
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("never touches the colored part: no black mana, no cast, however many cards", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    spawn(game, "Grizzly Bears", B);
    toHand(game, "Dark Ritual");
    toHand(game, "Dark Ritual");
    const march = toHand(game, "March of Wretched Sorrow");
    expect(castOffers(game, march)).toHaveLength(0);
  });

  it("any number may go past what lowers it, exiled as the cost is paid, on the stack before it resolves", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    const bears = spawn(game, "Grizzly Bears", B);
    const cards = [toHand(game, "Dark Ritual"), toHand(game, "Dark Ritual"), toHand(game, "Dark Ritual")];
    const march = toHand(game, "March of Wretched Sorrow");
    const [offer] = castOffers(game, march);
    // X 1 needs no more than one, but all three may go.
    expect(offer.delve?.byX?.[1]).toEqual({ minCards: 1, maxCards: 3 });
    cast(game, march, { targets: [ref(bears)], x: 1, delve: cards, settle: false });
    expect(zone(game, march)).toBe("stack");
    for (const card of cards) expect(zone(game, card)).toBe("exile");
    settle(game);
    expect(life(game, A)).toBe(21);
  });

  it("not asked for without a matching card, and paid by mana alone with none named", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const bears = spawn(game, "Grizzly Bears", B);
    const march = toHand(game, "March of Wretched Sorrow");
    expect(castOffers(game, march)[0].delve).toBeUndefined();
    cast(game, march, { targets: [ref(bears)], x: 2 });
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("too few cards named for the X: refused, nothing exiled", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    const bears = spawn(game, "Grizzly Bears", B);
    const card = toHand(game, "Dark Ritual");
    const march = toHand(game, "March of Wretched Sorrow");
    expect(dispatchRefusal(game, march, { targets: [ref(bears)], x: 3, delve: [card] })).not.toBe("");
    expect(zone(game, card)).toBe("hand");
  });

  it("a driver names only what mana can't pay", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    spawn(game, "Grizzly Bears", B);
    const first = toHand(game, "Dark Ritual");
    toHand(game, "Dark Ritual");
    const march = toHand(game, "March of Wretched Sorrow");
    const offer = castOffers(game, march)[0].delve!;
    expect(delvePicks(offer, 1, "most")).toBeUndefined();
    expect(delvePicks(offer, 3, "most")).toEqual([first]);
  });

  it("beside delve (Teval): a card from hand leaves delve less to pay", () => {
    const { game } = table();
    spawn(game, "Teval, Arbiter of Virtue");
    lands(game, "Swamp", 1);
    const giant = spawn(game, "Hill Giant", B);
    const fromHand = toHand(game, "Dark Ritual");
    const buried = [toGraveyard(game, "Forest"), toGraveyard(game, "Forest"), toGraveyard(game, "Forest")];
    const march = toHand(game, "March of Wretched Sorrow");
    const [offer] = castOffers(game, march);
    expect(offer.delve?.choices).toEqual([fromHand, ...buried]);
    expect(offer.xCost?.maxX).toBe(5);
    // X 4: {2} from hand leaves two generic, so a third graveyard card is one too many.
    expect(dispatchRefusal(game, march, { targets: [ref(giant)], x: 4, delve: [fromHand, ...buried] })).toMatch(/at most 2/);
    cast(game, march, { targets: [ref(giant)], x: 4, delve: [fromHand, buried[0], buried[1]] });
    expect(zone(game, fromHand)).toBe("exile");
    expect(zone(game, buried[2])).toBe("graveyard");
    expect(zone(game, giant)).toBe("graveyard");
  });
});

describe("March of Swirling Mist", () => {
  it("phases out up to X target creatures, with blue cards from hand paying for X", () => {
    const { game } = table();
    lands(game, "Island", 1);
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Hill Giant", B);
    const card = toHand(game, "Opt");
    const march = toHand(game, "March of Swirling Mist");
    cast(game, march, { targets: [ref(mine), ref(theirs)], x: 2, delve: [card] });
    expect(game.state.objects[mine].phasedOut).toBeTruthy();
    expect(game.state.objects[theirs].phasedOut).toBeTruthy();
    expect(zone(game, card)).toBe("exile");
    expect(graveyard(game, A)).toContain(march);
    // Back before its controller untaps, on their next untap step.
    nextTurn(game);
    expect(game.state.objects[theirs].phasedOut).toBeFalsy();
    expect(keywords(game, theirs).size).toBe(0);
  });

  it("X 0 is just {U}, and targets nothing", () => {
    const { game } = table();
    lands(game, "Island", 1);
    spawn(game, "Grizzly Bears");
    const march = toHand(game, "March of Swirling Mist");
    cast(game, march, { x: 0, targets: [] });
    expect(zone(game, march)).toBe("graveyard");
  });
});

describe("March of Otherworldly Light", () => {
  it("is offered at each X the mana and the cards can reach, and takes what that X allows", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    const giant = spawn(game, "Hill Giant", B);
    const first = toHand(game, "Savannah Lions");
    const second = toHand(game, "Savannah Lions");
    const march = toHand(game, "March of Otherworldly Light");
    const offers = castOffers(game, march);
    // The Giant alone decides: X 4 at the least, and nothing past what the Plains'
    // mana (all for {W}) and two cards reach.
    expect(offers.map((offer) => offer.xCost?.maxX)).toEqual([4]);
    expect(offers.some((offer) => offer.xCost?.maxX === 4)).toBe(true);
    expect(offers.some((offer) => (offer.xCost?.maxX ?? 0) > 4)).toBe(false);
    cast(game, march, { targets: [ref(giant)], x: 4, delve: [first, second] });
    expect(zone(game, giant)).toBe("exile");
    expect(zone(game, first)).toBe("exile");
    expect(zone(game, second)).toBe("exile");
  });

  it("a target past X isn't one", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    const giant = spawn(game, "Hill Giant", B);
    const card = toHand(game, "Savannah Lions");
    const march = toHand(game, "March of Otherworldly Light");
    expect(dispatchRefusal(game, march, { targets: [ref(giant)], x: 2, delve: [card] })).not.toBe("");
    expect(zone(game, giant)).toBe("battlefield");
  });
});
