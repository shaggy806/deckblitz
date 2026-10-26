/**
 * The set walk, Magic 2013 (M13) and Avacyn Restored (AVR), group C
 * (2026-10-26). Written on the shared table in `harness.ts`, each from the
 * Oracle text.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  controller,
  counters,
  destroy,
  enter,
  hand,
  keywords,
  lands,
  life,
  named,
  pickFromZone,
  pickModes,
  pickTargets,
  pt,
  ref,
  spawn,
  table,
  toHand,
  toLibrary,
  toStep,
  types,
} from "./harness.js";

describe("Diabolic Revelation", () => {
  it("puts up to X chosen cards from the library into the hand", () => {
    const { game, a } = table();
    lands(game, "Swamp", 7);
    const first = toLibrary(game, "Opt");
    const second = toLibrary(game, "Lightning Bolt");
    const spell = toHand(game, "Diabolic Revelation");
    const before = hand(game).length;
    pickFromZone(a, first, second);
    cast(game, spell, { x: 2 });
    expect(hand(game)).toContain(first);
    expect(hand(game)).toContain(second);
    expect(hand(game).length).toBe(before - 1 + 2);
  });
});

describe("Augur of Bolas", () => {
  it("offers only an instant or sorcery among the top three", () => {
    const { game, a } = table();
    toLibrary(game, "Grizzly Bears");
    const bolt = toLibrary(game, "Lightning Bolt");
    const offers: (readonly string[])[] = [];
    // The pick, then the order of the other two on the bottom.
    a.chooseFromZoneFn = (_view, eligible) => {
      offers.push(eligible);
      return offers.length === 1 ? [bolt] : eligible;
    };
    enter(game, "Augur of Bolas");
    expect(offers[0]).toEqual([bolt]);
    expect(hand(game)).toContain(bolt);
  });
});

describe("Touch of the Eternal", () => {
  it("sets the life total to the number of permanents its controller controls", () => {
    const { game } = table();
    spawn(game, "Touch of the Eternal");
    lands(game, "Wastes", 2);
    toStep(game, "precombat-main", B);
    toStep(game, "draw");
    expect(life(game)).toBe(3);
  });

  it("raises a lower life total to that number", () => {
    const { game } = table();
    spawn(game, "Touch of the Eternal");
    lands(game, "Wastes", 4);
    game.state.players[A].life = 2;
    toStep(game, "precombat-main", B);
    toStep(game, "draw");
    expect(life(game)).toBe(5);
  });
});

describe("Void Stalker", () => {
  it("shuffles itself and the target creature into their owners' libraries", () => {
    const { game } = table();
    const stalker = spawn(game, "Void Stalker");
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 3);
    const libA = game.state.zones.perPlayer[A].library.length;
    const libB = game.state.zones.perPlayer[B].library.length;
    activate(game, stalker, 0, { targets: [ref(bears)] });
    expect(named(game, "Void Stalker")).toHaveLength(0);
    expect(named(game, "Grizzly Bears")).toHaveLength(0);
    expect(game.state.zones.perPlayer[A].library.length).toBe(libA + 1);
    expect(game.state.zones.perPlayer[B].library.length).toBe(libB + 1);
  });
});

describe("Bladed Bracers", () => {
  it("gives +1/+1 to any equipped creature, vigilance only to a Human or an Angel", () => {
    const { game } = table();
    const bracers = spawn(game, "Bladed Bracers");
    const bears = spawn(game, "Grizzly Bears");
    const vanguard = spawn(game, "Elite Vanguard");
    lands(game, "Wastes", 4);
    activate(game, bracers, 0, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, bears).has("vigilance")).toBe(false);
    activate(game, bracers, 0, { targets: [ref(vanguard)] });
    expect(pt(game, vanguard)).toEqual({ power: 3, toughness: 2 });
    expect(keywords(game, vanguard).has("vigilance")).toBe(true);
  });
});

describe("Treacherous Pit-Dweller", () => {
  it("returns with undying and its new controller is the target opponent", () => {
    const { game, a } = table();
    pickTargets(a, B);
    const dweller = enter(game, "Treacherous Pit-Dweller");
    expect(controller(game, dweller)).toBe(A);
    destroy(game, dweller);
    const [back] = named(game, "Treacherous Pit-Dweller");
    expect(back).toBeDefined();
    expect(counters(game, back)).toBe(1);
    expect(controller(game, back)).toBe(B);
  });
});

describe("Angel's Tomb", () => {
  it("may become a 3/3 white Angel artifact creature with flying when a creature enters", () => {
    const { game, a } = table();
    const tomb = spawn(game, "Angel's Tomb");
    expect(types(game, tomb)).not.toContain("creature");
    pickModes(a, 0);
    enter(game, "Grizzly Bears");
    expect(types(game, tomb)).toEqual(expect.arrayContaining(["artifact", "creature"]));
    expect(pt(game, tomb)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, tomb).has("flying")).toBe(true);
  });
});

describe("Ghostly Touch", () => {
  it("gives the enchanted creature an attack trigger that may untap a permanent", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Island", 2);
    pickTargets(a, bears);
    cast(game, toHand(game, "Ghostly Touch"), { targets: [ref(bears)] });
    const land = spawn(game, "Wastes", B, { tapped: true });
    pickTargets(a, land);
    pickModes(a, 1);
    attack(game, a, [bears]);
    expect(game.state.objects[land].tapped).toBe(false);
  });
});

describe("Death Wind", () => {
  it("gives -X/-X", () => {
    const { game } = table();
    const lions = spawn(game, "Serra Angel", B);
    lands(game, "Swamp", 4);
    cast(game, toHand(game, "Death Wind"), { x: 3, targets: [ref(lions)] });
    expect(pt(game, lions)).toEqual({ power: 1, toughness: 1 });
  });
});
