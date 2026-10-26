/**
 * Theros / Magic 2014, group E: Awaken the Ancient's animated Mountain,
 * Garruk, Caller of Beasts' reveal, Steelform Sliver's "you control",
 * Chronicler of Heroes' resolution-time check, Lagonna-Band Elder's
 * intervening if, Colossal Whale's exile-until-leaves and Setessan Battle
 * Priest's heroic.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  attack,
  cast,
  destroy,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  loyalty,
  named,
  pickModes,
  pickTargets,
  pt,
  ref,
  spawn,
  subtypes,
  table,
  toHand,
  toLibrary,
  types,
  zone,
} from "./harness.js";
import { computeCharacteristics } from "../characteristics.js";

describe("Awaken the Ancient", () => {
  it("makes the enchanted Mountain a 7/7 red Giant creature land with haste", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    const target = spawn(game, "Mountain");
    cast(game, toHand(game, "Awaken the Ancient"), { targets: [ref(target)] });
    expect(types(game, target)).toEqual(expect.arrayContaining(["land", "creature"]));
    expect(subtypes(game, target)).toEqual(expect.arrayContaining(["Mountain", "Giant"]));
    expect(pt(game, target)).toEqual({ power: 7, toughness: 7 });
    expect(keywords(game, target).has("haste")).toBe(true);
    expect(computeCharacteristics(game.state, game.registry, target).colors).toEqual(new Set(["R"]));
  });

  it("can't enchant a land that isn't a Mountain", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    const forest = spawn(game, "Forest");
    expect(() => cast(game, toHand(game, "Awaken the Ancient"), { targets: [ref(forest)] })).toThrow();
  });
});

describe("Garruk, Caller of Beasts", () => {
  it("+1 puts every creature card of the top five into hand, the rest on the bottom", () => {
    const { game } = table();
    const garruk = spawn(game, "Garruk, Caller of Beasts");
    const bears = [toLibrary(game, "Grizzly Bears"), toLibrary(game, "Grizzly Bears")];
    const before = hand(game).length;
    const libraryBefore = game.state.zones.perPlayer[A].library.length;
    loyalty(game, garruk, 1, { atLeast: 4 });
    expect(hand(game).length).toBe(before + 2);
    for (const bear of bears) expect(zone(game, bear)).toBe("hand");
    const library = game.state.zones.perPlayer[A].library;
    expect(library.length).toBe(libraryBefore - 2);
    expect(library.slice(-3).every((id) => game.state.objects[id].cardName === "Wastes")).toBe(true);
  });
});

describe("Steelform Sliver", () => {
  it("pumps only the Slivers you control", () => {
    const { game } = table();
    const mine = spawn(game, "Steelform Sliver");
    const theirs = spawn(game, "Cleaving Sliver", B);
    expect(pt(game, mine)).toEqual({ power: 2, toughness: 3 });
    expect(pt(game, theirs)).toEqual({ power: 4, toughness: 2 });
  });
});

describe("Chronicler of Heroes", () => {
  it("draws only if you control a creature with a +1/+1 counter", () => {
    const { game } = table();
    let before = hand(game).length;
    enter(game, "Chronicler of Heroes");
    expect(hand(game).length).toBe(before);
    const bear = spawn(game, "Grizzly Bears");
    game.state.objects[bear].counters["+1/+1"] = 1;
    before = hand(game).length;
    enter(game, "Chronicler of Heroes");
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Lagonna-Band Elder", () => {
  it("gains 3 life only while you control an enchantment", () => {
    const { game } = table();
    enter(game, "Lagonna-Band Elder");
    expect(life(game)).toBe(20);
    spawn(game, "Glorious Anthem");
    enter(game, "Lagonna-Band Elder");
    expect(life(game)).toBe(23);
  });
});

describe("Colossal Whale", () => {
  it("exiles a defending creature as it attacks, returning it when the Whale leaves", () => {
    const { game, a } = table();
    const whale = spawn(game, "Colossal Whale");
    const bear = spawn(game, "Grizzly Bears", B);
    pickModes(a, 0);
    pickTargets(a, bear);
    attack(game, a, [whale]);
    expect(zone(game, bear)).toBe("exile");
    destroy(game, whale);
    expect(zone(game, whale)).toBe("graveyard");
    expect(named(game, "Grizzly Bears", B).length).toBe(1);
    expect(graveyard(game, B).length).toBe(0);
  });
});

describe("Setessan Battle Priest", () => {
  it("heroic: gains 2 life when you cast a spell that targets it", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    const priest = spawn(game, "Setessan Battle Priest");
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(priest)] });
    expect(life(game)).toBe(22);
    expect(pt(game, priest)).toEqual({ power: 4, toughness: 6 });
  });
});
