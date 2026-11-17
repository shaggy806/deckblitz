/**
 * "Return two creature cards at random from your graveyard to the
 * battlefield" (Moldgraf Monstrosity), "return X cards at random from your
 * graveyard to your hand" (Reap the Past): `choose-random-card`'s `count` —
 * that many different cards picked at random as it resolves, moved together.
 */

import { describe, expect, it } from "vitest";

import type { ScriptedController } from "../controller.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  cast,
  destroy,
  enter,
  graveyard,
  hand,
  lands,
  pickFromZone,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  tokensNamed,
  zone,
} from "./harness.js";

const entries = (game: Game, since: number): ObjectId[] =>
  game.state.eventLog.flatMap((e) => (e.seq >= since && e.type === "permanent-entered-battlefield" ? [e.object] : []));

/** Cast the first copy each cast-now offer holds; what was cast. */
function castCopies(seat: ScriptedController): ObjectId[] {
  const made: ObjectId[] = [];
  seat.chooseCastNowFn = (_view, offer) => {
    if (offer.casts.length === 0) return null;
    const way = offer.casts[0];
    made.push(way.card);
    return { type: "cast-spell", player: seat.playerId, card: way.card, targets: [], via: way.via, ...(offer.free ? { free: true } : {}) };
  };
  return made;
}

describe("cards at random from a graveyard", () => {
  it("Moldgraf Monstrosity: exiled, then two different creature cards return at random, together", () => {
    const { game } = table();
    const moldgraf = spawn(game, "Moldgraf Monstrosity");
    const creatures = [toGraveyard(game, "Grizzly Bears"), toGraveyard(game, "Hill Giant"), toGraveyard(game, "Gray Ogre")];
    const bolt = toGraveyard(game, "Lightning Bolt");
    const since = game.state.eventSeq;
    destroy(game, moldgraf);
    settle(game);
    expect(zone(game, moldgraf)).toBe("exile");
    const back = creatures.filter((id) => zone(game, id) === "battlefield");
    expect(back).toHaveLength(2);
    expect(zone(game, bolt)).toBe("graveyard");
    expect(new Set(entries(game, since))).toEqual(new Set(back));
  });

  it("Moldgraf Monstrosity: with one creature card there, that one returns", () => {
    const { game } = table();
    const moldgraf = spawn(game, "Moldgraf Monstrosity");
    const bears = toGraveyard(game, "Grizzly Bears");
    destroy(game, moldgraf);
    settle(game);
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, moldgraf)).toBe("exile");
  });

  it("Moldgraf Monstrosity: the picks vary with the seed, each pair possible", () => {
    const seen = new Set<string>();
    for (let seed = 1; seed <= 24; seed += 1) {
      const { game } = table({ seed });
      const moldgraf = spawn(game, "Moldgraf Monstrosity");
      const names = ["Grizzly Bears", "Hill Giant", "Gray Ogre"];
      for (const name of names) toGraveyard(game, name);
      destroy(game, moldgraf);
      settle(game);
      seen.add(
        game.battlefield
          .map((id) => game.state.objects[id].cardName)
          .filter((n) => names.includes(n))
          .sort()
          .join("+"),
      );
    }
    expect(seen.size).toBe(3);
  });

  it("Reap the Past: X different cards to your hand, then it's exiled", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    lands(game, "Forest", 2);
    const cards = [toGraveyard(game, "Grizzly Bears"), toGraveyard(game, "Lightning Bolt"), toGraveyard(game, "Shock")];
    const reap = toHand(game, "Reap the Past");
    const before = hand(game).length;
    cast(game, reap, { x: 2 });
    expect(cards.filter((id) => zone(game, id) === "hand")).toHaveLength(2);
    expect(hand(game).length).toBe(before - 1 + 2);
    expect(zone(game, reap)).toBe("exile");
    expect(graveyard(game).filter((id) => cards.includes(id))).toHaveLength(1);
  });

  it("Make a Wish: the two leave the graveyard as one event (rule 603.2c)", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    spawn(game, "Tormod, the Desecrator");
    const cards = [toGraveyard(game, "Grizzly Bears"), toGraveyard(game, "Lightning Bolt"), toGraveyard(game, "Shock")];
    cast(game, toHand(game, "Make a Wish"));
    settle(game);
    expect(cards.filter((id) => zone(game, id) === "hand")).toHaveLength(2);
    expect(tokensNamed(game, "Zombie Token", A)).toBe(1);
  });
});

describe("Capricious Hellraiser", () => {
  it("exiles three at random together, and casts a copy of the noncreature, nonland one chosen", () => {
    const { game, a } = table();
    spawn(game, "Tormod, the Desecrator");
    const divination = toGraveyard(game, "Divination");
    const others = [toGraveyard(game, "Grizzly Bears"), toGraveyard(game, "Forest")];
    const picked = pickFromZone(a, divination);
    const made = castCopies(a);
    const before = hand(game).length;
    enter(game, "Capricious Hellraiser");
    expect([divination, ...others].map((id) => zone(game, id))).toEqual(["exile", "exile", "exile"]);
    // One leave for the three (Tormod), and only the sorcery to choose.
    expect(tokensNamed(game, "Zombie Token", A)).toBe(1);
    expect(picked.offered).toEqual([divination]);
    expect(made).toHaveLength(1);
    expect(made[0]).not.toBe(divination);
    expect(hand(game).length).toBe(before + 2);
  });

  it("takes three of a larger graveyard, and only one of them is copied", () => {
    const { game, a } = table();
    const cards = ["Divination", "Shock", "Lightning Bolt", "Counsel of the Soratami", "Grizzly Bears"].map((n) => toGraveyard(game, n));
    const seen = { offered: [] as readonly ObjectId[] };
    a.chooseFromZoneFn = (_view, eligible) => {
      seen.offered = eligible;
      return eligible.slice(0, 1);
    };
    const made = castCopies(a);
    enter(game, "Capricious Hellraiser");
    const exiled = cards.filter((id) => zone(game, id) === "exile");
    expect(exiled).toHaveLength(3);
    expect(seen.offered.every((id) => exiled.includes(id))).toBe(true);
    expect(made.length).toBeLessThanOrEqual(1);
  });

  it("has nothing to copy among creature and land cards, an adventurer creature card among them", () => {
    const { game, a } = table();
    const cards = [toGraveyard(game, "Bonecrusher Giant"), toGraveyard(game, "Grizzly Bears"), toGraveyard(game, "Forest")];
    const picked = pickFromZone(a);
    const made = castCopies(a);
    enter(game, "Capricious Hellraiser");
    expect(cards.map((id) => zone(game, id))).toEqual(["exile", "exile", "exile"]);
    expect(picked.offered).toEqual([]);
    expect(made).toEqual([]);
    expect(game.state.zones.shared.stack).toEqual([]);
  });

  it("costs {3} less with nine cards in your graveyard", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const dragon = toHand(game, "Capricious Hellraiser");
    for (let i = 0; i < 8; i += 1) toGraveyard(game, "Grizzly Bears");
    expect(game.legalActions(A).some((a) => a.kind === "cast-spell" && a.card === dragon)).toBe(false);
    toGraveyard(game, "Grizzly Bears");
    expect(game.legalActions(A).some((a) => a.kind === "cast-spell" && a.card === dragon)).toBe(true);
  });
});
