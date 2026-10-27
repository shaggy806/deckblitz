/**
 * Apocalypse (APC; B218), group B. One test per card whose behaviour is more
 * than a stat line, on the clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import { computeCharacteristics } from "../characteristics.js";
import {
  A,
  B,
  activate,
  attack,
  cast,
  destroy,
  enter,
  hand,
  lands,
  life,
  named,
  nextTurn,
  pickModes,
  pt,
  ref,
  registryOf,
  spawn,
  table,
  toHand,
  toLibrary,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Fire // Ice", () => {
  it("casts Fire divided between two targets, and Ice taps and draws", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    lands(game, "Island", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Fire // Ice"), { face: 1, targets: [ref(bears), ref(B)], division: [1, 1] });
    expect(game.state.objects[bears].damageMarked).toBe(1);
    expect(life(game, B)).toBe(19);

    const ice = toHand(game, "Fire // Ice");
    const before = hand(game).length;
    cast(game, ice, { face: 2, targets: [ref(bears)] });
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(hand(game).length).toBe(before); // Ice left, a card drawn
  });
});

describe("Soul Link and Bloodfire Dwarf", () => {
  it("gains life both when the enchanted creature deals damage and when it's dealt damage", () => {
    const { game, a } = table();
    lands(game, "Plains", 2);
    lands(game, "Swamp", 1);
    lands(game, "Mountain", 1);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Soul Link"), { targets: [ref(bears)] });
    attack(game, a, [bears]);
    expect(life(game, B)).toBe(18);
    expect(life(game, A)).toBe(22);

    const dwarf = spawn(game, "Bloodfire Dwarf");
    activate(game, dwarf, 0);
    expect(zone(game, dwarf)).toBe("graveyard");
    expect(game.state.objects[bears].damageMarked).toBe(1);
    expect(life(game, A)).toBe(23);
  });
});

describe("Squee's Embrace", () => {
  it("returns the enchanted creature card to its owner's hand when it dies", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    lands(game, "Plains", 1);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Squee's Embrace"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    destroy(game, bears);
    expect(hand(game).some((id) => game.state.objects[id].cardName === "Grizzly Bears")).toBe(true);
  });
});

describe("Prophetic Bolt", () => {
  it("deals 4 and puts one of the top four into hand", () => {
    const { game } = table();
    lands(game, "Island", 4);
    lands(game, "Mountain", 1);
    const before = hand(game).length;
    cast(game, toHand(game, "Prophetic Bolt"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(16);
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Tidal Courier", () => {
  it("takes every Merfolk among the top four", () => {
    const { game } = table();
    toLibrary(game, "Vodalian Mystic");
    toLibrary(game, "Wastes");
    toLibrary(game, "Tidal Courier");
    const before = hand(game).length;
    enter(game, "Tidal Courier");
    expect(hand(game).length).toBe(before + 2);
  });
});

describe("Vodalian Mystic", () => {
  it("makes an instant spell the chosen colour", () => {
    const { game, a } = table();
    lands(game, "Island", 2);
    const mystic = spawn(game, "Vodalian Mystic");
    const bears = spawn(game, "Grizzly Bears", B);
    const ice = toHand(game, "Fire // Ice");
    cast(game, ice, { face: 2, targets: [ref(bears)], settle: false });
    pickModes(a, 3); // Red
    activate(game, mystic, 0, { targets: [ref(ice)], settle: false });
    game.advanceUntil((s) => s.zones.shared.stack.length === 1 && s.awaiting === null && s.pendingTriggers.length === 0);
    expect(zone(game, ice)).toBe("stack");
    expect([...computeCharacteristics(game.state, registryOf(game), ice).colors]).toEqual(["R"]);
  });
});

describe("Consume Strength and Bog Gnarr", () => {
  it("pumps one creature, shrinks another, and a black spell pumps the Gnarr", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    lands(game, "Forest", 2);
    const gnarr = spawn(game, "Bog Gnarr");
    const glade = spawn(game, "Glade Gnarr");
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Consume Strength"), { targets: [ref(gnarr), ref(bears)] });
    expect(pt(game, gnarr)).toEqual({ power: 6, toughness: 6 });
    expect(pt(game, glade)).toEqual({ power: 4, toughness: 4 });
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Penumbra Kavu", () => {
  it("leaves a 3/3 black Kavu when it dies", () => {
    const { game } = table();
    const kavu = spawn(game, "Penumbra Kavu");
    destroy(game, kavu);
    expect(tokensNamed(game, "Kavu Token (Black, 3/3)", A)).toBe(1);
    const [token] = named(game, "Kavu Token (Black, 3/3)", A);
    expect([...computeCharacteristics(game.state, registryOf(game), token).colors]).toEqual(["B"]);
  });
});

describe("Goblin Legionnaire", () => {
  it("sacrifices itself to deal 2 to any target", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    const legionnaire = spawn(game, "Goblin Legionnaire");
    activate(game, legionnaire, 0, { targets: [ref(B)] });
    expect(zone(game, legionnaire)).toBe("graveyard");
    expect(life(game, B)).toBe(18);
  });
});

describe("Mask of Intolerance", () => {
  it("damages only an active player with four basic land types", () => {
    const { game } = table();
    spawn(game, "Mask of Intolerance");
    lands(game, "Plains", 1);
    lands(game, "Island", 1);
    lands(game, "Swamp", 1);
    for (const land of ["Plains", "Island", "Swamp", "Mountain"]) lands(game, land, 1, B);
    nextTurn(game); // bob's turn
    expect(life(game, B)).toBe(17);
    expect(life(game, A)).toBe(20);
    nextTurn(game); // alice's: three types
    expect(life(game, A)).toBe(20);
    lands(game, "Mountain", 1);
    nextTurn(game);
    expect(life(game, B)).toBe(14);
    nextTurn(game); // alice's: four types now
    expect(life(game, A)).toBe(17);
  });
});
