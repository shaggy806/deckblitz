/**
 * "As long as a creature card with flying is in a graveyard, this creature has
 * flying. The same is true for fear, first strike, double strike, deathtouch,
 * haste, landwalk, lifelink, protection, reach, trample, shroud, and
 * vigilance." (Cairn Wanderer): a `sharesKeywords` static read from `{
 * graveyard }`, every graveyard's creature cards — its ruling: all cards in
 * all graveyards, with their landwalk (702.14a) and protection (702.16a)
 * abilities. Granted in layer 6 for as long as such a card is there.
 */
import { describe, expect, it } from "vitest";

import { B, cast, keywords, lands, pt, ref, spawn, table, toGraveyard, toHand, zone } from "./harness.js";

describe("Cairn Wanderer", () => {
  it("has flying and vigilance while a creature card with them is in any graveyard, and loses them when it leaves", () => {
    const { game } = table();
    const wanderer = spawn(game, "Cairn Wanderer");
    expect(pt(game, wanderer)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, wanderer)).not.toContain("flying");
    // An opponent's graveyard counts.
    const angel = toGraveyard(game, "Serra Angel", B);
    expect([...keywords(game, wanderer)]).toEqual(expect.arrayContaining(["flying", "vigilance"]));
    game.debugMove(angel, "exile");
    expect(keywords(game, wanderer)).not.toContain("flying");
    expect(keywords(game, wanderer)).not.toContain("vigilance");
  });

  it("reads creature cards only: a Vehicle card with flying gives nothing", () => {
    const { game } = table();
    const wanderer = spawn(game, "Cairn Wanderer");
    toGraveyard(game, "Smuggler's Copter");
    expect(keywords(game, wanderer)).not.toContain("flying");
  });

  it("takes a graveyard creature card's protection and first strike: White Knight's from black", () => {
    const { game } = table();
    const wanderer = spawn(game, "Cairn Wanderer", B);
    toGraveyard(game, "White Knight", B);
    expect(keywords(game, wanderer)).toContain("first-strike");
    lands(game, "Swamp", 3);
    expect(() => cast(game, toHand(game, "Murder"), { targets: [ref(wanderer)] })).toThrow(/target/i);
    lands(game, "Mountain", 3);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(wanderer)] });
    expect(zone(game, wanderer)).toBe("battlefield");
    expect(game.state.objects[wanderer].damageMarked).toBe(3);
  });

  it("takes a landwalk ability: Bog Wraith's swampwalk", () => {
    const { game } = table();
    const wanderer = spawn(game, "Cairn Wanderer");
    expect(keywords(game, wanderer)).not.toContain("swampwalk");
    toGraveyard(game, "Bog Wraith", B);
    expect(keywords(game, wanderer)).toContain("swampwalk");
  });
});
