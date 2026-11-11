/**
 * "A spell with devoid": `hasKeyword: "devoid"`, read off the card's printed
 * line (rule 702.114a: devoid makes the object colorless, which the card's
 * colours already say, so only the line tells it from any other colorless
 * spell). Corrupted Crossroads's "Spend this mana only to cast a spell with
 * devoid" is the card.
 */
import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import { matchesFilter } from "../filter.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, activate, cast, life, lands, spawn, table, toHand, zone } from "./harness.js";

type Cast = Extract<LegalAction, { kind: "cast-spell" }>;

const castable = (game: Game, card: ObjectId): boolean =>
  game.legalActions(A).some((a): a is Cast => a.kind === "cast-spell" && a.card === card);
const devoid = (game: Game, id: ObjectId): boolean =>
  matchesFilter(game.state, game.registry, id, { hasKeyword: "devoid" }, { you: A });

describe("a spell with devoid", () => {
  it("is one whose card prints devoid, not any colorless card", () => {
    const { game } = table();
    expect(devoid(game, toHand(game, "Sludge Crawler"))).toBe(true);
    expect(devoid(game, toHand(game, "Kozilek's Return"))).toBe(true);
    // Colorless, no devoid — an Eldrazi spell among them.
    expect(devoid(game, toHand(game, "Warping Wail"))).toBe(false);
    expect(devoid(game, toHand(game, "Ornithopter"))).toBe(false);
    expect(devoid(game, toHand(game, "Typhoid Rats"))).toBe(false);
  });

  it("Corrupted Crossroads: a life for one mana of any color, for a spell with devoid only", () => {
    const { game } = table();
    spawn(game, "Corrupted Crossroads");
    const crawler = toHand(game, "Sludge Crawler");
    const rats = toHand(game, "Typhoid Rats");
    // {B}: only the second ability makes it, and only for the devoid spell.
    expect(castable(game, rats)).toBe(false);
    expect(castable(game, crawler)).toBe(true);
    cast(game, crawler);
    expect(zone(game, crawler)).toBe("battlefield");
    expect(life(game)).toBe(19);
  });

  it("its restricted mana doesn't pay for a colorless spell without devoid; its {C} does", () => {
    const { game } = table();
    const crossroads = spawn(game, "Corrupted Crossroads");
    const ring = toHand(game, "Sol Ring");
    expect(castable(game, ring)).toBe(true);
    activate(game, crossroads, 1);
    expect(game.state.players[A].manaPool).toHaveLength(1);
    expect(life(game)).toBe(19);
    // The one mana floating is for a spell with devoid.
    expect(castable(game, ring)).toBe(false);
    expect(castable(game, toHand(game, "Sludge Crawler"))).toBe(false); // it's not black unless chosen so
  });

  it("pays the generic part of a devoid spell's cost too", () => {
    const { game } = table();
    spawn(game, "Corrupted Crossroads");
    lands(game, "Island", 1);
    const intruder = toHand(game, "Mist Intruder");
    cast(game, intruder);
    expect(zone(game, intruder)).toBe("battlefield");
  });
});
