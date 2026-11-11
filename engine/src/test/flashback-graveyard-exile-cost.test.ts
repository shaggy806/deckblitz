/**
 * A flashback cost that exiles cards from the caster's graveyard
 * (`flashback.exileFromGraveyard`, rule 702.34a) — Summons of Saruman's
 * "Flashback—{3}{U}{R}, Exile X cards from your graveyard": X announced for
 * that cast though the flashback's mana has none (rule 107.3a), no more than
 * the other cards there (rule 118.3), which ones chosen as the cost is paid
 * (601.2h); a cast from hand pays none of it.
 */
import { describe, expect, it } from "vitest";

import type { Action, LegalAction } from "../actions.js";
import type { ScriptedController } from "../controller.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, cast, lands, pickFromZone, table, toGraveyard, toHand, toLibrary, zone } from "./harness.js";

type CastOffer = Extract<LegalAction, { kind: "cast-spell" }>;

const flashbackOffer = (game: Game, card: ObjectId): CastOffer | undefined =>
  game.legalActions(A).find((a): a is CastOffer => a.kind === "cast-spell" && a.card === card && a.via === "flashback");

/** Answers "you may cast … from among them" with `card` when it's offered. */
function castIfOffered(seat: ScriptedController, card: ObjectId | null) {
  const seen = { offered: [] as (readonly ObjectId[])[] };
  seat.chooseCastNowFn = (_view, offer) => {
    seen.offered.push(offer.cards);
    if (card === null || !offer.cards.includes(card)) return null;
    const way = offer.casts.find((c) => c.card === card)!;
    return { type: "cast-spell", player: seat.playerId, card, targets: [], via: way.via, ...(offer.free ? { free: true } : {}) };
  };
  return seen;
}

const armies = (game: Game): ObjectId[] =>
  Object.values(game.state.objects)
    .filter((o) => o.zone === "battlefield" && o.cardName.includes("Army"))
    .map((o) => o.id);

describe("a flashback cost of exiling X cards from your graveyard", () => {
  it("offers X up to the other cards in the graveyard, and refuses more", () => {
    const { game } = table();
    lands(game, "Island", 3);
    lands(game, "Mountain", 2);
    const summons = toGraveyard(game, "Summons of Saruman");
    // Nothing else there: castable, at X = 0 only (the card can't pay for itself).
    expect(flashbackOffer(game, summons)?.xCost?.maxX).toBe(0);
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Forest");
    expect(flashbackOffer(game, summons)?.xCost?.maxX).toBe(2);
    expect(() =>
      game.dispatch({ type: "cast-spell", player: A, card: summons, via: "flashback", xValue: 3, targets: [] } as Action),
    ).toThrow(/too few cards in their graveyard/);
  });

  it("exiles the X chosen cards as it's cast, and the spell reads that X", () => {
    const { game, a } = table();
    lands(game, "Island", 3);
    lands(game, "Mountain", 2);
    const summons = toGraveyard(game, "Summons of Saruman");
    const one = toGraveyard(game, "Grizzly Bears");
    const two = toGraveyard(game, "Grizzly Bears");
    const three = toGraveyard(game, "Forest");
    // Milled, top first: Opt (mana value 1) and Divination (3, above X).
    toLibrary(game, "Forest");
    const divination = toLibrary(game, "Divination");
    const opt = toLibrary(game, "Opt");
    const picked = pickFromZone(a, one, three);
    const seen = castIfOffered(a, opt);
    cast(game, summons, { via: "flashback", x: 2 });
    expect([...picked.offered].sort()).toEqual([one, two, three].sort());
    expect(zone(game, one)).toBe("exile");
    expect(zone(game, three)).toBe("exile");
    expect(zone(game, two)).toBe("graveyard");
    // Amass Orcs 2.
    const [army] = armies(game);
    expect(army).toBeDefined();
    expect(game.state.objects[army].counters?.["+1/+1"]).toBe(2);
    // Mill 2; only the spell with mana value 2 or less is offered, and cast.
    expect(seen.offered[0]).toEqual([opt]);
    expect(zone(game, divination)).toBe("graveyard");
    expect(zone(game, opt)).toBe("graveyard");
    // Flashback: exiled as it leaves the stack (rule 702.34a).
    expect(zone(game, summons)).toBe("exile");
  });

  it("costs nothing from the graveyard when cast from hand", () => {
    const { game, a } = table();
    lands(game, "Island", 2);
    lands(game, "Mountain", 1);
    const summons = toHand(game, "Summons of Saruman");
    const bears = toGraveyard(game, "Grizzly Bears");
    const milled = toLibrary(game, "Forest");
    castIfOffered(a, null);
    cast(game, summons, { x: 1 });
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, milled)).toBe("graveyard");
    expect(zone(game, summons)).toBe("graveyard");
    const [army] = armies(game);
    expect(game.state.objects[army].counters?.["+1/+1"]).toBe(1);
  });
});
