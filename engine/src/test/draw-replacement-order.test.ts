/**
 * The drawing player orders the replacements of their draw (rule 616.1): an opponent's Notion
 * Thief, which hands the draw on, against an effect that replaces it — Living Conundrum's "skip
 * that draw" from an empty library, Underrealm Lich's look at three. Whichever applies first
 * decides whether the other does at all (`Game.drawRedirectOrderAsked`). Against Laboratory
 * Maniac's win the order changes nothing worth asking: the engine takes the win.
 */
import { describe, expect, it } from "vitest";

import type { ReplacementOrderOffer } from "../controller.js";
import type { ScriptedController } from "../controller.js";

import { A, B, cast, hand, keywords, lands, nextTurn, pt, spawn, table, toHand, toLibrary } from "./harness.js";

/** Answers each draw-order question with the option made by `name`. */
function chooseFirst(seat: ScriptedController, name: string): ReplacementOrderOffer[] {
  const asked: ReplacementOrderOffer[] = [];
  seat.chooseReplacementOrderFn = (_view, offer) => {
    asked.push(offer);
    return Math.max(0, offer.options.findIndex((o) => o.name === name));
  };
  return asked;
}

describe("Living Conundrum", () => {
  it("skips a draw from an empty library, so nothing is lost, and is a 10/10 flier with vigilance while it's empty", () => {
    const { game } = table();
    const conundrum = spawn(game, "Living Conundrum");
    lands(game, "Island", 3);
    const spell = toHand(game, "Divination");
    expect(pt(game, conundrum)).toEqual({ power: 2, toughness: 5 });
    game.state.zones.perPlayer[A].library = [];
    const before = hand(game).length;
    cast(game, spell);
    expect(hand(game)).toHaveLength(before - 1);
    expect(game.state.result.over).toBe(false);
    expect(pt(game, conundrum)).toEqual({ power: 10, toughness: 10 });
    expect(keywords(game, conundrum).has("flying")).toBe(true);
    expect(keywords(game, conundrum).has("vigilance")).toBe(true);
    // The turn's draw too.
    nextTurn(game);
    nextTurn(game);
    expect(game.state.result.over).toBe(false);
  });

  it("leaves a draw from a library with cards alone", () => {
    const { game } = table();
    const conundrum = spawn(game, "Living Conundrum");
    lands(game, "Island", 3);
    const spell = toHand(game, "Divination");
    const before = hand(game).length;
    cast(game, spell);
    expect(hand(game)).toHaveLength(before + 1);
    expect(pt(game, conundrum)).toEqual({ power: 2, toughness: 5 });
  });

  it("against an opponent's Notion Thief, the drawing player may skip first: the Thief gets nothing", () => {
    const { game, a } = table();
    spawn(game, "Living Conundrum");
    spawn(game, "Notion Thief", B);
    lands(game, "Island", 3);
    const spell = toHand(game, "Divination");
    game.state.zones.perPlayer[A].library = [];
    const theirs = hand(game, B).length;
    const asked = chooseFirst(a, "Living Conundrum");
    cast(game, spell);
    expect(asked).toHaveLength(2);
    expect(asked[0].options.map((o) => o.name)).toEqual(["Notion Thief", "Living Conundrum"]);
    expect(hand(game, B).length).toBe(theirs);
    expect(game.state.result.over).toBe(false);
  });

  it("is asked about every card of the draw though the Thief's controller's library is empty too", () => {
    const { game, a } = table();
    spawn(game, "Living Conundrum");
    spawn(game, "Notion Thief", B);
    lands(game, "Island", 3);
    const spell = toHand(game, "Divination");
    game.state.zones.perPlayer[A].library = [];
    game.state.zones.perPlayer[B].library = [];
    const asked = chooseFirst(a, "Living Conundrum");
    cast(game, spell);
    expect(asked).toHaveLength(2);
    expect(game.state.result.over).toBe(false);
  });

  it("or let the Thief apply first: its controller draws each card", () => {
    const { game, a } = table();
    spawn(game, "Living Conundrum");
    spawn(game, "Notion Thief", B);
    lands(game, "Island", 3);
    const spell = toHand(game, "Divination");
    game.state.zones.perPlayer[A].library = [];
    const theirs = hand(game, B).length;
    chooseFirst(a, "Notion Thief");
    cast(game, spell);
    expect(hand(game, B).length).toBe(theirs + 2);
    expect(game.state.result.over).toBe(false);
  });

  it("beside Laboratory Maniac, the draw from an empty library wins", () => {
    const { game } = table();
    spawn(game, "Living Conundrum");
    spawn(game, "Laboratory Maniac");
    lands(game, "Island", 3);
    const spell = toHand(game, "Divination");
    game.state.zones.perPlayer[A].library = [];
    cast(game, spell);
    expect(game.state.result).toMatchObject({ over: true, winner: A });
  });
});

describe("an effect replacement against Notion Thief (rule 616.1)", () => {
  it("Underrealm Lich first: the drawing player looks at three and keeps one, and the Thief gets none", () => {
    const { game, a } = table();
    spawn(game, "Underrealm Lich");
    spawn(game, "Notion Thief", B);
    lands(game, "Island", 3);
    for (const name of ["Forest", "Mountain", "Swamp", "Plains", "Island", "Wastes"]) toLibrary(game, name);
    const spell = toHand(game, "Divination");
    const theirs = hand(game, B).length;
    const before = hand(game).length;
    const asked = chooseFirst(a, "Underrealm Lich");
    cast(game, spell);
    expect(asked).toHaveLength(2);
    expect(hand(game)).toHaveLength(before + 1);
    expect(hand(game, B).length).toBe(theirs);
  });

  it("unasked with no effect replacement and one Thief: it takes the draw", () => {
    const { game, a } = table();
    spawn(game, "Notion Thief", B);
    lands(game, "Island", 3);
    const spell = toHand(game, "Divination");
    const theirs = hand(game, B).length;
    const asked = chooseFirst(a, "Notion Thief");
    cast(game, spell);
    expect(asked).toHaveLength(0);
    expect(hand(game, B).length).toBe(theirs + 2);
  });
});
