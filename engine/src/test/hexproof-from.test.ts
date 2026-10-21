/**
 * Hexproof from a quality (rule 702.11d-e): a matching spell, or an ability
 * from a matching source, that an opponent controls can't target the
 * permanent. Its own controller's can, and a spell without the quality can.
 * Batch 116 (Core Set 2021's Sporeweb Weaver and Garruk's Harbinger, and the
 * cards triaged earlier that waited on it).
 */
import { describe, expect, it } from "vitest";

import { B, cast, lands, ref, spawn, table, toHand, toStep, zone } from "./harness.js";

describe("hexproof from a color", () => {
  it("stops an opponent's spell of that color, not one of another color", () => {
    const { game } = table();
    const weaver = spawn(game, "Sporeweb Weaver"); // hexproof from blue
    toStep(game, "precombat-main", B);
    lands(game, "Island", 1, B);
    lands(game, "Mountain", 1, B);
    expect(() => cast(game, toHand(game, "Unsummon", B), { player: B, targets: [ref(weaver)] })).toThrow();
    cast(game, toHand(game, "Shock", B), { player: B, targets: [ref(weaver)] });
    expect(zone(game, weaver)).toBe("battlefield");
    expect(game.state.objects[weaver].damageMarked).toBe(2);
  });

  it("doesn't stop its controller's own spell of that color", () => {
    const { game } = table();
    const weaver = spawn(game, "Sporeweb Weaver");
    lands(game, "Island", 1);
    cast(game, toHand(game, "Unsummon"), { targets: [ref(weaver)] });
    expect(zone(game, weaver)).toBe("hand");
  });

  it("from each color, it stops every colored spell an opponent casts", () => {
    const { game } = table();
    const breaker = spawn(game, "Breaker of Creation");
    toStep(game, "precombat-main", B);
    lands(game, "Mountain", 1, B);
    expect(() => cast(game, toHand(game, "Shock", B), { player: B, targets: [ref(breaker)] })).toThrow();
  });
});

describe("hexproof from card types, and from a filter", () => {
  it("Nevinyrral: an opponent's enchantment can't target it, an instant can", () => {
    const { game } = table();
    const nev = spawn(game, "Nevinyrral, Urborg Tyrant");
    toStep(game, "precombat-main", B);
    lands(game, "Plains", 1, B);
    lands(game, "Mountain", 1, B);
    expect(() => cast(game, toHand(game, "Pacifism", B), { player: B, targets: [ref(nev)] })).toThrow();
    cast(game, toHand(game, "Shock", B), { player: B, targets: [ref(nev)] });
    expect(game.state.objects[nev].damageMarked).toBe(2);
  });

  it("Thrun: nongreen spells an opponent controls can't target it, green ones can", () => {
    const { game } = table();
    const thrun = spawn(game, "Thrun, Breaker of Silence");
    toStep(game, "precombat-main", B);
    lands(game, "Mountain", 1, B);
    lands(game, "Forest", 1, B);
    expect(() => cast(game, toHand(game, "Shock", B), { player: B, targets: [ref(thrun)] })).toThrow();
    cast(game, toHand(game, "Giant Growth", B), { player: B, targets: [ref(thrun)] });
    expect(game.characteristics(thrun).power).toBe(8);
  });
});
