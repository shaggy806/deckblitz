/**
 * "Dash costs you pay cost {2} less" (Warbringer): a cost modification over
 * casts paying a dash cost (`SpellCastClause.via: "dash"` — rules 702.109a,
 * 601.2f), its colored part untouched, and not for a plain cast or an
 * opponent's dash. A static of a permanent, so not Warbringer's own dash
 * from the hand.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, cast, keywords, lands, spawn, table, toHand, zone } from "./harness.js";

const castOffers = (game: Game, card: ObjectId, via?: "dash") =>
  game.legalActions(A).filter((a) => a.kind === "cast-spell" && a.card === card && (a.via === via || (via === undefined && a.via === undefined)));

describe("Warbringer", () => {
  it("dashes Screamreach Brawler for {R}: its {1} off, the colored mana still owed", () => {
    const { game } = table();
    spawn(game, "Warbringer");
    const brawler = toHand(game, "Screamreach Brawler");
    lands(game, "Mountain", 1);
    expect(castOffers(game, brawler, "dash")).toHaveLength(1);
    expect(castOffers(game, brawler)).toHaveLength(0);
    cast(game, brawler, { via: "dash" });
    expect(zone(game, brawler)).toBe("battlefield");
    expect(keywords(game, brawler).has("haste")).toBe(true);
  });

  it("doesn't reduce its own dash from the hand, or an opponent's Warbringer yours", () => {
    const { game } = table();
    spawn(game, "Warbringer", B);
    const warbringer = toHand(game, "Warbringer");
    const brawler = toHand(game, "Screamreach Brawler");
    lands(game, "Mountain", 1);
    expect(castOffers(game, warbringer, "dash")).toHaveLength(0);
    expect(castOffers(game, brawler, "dash")).toHaveLength(0);
    lands(game, "Mountain", 2);
    expect(castOffers(game, warbringer, "dash")).toHaveLength(1);
  });
});
