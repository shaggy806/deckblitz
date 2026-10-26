/**
 * Planar Chaos (PLC; B200) — group C.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  destroy,
  enter,
  keywords,
  lands,
  life,
  nextTurn,
  pickModes,
  pickPermanents,
  pt,
  ref,
  spawn,
  toHand,
  zone,
  table,
} from "./harness.js";

describe("Dash Hopes", () => {
  it("is countered when another player pays 5 life", () => {
    const { game, a, b } = table();
    lands(game, "Forest", 2);
    lands(game, "Swamp", 2);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears, { settle: false });
    pickModes(a);
    pickModes(b, 0);
    const dash = toHand(game, "Dash Hopes");
    cast(game, dash, { targets: [ref(bears)] });
    expect(life(game, B)).toBe(15);
    expect(life(game, A)).toBe(20);
    expect(zone(game, dash)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("counters its target when nobody pays", () => {
    const { game, a, b } = table();
    lands(game, "Forest", 2);
    lands(game, "Swamp", 2);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears, { settle: false });
    pickModes(a);
    pickModes(b);
    cast(game, toHand(game, "Dash Hopes"), { targets: [ref(bears)] });
    expect(life(game, B)).toBe(20);
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Brain Gorgers", () => {
  it("is countered when an opponent sacrifices a creature", () => {
    const { game, a, b } = table();
    lands(game, "Swamp", 4);
    const lions = spawn(game, "Savannah Lions", B);
    pickModes(a);
    pickModes(b, 0);
    b.chooseSacrificesFn = () => [lions];
    const gorgers = toHand(game, "Brain Gorgers");
    cast(game, gorgers);
    expect(zone(game, lions)).toBe("graveyard");
    expect(zone(game, gorgers)).toBe("graveyard");
  });
});

describe("Fatal Frenzy", () => {
  it("doubles power, grants trample, and sacrifices the creature at the next end step", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Fatal Frenzy"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 2 });
    expect(keywords(game, bears).has("trample")).toBe(true);
    nextTurn(game);
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Crovax, Ascendant Hero", () => {
  it("pumps other white creatures and shrinks nonwhite ones, every player's", () => {
    const { game } = table();
    const crovax = spawn(game, "Crovax, Ascendant Hero");
    const lions = spawn(game, "Savannah Lions", B);
    const bears = spawn(game, "Grizzly Bears", B);
    expect(pt(game, crovax)).toEqual({ power: 4, toughness: 4 });
    expect(pt(game, lions)).toEqual({ power: 3, toughness: 2 });
    expect(pt(game, bears)).toEqual({ power: 1, toughness: 1 });
    activate(game, crovax);
    expect(zone(game, crovax)).toBe("hand");
    expect(life(game, A)).toBe(18);
  });
});

describe("Dust Elemental", () => {
  it("returns every creature you control, itself included, when you have fewer than three", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const other = spawn(game, "Savannah Lions", B);
    const seen = pickPermanents(a);
    a.choosePermanentsFn = (_view, eligible) => {
      seen.offered = eligible;
      return eligible;
    };
    const dust = enter(game, "Dust Elemental");
    expect(seen.offered).not.toContain(other);
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, dust)).toBe("hand");
    expect(zone(game, other)).toBe("battlefield");
  });
});

describe("Oros, the Avenger", () => {
  it("deals 3 damage to each nonwhite creature when you pay {2}{W}", () => {
    const { game, a } = table();
    lands(game, "Plains", 3);
    const oros = spawn(game, "Oros, the Avenger");
    const bears = spawn(game, "Grizzly Bears", B);
    const lions = spawn(game, "Savannah Lions", B);
    pickModes(a, 0);
    attack(game, a, [oros]);
    expect(life(game, B)).toBe(14);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, lions)).toBe("battlefield");
    expect(zone(game, oros)).toBe("battlefield");
  });
});

describe("Mantle of Leadership", () => {
  it("gives the enchanted creature +2/+2 whenever any creature enters", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Mantle of Leadership"), { targets: [ref(bears)] });
    enter(game, "Savannah Lions", B);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Poultice Sliver", () => {
  it("gives every Sliver a regeneration ability, an opponent's too", () => {
    const { game } = table();
    spawn(game, "Poultice Sliver");
    const theirs = spawn(game, "Battering Sliver", B);
    expect(keywords(game, theirs).has("trample")).toBe(true);
    const def = game.registry.get("Poultice Sliver");
    expect(def.static[0].grantsActivated?.[0].cost.mana).toBe("{2}");
  });
});

describe("Aven Riftwatcher", () => {
  it("enters with three time counters and gains 2 life on entering and leaving", () => {
    const { game } = table();
    const aven = enter(game, "Aven Riftwatcher");
    expect(game.state.objects[aven].counters.time).toBe(3);
    expect(life(game, A)).toBe(22);
    destroy(game, aven);
    expect(life(game, A)).toBe(24);
  });
});
