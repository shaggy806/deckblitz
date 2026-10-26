import { describe, expect, it } from "vitest";

import {
  A,
  B,
  attack,
  cast,
  destroy,
  enter,
  hand,
  keywords,
  lands,
  life,
  named,
  nextTurn,
  pickModes,
  pickTargets,
  pt,
  ref,
  spawn,
  table,
  toHand,
  zone,
} from "./harness.js";

describe("Invincible Hymn", () => {
  it("gains up to the library's size", () => {
    const { game } = table();
    lands(game, "Plains", 8);
    cast(game, toHand(game, "Invincible Hymn"));
    expect(life(game)).toBe(game.state.zones.perPlayer[A].library.length);
    expect(life(game)).toBeGreaterThan(20);
  });

  it("loses down to the library's size", () => {
    const { game } = table({ life: 60 });
    lands(game, "Plains", 8);
    cast(game, toHand(game, "Invincible Hymn"));
    expect(life(game)).toBe(game.state.zones.perPlayer[A].library.length);
    expect(life(game)).toBeLessThan(60);
  });
});

describe("Wretched Banquet", () => {
  it("destroys a creature tied for least power", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    spawn(game, "Ornithopter", B);
    const thopter = spawn(game, "Ornithopter");
    spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Wretched Banquet"), { targets: [ref(thopter)] });
    expect(zone(game, thopter)).toBe("graveyard");
  });

  it("does nothing when another creature has less power", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    spawn(game, "Ornithopter");
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Wretched Banquet"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Minion Reflector", () => {
  it("pays {2} for a hasty token copy, sacrificed at the end step", () => {
    const { game, a } = table();
    lands(game, "Wastes", 2);
    spawn(game, "Minion Reflector");
    pickModes(a, 0);
    const bears = enter(game, "Grizzly Bears");
    const copies = named(game, "Grizzly Bears", A).filter((id) => id !== bears);
    expect(copies).toHaveLength(1);
    expect(game.state.objects[copies[0]].isToken).toBe(true);
    expect(keywords(game, copies[0]).has("haste")).toBe(true);
    nextTurn(game);
    expect(named(game, "Grizzly Bears", A)).toEqual([bears]);
  });
});

describe("Sludge Strider", () => {
  it("drains for {1} when another artifact enters and again when it leaves", () => {
    const { game, a } = table();
    lands(game, "Wastes", 2);
    spawn(game, "Sludge Strider");
    pickTargets(a, B);
    pickModes(a, 0);
    const thopter = enter(game, "Ornithopter");
    expect(life(game, B)).toBe(19);
    expect(life(game)).toBe(21);
    destroy(game, thopter);
    expect(life(game, B)).toBe(18);
    expect(life(game)).toBe(22);
  });
});

describe("Filigree Fracture", () => {
  it("draws for a blue artifact, not for a colourless one", () => {
    const { game } = table();
    lands(game, "Forest", 6);
    const strix = spawn(game, "Parasitic Strix", B);
    const thopter = spawn(game, "Ornithopter", B);
    const fracture = toHand(game, "Filigree Fracture");
    const before = hand(game).length;
    cast(game, fracture, { targets: [ref(strix)] });
    expect(zone(game, strix)).toBe("graveyard");
    expect(hand(game).length).toBe(before);
    const second = toHand(game, "Filigree Fracture");
    const before2 = hand(game).length;
    cast(game, second, { targets: [ref(thopter)] });
    expect(zone(game, thopter)).toBe("graveyard");
    expect(hand(game).length).toBe(before2 - 1);
  });
});

describe("Elder Mastery", () => {
  it("makes the damaged player discard two cards", () => {
    const { game, a } = table();
    lands(game, "Island", 1);
    lands(game, "Swamp", 1);
    lands(game, "Mountain", 1);
    lands(game, "Wastes", 3);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Elder Mastery"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 5 });
    const before = hand(game, B).length;
    attack(game, a, [bears]);
    expect(life(game, B)).toBe(15);
    expect(hand(game, B).length).toBe(before - 2);
  });
});

describe("Aven Trailblazer", () => {
  it("has toughness equal to its domain count", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    lands(game, "Island", 1);
    const aven = spawn(game, "Aven Trailblazer");
    expect(pt(game, aven)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Controlled Instincts", () => {
  it("can enchant only a red or green creature", () => {
    const { game } = table();
    lands(game, "Island", 2);
    const lions = spawn(game, "Savannah Lions", B);
    const bears = spawn(game, "Grizzly Bears", B);
    expect(() => cast(game, toHand(game, "Controlled Instincts"), { targets: [ref(lions)] })).toThrow();
    const aura = toHand(game, "Controlled Instincts");
    cast(game, aura, { targets: [ref(bears)] });
    expect(game.state.objects[aura].attachedTo).toBe(bears);
  });
});

describe("Parasitic Strix", () => {
  it("drains only if you control a black permanent", () => {
    const { game, a } = table();
    pickTargets(a, B);
    enter(game, "Parasitic Strix");
    expect(life(game, B)).toBe(20);
    spawn(game, "Rotting Rats");
    enter(game, "Parasitic Strix");
    expect(life(game, B)).toBe(18);
    expect(life(game)).toBe(22);
  });
});
