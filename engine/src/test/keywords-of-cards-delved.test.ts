/**
 * "If a creature card with flying was exiled with this creature's delve
 * ability, this creature has flying. The same is true for …" (Soulflayer):
 * a printed delve links what it exiled to the permanent (rule 607.2q), read by
 * `sharesKeywords`' `"exiled-with-source"`, creature cards alone. What a card
 * grants itself only on a condition doesn't count (Battle Brawler, the
 * ruling); a card exiled some other way doesn't either.
 */
import { describe, expect, it } from "vitest";

import { cast, keywords, lands, spawn, table, toGraveyard, toHand, zone } from "./harness.js";

describe("Soulflayer", () => {
  it("has the listed keywords of the creature cards its delve exiled", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    spawn(game, "Raging Goblin");
    const angel = toGraveyard(game, "Serra Angel");
    const rats = toGraveyard(game, "Typhoid Rats");
    const brawler = toGraveyard(game, "Battle Brawler");
    const bolt = toGraveyard(game, "Lightning Bolt");
    // Exiled, but not by its delve: no trample.
    const wurm = toGraveyard(game, "Craw Wurm");
    game.debugMove(wurm, "exile");
    const flayer = toHand(game, "Soulflayer");
    cast(game, flayer, { delve: [angel, rats, brawler, bolt] });
    expect(zone(game, flayer)).toBe("battlefield");
    const has = keywords(game, flayer);
    expect(has.has("flying")).toBe(true);
    expect(has.has("vigilance")).toBe(true);
    expect(has.has("deathtouch")).toBe(true);
    // Battle Brawler's first strike is only on a condition (the ruling).
    expect(has.has("first-strike")).toBe(false);
    expect(has.has("trample")).toBe(false);
  });

  it("keeps them once the card it delved has left exile: 'was exiled'", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const angel = toGraveyard(game, "Serra Angel");
    const fodder = [toGraveyard(game, "Lightning Bolt"), toGraveyard(game, "Opt"), toGraveyard(game, "Divination")];
    const flayer = toHand(game, "Soulflayer");
    cast(game, flayer, { delve: [angel, ...fodder] });
    game.debugMove(angel, "hand");
    expect(zone(game, angel)).toBe("hand");
    expect(keywords(game, flayer).has("flying")).toBe(true);
    expect(keywords(game, flayer).has("vigilance")).toBe(true);
  });

  it("a new object once it leaves the battlefield: none when it returns (rule 400.7)", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const angel = toGraveyard(game, "Serra Angel");
    const fodder = [toGraveyard(game, "Lightning Bolt"), toGraveyard(game, "Opt"), toGraveyard(game, "Divination")];
    const flayer = toHand(game, "Soulflayer");
    cast(game, flayer, { delve: [angel, ...fodder] });
    game.debugMove(flayer, "graveyard");
    game.debugMove(flayer, "battlefield");
    expect(keywords(game, flayer).has("flying")).toBe(false);
  });

  it("has none with nothing delved", () => {
    const { game } = table();
    lands(game, "Swamp", 6);
    toGraveyard(game, "Serra Angel");
    const flayer = toHand(game, "Soulflayer");
    cast(game, flayer, { delve: [] });
    expect(keywords(game, flayer).has("flying")).toBe(false);
  });
});
