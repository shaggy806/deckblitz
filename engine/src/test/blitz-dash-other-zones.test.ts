/**
 * Blitz and dash from a zone a permission lets the card be cast from (rules
 * 702.152a, 702.109a: "you may cast this card by paying [cost] rather than
 * its mana cost", wherever that is): an impulse exile, a graveyard grant, the
 * top of a library. There each is one more alternative cost of the
 * permission's cast (`altCost`), and the spell is blitzed or dashed all the
 * same.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import type { GameState } from "../state.js";
import { A, cast, hand, keywords, lands, spawn, table, toGraveyard, toLibrary, zone } from "./harness.js";

/** Bob's upkeep: alice's end step has passed. */
const bobsUpkeep = (s: GameState): boolean => s.turn.number === 2 && s.turn.step === "upkeep";

/** The offers to cast `card` for an alternative cost, by what each says. */
const altOffers = (game: Game, card: ObjectId) =>
  game
    .legalActions(A)
    .flatMap((a) => (a.kind === "cast-spell" && a.card === card && a.altCost === true ? [a] : []));

const impulse = (game: Game): void => {
  game.debugApplyEffect(A, { kind: "impulse-exile", amount: 1, duration: "end-of-turn", play: true });
};

describe("blitz and dash from another zone", () => {
  it("dashes a card exiled with permission to play it: haste, back to hand at the end step", () => {
    const { game } = table();
    const brawler = toLibrary(game, "Screamreach Brawler");
    lands(game, "Mountain", 2);
    impulse(game);
    expect(zone(game, brawler)).toBe("exile");
    const [offer] = altOffers(game, brawler);
    expect(offer).toMatchObject({ via: "impulse", altCostText: "dash {1}{R}" });
    cast(game, brawler, { via: "impulse", altCost: true, ...(offer.altCostIndex !== undefined ? { altCostIndex: offer.altCostIndex } : {}) });
    expect(zone(game, brawler)).toBe("battlefield");
    expect(keywords(game, brawler).has("haste")).toBe(true);
    game.advanceUntil(bobsUpkeep);
    expect(hand(game)).toContain(brawler);
  });

  it("isn't offered there without the mana for it, and a cast for its mana cost isn't dashed", () => {
    const { game } = table();
    const brawler = toLibrary(game, "Screamreach Brawler");
    lands(game, "Mountain", 1);
    impulse(game);
    expect(altOffers(game, brawler)).toHaveLength(0);
    lands(game, "Mountain", 2);
    cast(game, brawler, { via: "impulse" });
    expect(keywords(game, brawler).has("haste")).toBe(false);
    game.advanceUntil(bobsUpkeep);
    expect(zone(game, brawler)).toBe("battlefield");
  });

  it("blitzes a card from the graveyard under Muldrotha: haste, sacrificed at the end step, a card drawn", () => {
    const { game } = table();
    spawn(game, "Muldrotha, the Gravetide");
    const mugger = toGraveyard(game, "Mezzio Mugger");
    lands(game, "Mountain", 3);
    const offer = altOffers(game, mugger).find((a) => a.altCostText?.startsWith("blitz") === true);
    expect(offer).toMatchObject({ via: "graveyard-permission" });
    cast(game, mugger, {
      via: "graveyard-permission",
      altCost: true,
      ...(offer?.altCostIndex !== undefined ? { altCostIndex: offer.altCostIndex } : {}),
      ...(offer?.graveyardGrant !== undefined ? { graveyardGrant: offer.graveyardGrant } : {}),
    });
    expect(zone(game, mugger)).toBe("battlefield");
    expect(keywords(game, mugger).has("haste")).toBe(true);
    const before = hand(game).length;
    game.advanceUntil(bobsUpkeep);
    expect(zone(game, mugger)).toBe("graveyard");
    expect(hand(game).length).toBe(before + 1);
  });

  it("dashes the top card of the library under Future Sight", () => {
    const { game } = table();
    spawn(game, "Future Sight");
    const brawler = toLibrary(game, "Screamreach Brawler");
    lands(game, "Mountain", 2);
    const [offer] = altOffers(game, brawler);
    expect(offer).toMatchObject({ via: "library-top", altCostText: "dash {1}{R}" });
    cast(game, brawler, { via: "library-top", altCost: true });
    expect(keywords(game, brawler).has("haste")).toBe(true);
    game.advanceUntil(bobsUpkeep);
    expect(hand(game)).toContain(brawler);
  });

  it("Henzie's granted blitz reaches a creature spell cast from exile", () => {
    const { game } = table();
    spawn(game, 'Henzie "Toolbox" Torre');
    const giant = toLibrary(game, "Hill Giant");
    lands(game, "Mountain", 4);
    impulse(game);
    const [offer] = altOffers(game, giant);
    expect(offer).toMatchObject({ via: "impulse", altCostText: "blitz {3}{R}" });
    cast(game, giant, { via: "impulse", altCost: true });
    expect(keywords(game, giant).has("haste")).toBe(true);
    game.advanceUntil(bobsUpkeep);
    expect(zone(game, giant)).toBe("graveyard");
  });
});
