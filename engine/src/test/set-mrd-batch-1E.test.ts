import { describe, expect, it } from "vitest";
import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  enter,
  hand,
  lands,
  life,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  tokensNamed,
  types,
  zone,
} from "./harness.js";

// Mirrodin (MRD), batch 215 group E.

describe("Promise of Power", () => {
  it("entwined, draws five and loses 5 life first, so the Demon counts the drawn cards", () => {
    const { game } = table();
    lands(game, "Swamp", 9);
    const promise = toHand(game, "Promise of Power");
    const before = hand(game).length; // the Promise itself is one of these
    cast(game, promise, { modes: [0, 1], kicked: true });
    expect(life(game)).toBe(15);
    const inHand = before - 1 + 5;
    expect(hand(game).length).toBe(inHand);
    const demon = game.battlefield.find((id) => game.state.objects[id].cardName === "X/X Demon Token (Flying)")!;
    expect(pt(game, demon)).toEqual({ power: inHand, toughness: inHand });
  });
});

describe("Sword of Kaldra", () => {
  it("exiles a creature the equipped creature dealt damage to and that survived", () => {
    const { game, a, b } = table();
    const bears = spawn(game, "Grizzly Bears");
    const sword = spawn(game, "Sword of Kaldra");
    lands(game, "Wastes", 4);
    activate(game, sword, 0, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 7, toughness: 7 });
    const myr = spawn(game, "Darksteel Myr", B);
    b.declareBlockersFn = () => [{ blocker: myr, attacker: bears }];
    attack(game, a, [bears]);
    settle(game);
    expect(zone(game, myr)).toBe("exile");
  });
});

describe("Banshee's Blade", () => {
  it("gets a charge counter when the equipped creature deals combat damage, and pumps by them", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const blade = spawn(game, "Banshee's Blade");
    lands(game, "Wastes", 2);
    activate(game, blade, 0, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    attack(game, a, [bears]);
    settle(game);
    expect(counters(game, blade, "charge")).toBe(1);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    expect(life(game, B)).toBe(18);
  });
});

describe("Lightning Coils", () => {
  it("at five charge counters, removes them all and makes that many hasty Elementals", () => {
    const { game } = table();
    const coils = spawn(game, "Lightning Coils");
    game.state.objects[coils].counters.charge = 6;
    toStep(game, "upkeep", A);
    settle(game);
    expect(counters(game, coils, "charge")).toBe(0);
    expect(tokensNamed(game, "3/1 Red Elemental Token (Haste)", A)).toBe(6);
  });

  it("does nothing below five", () => {
    const { game } = table();
    const coils = spawn(game, "Lightning Coils");
    game.state.objects[coils].counters.charge = 4;
    toStep(game, "upkeep", A);
    settle(game);
    expect(counters(game, coils, "charge")).toBe(4);
    expect(tokensNamed(game, "3/1 Red Elemental Token (Haste)", A)).toBe(0);
  });
});

describe("Vulshok Battlemaster", () => {
  it("attaches every Equipment, an opponent's included, without changing control", () => {
    const { game } = table();
    const bobBears = spawn(game, "Grizzly Bears", B);
    const bobSword = spawn(game, "Bonesplitter", B);
    game.state.objects[bobSword].attachedTo = bobBears;
    const mine = spawn(game, "Bonesplitter", A);
    const master = enter(game, "Vulshok Battlemaster");
    expect(game.state.objects[bobSword].attachedTo).toBe(master);
    expect(game.state.objects[mine].attachedTo).toBe(master);
    expect(game.state.objects[bobSword].controller).toBe(B);
    expect(pt(game, master)).toEqual({ power: 6, toughness: 2 });
  });
});

describe("Forge Armor", () => {
  it("puts counters equal to the sacrificed artifact's mana value", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    const bears = spawn(game, "Grizzly Bears");
    const sword = spawn(game, "Sword of Kaldra");
    const armor = toHand(game, "Forge Armor");
    cast(game, armor, { targets: [ref(bears)], sacrifice: sword });
    expect(zone(game, sword)).toBe("graveyard");
    expect(counters(game, bears)).toBe(4);
  });
});

describe("Serum Tank", () => {
  it("counts itself and any other artifact entering", () => {
    const { game } = table();
    const tank = enter(game, "Serum Tank");
    expect(counters(game, tank, "charge")).toBe(1);
    enter(game, "Ornithopter", B);
    expect(counters(game, tank, "charge")).toBe(2);
  });
});

describe("Tel-Jilad Stylus", () => {
  it("puts a permanent its controller owns on the bottom of their library", () => {
    const { game } = table();
    const stylus = spawn(game, "Tel-Jilad Stylus");
    const bears = spawn(game, "Grizzly Bears");
    activate(game, stylus, 0, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("library");
    const library = game.state.zones.perPlayer[A].library;
    expect(library[library.length - 1] === bears || library[0] === bears).toBe(true);
  });
});

describe("Nightmare Lash", () => {
  it("equips for 3 life and pumps per Swamp", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const bears = spawn(game, "Grizzly Bears");
    const lash = spawn(game, "Nightmare Lash");
    activate(game, lash, 0, { targets: [ref(bears)] });
    expect(life(game)).toBe(17);
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 5 });
  });
});

describe("Pentavus", () => {
  it("enters with five counters, trades one for a Pentavite and a Pentavite back for one", () => {
    const { game } = table();
    lands(game, "Wastes", 2);
    const pentavus = enter(game, "Pentavus");
    expect(counters(game, pentavus)).toBe(5);
    activate(game, pentavus, 0);
    expect(counters(game, pentavus)).toBe(4);
    const token = game.battlefield.find((id) => game.state.objects[id].cardName === "Pentavite Token")!;
    expect(types(game, token)).toEqual(expect.arrayContaining(["artifact", "creature"]));
    game.dispatch({ type: "activate-ability", player: A, source: pentavus, abilityIndex: 1, targets: [], sacrifice: token });
    settle(game);
    expect(counters(game, pentavus)).toBe(5);
    expect(tokensNamed(game, "Pentavite Token")).toBe(0);
  });
});

describe("Skeleton Shard", () => {
  it("returns an artifact creature card for {B}", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    const shard = spawn(game, "Skeleton Shard");
    const myr = toGraveyard(game, "Darksteel Myr");
    activate(game, shard, 1, { targets: [ref(myr)] });
    expect(zone(game, myr)).toBe("hand");
  });
});
