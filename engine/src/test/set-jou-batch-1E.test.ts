/**
 * Journey into Nyx (JOU; B161), group E. One test per card whose behaviour
 * is more than a stat line, on the clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  cast,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  pickTargets,
  pt,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  zone,
} from "./harness.js";

describe("Ajani's Presence", () => {
  it("pumps every target, and costs {2}{W} more for the second", () => {
    const { game } = table();
    const x = spawn(game, "Grizzly Bears");
    const y = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 3);
    expect(() => cast(game, toHand(game, "Ajani's Presence"), { targets: [ref(x), ref(y)] })).toThrow();
    lands(game, "Plains", 1);
    cast(game, toHand(game, "Ajani's Presence"), { targets: [ref(x), ref(y)] });
    for (const id of [x, y]) {
      expect(pt(game, id)).toEqual({ power: 3, toughness: 3 });
      expect(keywords(game, id).has("indestructible")).toBe(true);
    }
  });
});

describe("Colossal Heroics", () => {
  it("pumps and untaps each target", () => {
    const { game } = table();
    const x = spawn(game, "Grizzly Bears", A, { tapped: true });
    const y = spawn(game, "Grizzly Bears", A, { tapped: true });
    lands(game, "Forest", 5);
    cast(game, toHand(game, "Colossal Heroics"), { targets: [ref(x), ref(y)] });
    for (const id of [x, y]) {
      expect(pt(game, id)).toEqual({ power: 4, toughness: 4 });
      expect(game.state.objects[id].tapped).toBe(false);
    }
  });
});

describe("Kiora's Dismissal", () => {
  it("returns every targeted enchantment to its owner's hand", () => {
    const { game } = table();
    const e1 = spawn(game, "Thassa's Ire", B);
    const e2 = spawn(game, "Font of Return", B);
    lands(game, "Island", 2);
    const before = hand(game, B).length;
    cast(game, toHand(game, "Kiora's Dismissal"), { targets: [ref(e1), ref(e2)] });
    expect(zone(game, e1)).toBe("hand");
    expect(zone(game, e2)).toBe("hand");
    expect(hand(game, B).length).toBe(before + 2);
  });
});

describe("Stormchaser Chimera", () => {
  it("gets +X/+0 for the revealed top card's mana value", () => {
    const { game } = table();
    const chimera = spawn(game, "Stormchaser Chimera");
    toLibrary(game, "Hill Giant");
    lands(game, "Island", 2);
    lands(game, "Mountain", 2);
    activate(game, chimera);
    expect(pt(game, chimera)).toEqual({ power: 6, toughness: 3 });
  });
});

describe("Nyx Infusion", () => {
  it("gives an enchantment creature +2/+2 and any other creature -2/-2", () => {
    const { game } = table();
    // Bob's, so alice's Aura entering doesn't trigger its constellation.
    const dryads = spawn(game, "Oakheart Dryads", B);
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 6);
    cast(game, toHand(game, "Nyx Infusion"), { targets: [ref(dryads)] });
    expect(pt(game, dryads)).toEqual({ power: 4, toughness: 5 });
    cast(game, toHand(game, "Nyx Infusion"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Strength from the Fallen", () => {
  it("on its own entry, pumps by the creature cards in your graveyard", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Hill Giant");
    toGraveyard(game, "Plains");
    pickTargets(a, bears);
    enter(game, "Strength from the Fallen");
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Agent of Erebos", () => {
  it("exiles the target player's graveyard when another enchantment enters", () => {
    const { game, a } = table();
    spawn(game, "Agent of Erebos");
    toGraveyard(game, "Grizzly Bears", B);
    toGraveyard(game, "Hill Giant", B);
    pickTargets(a, B);
    enter(game, "Thassa's Ire");
    expect(graveyard(game, B).length).toBe(0);
  });
});

describe("Pheres-Band Warchief", () => {
  it("lords other Centaurs only", () => {
    const { game } = table();
    const chief = spawn(game, "Pheres-Band Warchief");
    const other = spawn(game, "Pheres-Band Warchief");
    const bears = spawn(game, "Grizzly Bears");
    expect(pt(game, chief)).toEqual({ power: 4, toughness: 4 });
    expect(pt(game, other)).toEqual({ power: 4, toughness: 4 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    expect(keywords(game, bears).has("trample")).toBe(false);
  });
});

describe("Font of Return", () => {
  it("returns three creature cards from your graveyard", () => {
    const { game } = table();
    const font = spawn(game, "Font of Return");
    const cards = [toGraveyard(game, "Grizzly Bears"), toGraveyard(game, "Hill Giant"), toGraveyard(game, "Grizzly Bears")];
    lands(game, "Swamp", 4);
    activate(game, font, 0, { targets: cards.map(ref) });
    for (const id of cards) expect(zone(game, id)).toBe("hand");
    expect(zone(game, font)).toBe("graveyard");
  });
});
