/**
 * Darksteel (DST; B214), group A. One test per card whose behaviour is more
 * than a stat line, on the clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  pickFromZone,
  pt,
  ref,
  spawn,
  table,
  toHand,
  toLibrary,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Myr Matrix", () => {
  it("pumps every Myr creature, an opponent's too, and makes Myr for {5}", () => {
    const { game } = table();
    const matrix = spawn(game, "Myr Matrix");
    const theirs = spawn(game, "Myr Token", B);
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
    lands(game, "Wastes", 5);
    activate(game, matrix);
    expect(tokensNamed(game, "Myr Token", A)).toBe(1);
  });
});

describe("Retract", () => {
  it("returns only your artifacts", () => {
    const { game } = table();
    const mine = spawn(game, "Ornithopter");
    const theirs = spawn(game, "Ornithopter", B);
    lands(game, "Island", 1);
    cast(game, toHand(game, "Retract"));
    expect(zone(game, mine)).toBe("hand");
    expect(zone(game, theirs)).toBe("battlefield");
  });
});

describe("Pristine Angel", () => {
  it("has protection from each color only while untapped", () => {
    const { game } = table();
    const angel = spawn(game, "Pristine Angel", B);
    lands(game, "Mountain", 1);
    const shock = toHand(game, "Shock");
    expect(() => cast(game, shock, { targets: [ref(angel)] })).toThrow(/refused/);
    game.state.objects[angel].tapped = true;
    cast(game, shock, { targets: [ref(angel)] });
    expect(game.state.objects[angel].damageMarked).toBe(2);
  });
});

describe("Talon of Pain", () => {
  it("counts damage your other sources deal opponents, then spends X counters", () => {
    const { game } = table();
    const talon = spawn(game, "Talon of Pain");
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(counters(game, talon, "charge")).toBe(1);
    lands(game, "Wastes", 1);
    activate(game, talon, 0, { x: 1, targets: [ref(B)] });
    expect(life(game, B)).toBe(17);
    expect(counters(game, talon, "charge")).toBe(0);
  });
});

describe("Roaring Slagwurm", () => {
  it("taps every artifact as it attacks", () => {
    const { game, a } = table();
    const wurm = spawn(game, "Roaring Slagwurm");
    const theirs = spawn(game, "Ornithopter", B);
    attack(game, a, [wurm]);
    expect(game.state.objects[theirs].tapped).toBe(true);
  });
});

describe("Chromescale Drake", () => {
  it("puts the revealed artifacts in hand and the rest in the graveyard", () => {
    const { game, a } = table();
    toLibrary(game, "Wastes");
    const thopter = toLibrary(game, "Ornithopter");
    toLibrary(game, "Wastes");
    pickFromZone(a, thopter);
    const handBefore = hand(game).length;
    const graveBefore = graveyard(game).length;
    enter(game, "Chromescale Drake");
    expect(zone(game, thopter)).toBe("hand");
    expect(hand(game).length).toBe(handBefore + 1);
    expect(graveyard(game).length).toBe(graveBefore + 2);
  });
});

describe("Mephitic Ooze", () => {
  it("gets +1/+0 for each artifact you control", () => {
    const { game } = table();
    const ooze = spawn(game, "Mephitic Ooze");
    spawn(game, "Ornithopter");
    spawn(game, "Ornithopter");
    spawn(game, "Ornithopter", B);
    expect(pt(game, ooze)).toEqual({ power: 2, toughness: 5 });
  });
});

describe("Drill-Skimmer", () => {
  it("has shroud only with another artifact creature", () => {
    const { game } = table();
    const skimmer = spawn(game, "Drill-Skimmer");
    expect(keywords(game, skimmer).has("shroud")).toBe(false);
    spawn(game, "Ornithopter");
    expect(keywords(game, skimmer).has("shroud")).toBe(true);
  });
});

describe("Vulshok War Boar", () => {
  it("is sacrificed with no artifact to sacrifice", () => {
    const { game } = table();
    const boar = enter(game, "Vulshok War Boar");
    expect(zone(game, boar)).toBe("graveyard");
  });
});
