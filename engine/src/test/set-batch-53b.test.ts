/**
 * The set walk, batch 53, part b (2026-10-11): Reality Fracture's last cards,
 * Reality Fracture Commander's and The Hobbit's. Written on the shared table
 * in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  attack,
  cast,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  pickFromZone,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  named,
  zone,
} from "./harness.js";

/** The prepare spell copies in exile. */
const copies = (game: Game): ObjectId[] =>
  game.state.zones.shared.exile.filter((id) => game.state.objects[id].preparedFor !== undefined);

describe("Vigorbloom Vanguard // Seed Suture", () => {
  it("enters prepared; Seed Suture counters a creature and gains 1 life, and countered creatures have vigilance", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const vanguard = enter(game, "Vigorbloom Vanguard");
    expect(keywords(game, bears).has("vigilance")).toBe(false);
    const [copy] = copies(game);
    expect(game.state.objects[copy].cardName).toBe("Seed Suture");
    lands(game, "Forest", 1);
    cast(game, copy, { via: "prepared", targets: [ref(bears)] });
    expect(game.state.objects[bears].counters["+1/+1"]).toBe(1);
    expect(life(game, A)).toBe(21);
    expect(keywords(game, bears).has("vigilance")).toBe(true);
    // Only a creature with a +1/+1 counter on it.
    expect(keywords(game, vanguard).has("vigilance")).toBe(false);
    // An opponent's countered creature isn't one you control.
    const theirs = spawn(game, "Grizzly Bears", B);
    game.state.objects[theirs].counters["+1/+1"] = 1;
    expect(keywords(game, theirs).has("vigilance")).toBe(false);
  });
});

describe("Stingerquill Voxmancer // Vicious Verse", () => {
  it("becomes prepared at your upkeep, and Vicious Verse deals 1 damage to target opponent", () => {
    const { game } = table();
    const vox = spawn(game, "Stingerquill Voxmancer");
    expect(game.state.objects[vox].prepared).toBeUndefined();
    toStep(game, "upkeep");
    settle(game);
    expect(game.state.objects[vox].prepared).toBeDefined();
    toStep(game, "precombat-main");
    const [copy] = copies(game);
    expect(game.state.objects[copy].cardName).toBe("Vicious Verse");
    lands(game, "Swamp", 1);
    cast(game, copy, { via: "prepared", targets: [ref(B)] });
    expect(life(game, B)).toBe(19);
    expect(game.state.objects[vox].prepared).toBeUndefined();
  });
});

describe("Yuriko, Hope from the Shadows", () => {
  it("gives -X/-0, X the cards in your graveyard as it resolves", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant", B);
    toGraveyard(game, "Wastes");
    toGraveyard(game, "Wastes");
    pickModes(a, 0);
    pickTargets(a, giant);
    enter(game, "Yuriko, Hope from the Shadows");
    expect(pt(game, giant)).toEqual({ power: 1, toughness: 3 });
  });
});

describe("Niv-Mizzet, Ghost Counsel", () => {
  it("pays the life gained to draw that many cards", () => {
    const { game, a } = table();
    spawn(game, "Niv-Mizzet, Ghost Counsel");
    const before = hand(game).length;
    pickModes(a, 0);
    game.debugApplyEffect(A, { kind: "gain-life", amount: 3 });
    settle(game);
    expect(life(game, A)).toBe(20);
    expect(hand(game).length).toBe(before + 3);
  });

  it("triggers once for each lifelink creature dealing combat damage at once (the ruling)", () => {
    const { game, a } = table();
    spawn(game, "Niv-Mizzet, Ghost Counsel");
    const hawks = [spawn(game, "Vampire Nighthawk"), spawn(game, "Vampire Nighthawk")];
    let asked = 0;
    a.chooseModesFn = () => {
      asked += 1;
      return [0];
    };
    const before = hand(game).length;
    attack(game, a, hawks);
    settle(game);
    expect(life(game, B)).toBe(16);
    expect(asked).toBe(2);
    expect(life(game, A)).toBe(20);
    expect(hand(game).length).toBe(before + 4);
  });
});

describe("Smaug, Wicked Worm", () => {
  it("makes a tapped Treasure for each artifact your opponents control", () => {
    const { game } = table();
    spawn(game, "Sol Ring", B);
    spawn(game, "Sol Ring", B);
    spawn(game, "Sol Ring");
    enter(game, "Smaug, Wicked Worm");
    const treasures = named(game, "Treasure Token", A);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(2);
    expect(treasures.every((id) => game.state.objects[id].tapped)).toBe(true);
  });
});

describe("The Sackville-Bagginses", () => {
  it("may sacrifice another creature or artifact to draw and make a Treasure; each token sacrificed drains 1", () => {
    const { game, a } = table();
    game.debugApplyEffect(A, { kind: "create-token", token: "Treasure Token", count: 1 });
    const [treasure] = named(game, "Treasure Token", A);
    const before = hand(game).length;
    let offered: readonly ObjectId[] = [];
    pickModes(a, 0);
    a.chooseSacrificesFn = (_view, eligible) => {
      offered = eligible;
      return [treasure];
    };
    const sackvilles = enter(game, "The Sackville-Bagginses");
    expect(offered).not.toContain(sackvilles);
    expect(game.state.objects[treasure]).toBeUndefined();
    expect(hand(game).length).toBe(before + 1);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(1);
    // The Treasure was a token: the sacrifice trigger.
    expect(life(game, B)).toBe(19);
  });

  it("doesn't draw when declined, and a nontoken sacrifice doesn't drain", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const before = hand(game).length;
    pickModes(a);
    enter(game, "The Sackville-Bagginses");
    expect(hand(game).length).toBe(before);
    expect(zone(game, bears)).toBe("battlefield");
    pickModes(a, 0);
    a.chooseSacrificesFn = () => [bears];
    enter(game, "The Sackville-Bagginses");
    expect(zone(game, bears)).toBe("graveyard");
    expect(hand(game).length).toBe(before + 1);
    expect(life(game, B)).toBe(20);
  });
});

describe("Thranduil, Sindarin Liege // Silvan Rally", () => {
  it("Silvan Rally mills four and takes up to two lands from among them; Thranduil's Elves get +1/+1", () => {
    const { game, a } = table({ deck: "Grizzly Bears" });
    const old = toGraveyard(game, "Forest");
    toLibrary(game, "Grizzly Bears");
    const milled = [toLibrary(game, "Island"), toLibrary(game, "Forest"), toLibrary(game, "Forest")];
    const thranduil = toHand(game, "Thranduil, Sindarin Liege");
    lands(game, "Forest", 7);
    const seen = pickFromZone(a, milled[0], milled[1]);
    game.dispatch({ type: "cast-spell", player: A, card: thranduil, targets: [], face: 1 });
    settle(game);
    expect([...seen.offered].sort()).toEqual([...milled].sort());
    expect(seen.offered).not.toContain(old);
    expect(zone(game, milled[0])).toBe("hand");
    expect(zone(game, milled[1])).toBe("hand");
    expect(zone(game, milled[2])).toBe("graveyard");
    expect(zone(game, thranduil)).toBe("exile");
    // The creature, from exile; then landfall makes an Elf it pumps.
    game.dispatch({ type: "cast-spell", player: A, card: thranduil, targets: [], via: "adventure", face: 0 });
    settle(game);
    expect(zone(game, thranduil)).toBe("battlefield");
    enter(game, "Forest");
    const [elf] = named(game, "Elf Token", A);
    expect(pt(game, elf)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, thranduil)).toEqual({ power: 2, toughness: 3 });
  });
});

describe("An Unexpected Party // At the Door", () => {
  it("At the Door makes X 2/2 red Dwarves; the enchantment pumps the chosen type", () => {
    const { game, a } = table();
    const party = toHand(game, "An Unexpected Party");
    lands(game, "Plains", 9);
    game.dispatch({ type: "cast-spell", player: A, card: party, targets: [], face: 1, xValue: 2 });
    settle(game);
    const dwarves = named(game, "2/2 Red Dwarf Token", A);
    expect(tokensNamed(game, "2/2 Red Dwarf Token", A)).toBe(2);
    expect(pt(game, dwarves[0])).toEqual({ power: 2, toughness: 2 });
    a.chooseCreatureTypeFn = () => "Dwarf";
    const bears = spawn(game, "Grizzly Bears");
    game.dispatch({ type: "cast-spell", player: A, card: party, targets: [], via: "adventure", face: 0 });
    settle(game);
    expect(zone(game, party)).toBe("battlefield");
    expect(pt(game, dwarves[0])).toEqual({ power: 4, toughness: 4 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Dáin's Company", () => {
  it("has lifelink only with another Dwarf, and digs for a Dwarf or Equipment", () => {
    const { game, a } = table();
    toLibrary(game, "Hill Giant");
    const sword = toLibrary(game, "Bonesplitter");
    const dwarf = toLibrary(game, "Blazing Firesinger");
    const seen = pickFromZone(a, dwarf);
    const company = enter(game, "Dáin's Company");
    expect([...seen.offered].sort()).toEqual([sword, dwarf].sort());
    expect(zone(game, dwarf)).toBe("hand");
    expect(keywords(game, company).has("lifelink")).toBe(false);
    spawn(game, "Blazing Firesinger");
    expect(keywords(game, company).has("lifelink")).toBe(true);
    expect(graveyard(game)).toHaveLength(0);
  });
});
