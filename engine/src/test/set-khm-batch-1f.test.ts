/**
 * Kaldheim, group f — the clauses most likely to be wrong on each card that's
 * more than a stat line or a copy of a tested pattern.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  cast,
  controller,
  counters,
  destroy,
  hand,
  keywords,
  lands,
  life,
  pickFromZone,
  pickModes,
  pickTargets,
  pt,
  ref,
  spawn,
  subtypes,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  tokensNamed,
  toStep,
  zone,
} from "./harness.js";

describe("KHM group f", () => {
  it("Stoic Farmer: the Plains enters tapped when an opponent has more lands", () => {
    const { game, a } = table();
    lands(game, "Plains", 4);
    lands(game, "Plains", 5, B);
    const plains = toLibrary(game, "Plains");
    pickFromZone(a, plains);
    cast(game, toHand(game, "Stoic Farmer"));
    expect(zone(game, plains)).toBe("battlefield");
    expect(game.state.objects[plains].tapped).toBe(true);
  });

  it("Stoic Farmer: otherwise the Plains goes to your hand", () => {
    const { game, a } = table();
    lands(game, "Plains", 4);
    const plains = toLibrary(game, "Plains");
    pickFromZone(a, plains);
    cast(game, toHand(game, "Stoic Farmer"));
    expect(zone(game, plains)).toBe("hand");
  });

  it("Quakebringer: opponents can't gain life", () => {
    const { game } = table();
    spawn(game, "Quakebringer");
    game.debugApplyEffect(B, { kind: "gain-life", amount: 3 }, []);
    expect(life(game, B)).toBe(20);
  });

  it("Quakebringer: from the graveyard it deals 2 only while you control a Giant", () => {
    const { game } = table();
    toGraveyard(game, "Quakebringer");
    toStep(game, "upkeep");
    toStep(game, "precombat-main");
    expect(life(game, B)).toBe(20);
    spawn(game, "Hill Giant");
    toStep(game, "upkeep");
    toStep(game, "precombat-main");
    expect(life(game, B)).toBe(18);
  });

  it("Blizzard Brawl: with three snow permanents the creature gets +1/+0 and indestructible, then fights", () => {
    const { game } = table();
    lands(game, "Snow-Covered Forest", 3);
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Blizzard Brawl"), { targets: [ref(bears), ref(giant)] });
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
    expect(keywords(game, bears).has("indestructible")).toBe(true);
  });

  it("Blizzard Brawl: without them it's a plain fight", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Blizzard Brawl"), { targets: [ref(bears), ref(giant)] });
    expect(zone(game, giant)).toBe("battlefield");
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("Frost Bite: 3 damage with three snow permanents, 2 without", () => {
    const { game } = table();
    lands(game, "Snow-Covered Mountain", 3);
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Frost Bite"), { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("graveyard");

    const t = table();
    lands(t.game, "Mountain", 1);
    const other = spawn(t.game, "Hill Giant", B);
    cast(t.game, toHand(t.game, "Frost Bite"), { targets: [ref(other)] });
    expect(zone(t.game, other)).toBe("battlefield");
    expect(t.game.state.objects[other].damageMarked).toBe(2);
  });

  it("Return Upon the Tide: an Elf brings two Elf Warriors, anything else none", () => {
    const { game } = table();
    lands(game, "Swamp", 10);
    const elves = toGraveyard(game, "Llanowar Elves");
    cast(game, toHand(game, "Return Upon the Tide"), { targets: [ref(elves)] });
    expect(zone(game, elves)).toBe("battlefield");
    expect(tokensNamed(game, "Elf Warrior Token", A)).toBe(2);

    const bears = toGraveyard(game, "Grizzly Bears");
    cast(game, toHand(game, "Return Upon the Tide"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("battlefield");
    expect(tokensNamed(game, "Elf Warrior Token", A)).toBe(2);
  });

  it("Absorb Identity: bounces the creature and Shapeshifters you control become copies of it", () => {
    const { game, a } = table();
    lands(game, "Island", 2);
    const outcast = spawn(game, "Changeling Outcast");
    const bears = spawn(game, "Grizzly Bears", B);
    pickModes(a, 0);
    cast(game, toHand(game, "Absorb Identity"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("hand");
    expect(pt(game, outcast)).toEqual({ power: 2, toughness: 2 });
    expect(subtypes(game, outcast)).toContain("Bear");
  });

  it("Avalanche Caller: only a snow land you control becomes a 4/4 hexproof, haste Elemental", () => {
    const { game } = table();
    lands(game, "Island", 2);
    const snow = spawn(game, "Snow-Covered Forest");
    const forest = spawn(game, "Forest");
    const caller = spawn(game, "Avalanche Caller");
    expect(() => activate(game, caller, 0, { targets: [ref(forest)] })).toThrow();
    activate(game, caller, 0, { targets: [ref(snow)] });
    expect(pt(game, snow)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, snow).has("hexproof")).toBe(true);
    expect(keywords(game, snow).has("haste")).toBe(true);
    expect(subtypes(game, snow)).toContain("Elemental");
  });

  it("Squash: costs {3} less with a Giant", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    const squash = toHand(game, "Squash");
    expect(() => cast(game, squash, { targets: [ref(bears)] })).toThrow();
    spawn(game, "Hill Giant");
    cast(game, squash, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("King Harald's Revenge: +1/+1 per creature you control and trample", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Llanowar Elves");
    spawn(game, "Hill Giant");
    cast(game, toHand(game, "King Harald's Revenge"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 5 });
    expect(keywords(game, bears).has("trample")).toBe(true);
  });

  it("Inga Rune-Eyes: draws three when she's the third creature to die this turn", () => {
    const { game } = table();
    const inga = spawn(game, "Inga Rune-Eyes");
    destroy(game, spawn(game, "Grizzly Bears", B));
    destroy(game, spawn(game, "Grizzly Bears", B));
    const before = hand(game, A).length;
    destroy(game, inga);
    expect(hand(game, A).length).toBe(before + 3);
  });

  it("Inga Rune-Eyes: no draw when fewer than three died", () => {
    const { game } = table();
    const inga = spawn(game, "Inga Rune-Eyes");
    const before = hand(game, A).length;
    destroy(game, inga);
    expect(hand(game, A).length).toBe(before);
  });

  it("Giant's Grasp: steals a nonland permanent for as long as it stays", () => {
    const { game, a } = table();
    lands(game, "Island", 4);
    const giant = spawn(game, "Hill Giant");
    const ring = spawn(game, "Sol Ring", B);
    pickTargets(a, ring);
    const grasp = toHand(game, "Giant's Grasp");
    cast(game, grasp, { targets: [ref(giant)] });
    expect(controller(game, ring)).toBe(A);
    destroy(game, grasp);
    expect(controller(game, ring)).toBe(B);
  });

  it("Giant's Grasp: can enchant only a Giant you control", () => {
    const { game } = table();
    lands(game, "Island", 4);
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Hill Giant", B);
    const grasp = toHand(game, "Giant's Grasp");
    expect(() => cast(game, grasp, { targets: [ref(bears)] })).toThrow();
    expect(() => cast(game, grasp, { targets: [ref(theirs)] })).toThrow();
  });

  it("Bloodsky Berserker and Doomskar Oracle: the second spell each turn", () => {
    const { game } = table();
    lands(game, "Island", 2);
    const berserker = spawn(game, "Bloodsky Berserker");
    spawn(game, "Doomskar Oracle");
    cast(game, toHand(game, "Opt"));
    expect(counters(game, berserker)).toBe(0);
    cast(game, toHand(game, "Opt"));
    expect(counters(game, berserker)).toBe(2);
    expect(keywords(game, berserker).has("menace")).toBe(true);
    expect(life(game, A)).toBe(22);
  });
});
