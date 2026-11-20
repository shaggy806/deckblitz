/**
 * A permission's alternative cost "by waterbending {X} rather than paying its
 * mana cost, where X is its mana value" (`PlayTerms.byWaterbending` — Hama,
 * the Bloodbender): {N} for the face cast (rule 118.9), each generic mana of
 * which an untapped artifact or creature the caster controls may pay by
 * tapping (701.67a), the only way the permission lets the card be cast.
 */
import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

import { A, B, cast, destroy, enter, hand, lands, nextTurn, pickFromZone, pickTargets, spawn, table, toLibrary, zone } from "./harness.js";

type CastOffer = Extract<LegalAction, { kind: "cast-spell" }>;
const offers = (game: Game, card: ObjectId, player: PlayerId = A): CastOffer[] =>
  game.legalActions(player).filter((a): a is CastOffer => a.kind === "cast-spell" && a.card === card);
const tapped = (game: Game, id: ObjectId): boolean => game.state.objects[id].tapped === true;

/** Hama enters for alice; bob mills `top` (the last named on top) and alice
 * exiles `pick` from among them. */
function hama(top: readonly string[], pick: string) {
  const t = table();
  const { game, a } = t;
  const milled = top.map((name) => toLibrary(game, name, B));
  const chosen = milled[top.indexOf(pick)];
  pickTargets(a, B);
  const seen = pickFromZone(a, chosen);
  const source = enter(game, "Hama, the Bloodbender");
  return { ...t, source, milled, card: chosen, offered: seen.offered };
}

describe("Hama, the Bloodbender", () => {
  it("mills three and exiles a noncreature, nonland card from among that graveyard", () => {
    const { game, milled, card, offered } = hama(["Grizzly Bears", "Divination", "Island"], "Divination");
    expect(offered).toEqual([card]);
    expect(zone(game, card)).toBe("exile");
    expect(milled.filter((id) => id !== card).map((id) => zone(game, id))).toEqual(["graveyard", "graveyard"]);
  });

  it("casts it by waterbending its mana value, artifacts and creatures tapping for the generic", () => {
    const { game, card } = hama(["Grizzly Bears", "Divination", "Island"], "Divination");
    const thopters = [spawn(game, "Ornithopter"), spawn(game, "Ornithopter"), spawn(game, "Ornithopter")];
    const [offer, ...rest] = offers(game, card);
    expect(rest).toEqual([]);
    expect(offer.altCost).toBe(true);
    expect(offer.altCostText).toBe("waterbend {3}");
    expect(offer.waterbend?.max).toBe(3);
    // Not for its mana cost.
    expect(game.canDispatch({ type: "cast-spell", player: A, card, targets: [], via: "impulse" })).not.toBeNull();
    const before = hand(game).length;
    cast(game, card, { via: "impulse", altCost: true, waterbend: thopters });
    expect(thopters.every((id) => tapped(game, id))).toBe(true);
    expect(hand(game).length).toBe(before + 2);
  });

  it("pays the rest with mana: {3} is generic, so any mana does", () => {
    const { game, card } = hama(["Grizzly Bears", "Divination", "Island"], "Divination");
    const thopter = spawn(game, "Ornithopter");
    const mountains = lands(game, "Mountain", 2);
    cast(game, card, { via: "impulse", altCost: true, waterbend: [thopter] });
    expect([thopter, ...mountains].every((id) => tapped(game, id))).toBe(true);
    expect(zone(game, card)).toBe("graveyard");
  });

  it("only during alice's turn, and only while she controls Hama", () => {
    const { game, card, source } = hama(["Lightning Bolt", "Island", "Island"], "Lightning Bolt");
    spawn(game, "Ornithopter");
    expect(offers(game, card)).toHaveLength(1);
    nextTurn(game); // bob's
    expect(offers(game, card)).toEqual([]);
    nextTurn(game); // alice's
    expect(offers(game, card)).toHaveLength(1);
    destroy(game, source);
    expect(offers(game, card)).toEqual([]);
  });
});
