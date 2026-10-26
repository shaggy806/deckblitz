import { describe, expect, it } from "vitest";
import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  destroy,
  enter,
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
  types,
  zone,
} from "./harness.js";

describe("Ogre Marauder", () => {
  it("can't be blocked when the defending player won't sacrifice", () => {
    const { game, a, b } = table();
    const ogre = spawn(game, "Ogre Marauder");
    const bears = spawn(game, "Grizzly Bears", B);
    pickModes(b);
    attack(game, a, [ogre]);
    expect(zone(game, bears)).toBe("battlefield");
    expect(keywords(game, ogre).has("unblockable")).toBe(true);
  });

  it("stays blockable when the defending player sacrifices a creature", () => {
    const { game, a, b } = table();
    const ogre = spawn(game, "Ogre Marauder");
    const bears = spawn(game, "Grizzly Bears", B);
    pickModes(b, 0);
    b.chooseSacrificesFn = () => [bears];
    attack(game, a, [ogre]);
    expect(zone(game, bears)).toBe("graveyard");
    expect(keywords(game, ogre).has("unblockable")).toBe(false);
  });
});

describe("Genju of the Fens", () => {
  it("animates the enchanted Swamp, which gains a {B} pump", () => {
    const { game, a } = table();
    const [swamp] = lands(game, "Swamp", 5);
    pickTargets(a, swamp!);
    cast(game, toHand(game, "Genju of the Fens"), { targets: [ref(swamp)] });
    const genju = game.battlefield.find((id) => game.state.objects[id].cardName === "Genju of the Fens");
    expect(genju).toBeDefined();
    activate(game, genju!, 0);
    expect(types(game, swamp)).toEqual(expect.arrayContaining(["creature", "land"]));
    expect(pt(game, swamp)).toEqual({ power: 2, toughness: 2 });
    activate(game, swamp, 1);
    expect(pt(game, swamp)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Blademane Baku", () => {
  it("gets +2/+0 for each ki counter removed", () => {
    const { game } = table();
    const baku = spawn(game, "Blademane Baku");
    game.state.objects[baku].counters.ki = 2;
    lands(game, "Wastes", 1);
    activate(game, baku, 0, { x: 2 });
    expect(counters(game, baku, "ki")).toBe(0);
    expect(pt(game, baku)).toEqual({ power: 5, toughness: 1 });
  });
});

describe("Skullmane Baku", () => {
  it("gives the target -X/-X for X ki counters removed", () => {
    const { game } = table();
    const baku = spawn(game, "Skullmane Baku");
    const bears = spawn(game, "Grizzly Bears", B);
    game.state.objects[baku].counters.ki = 2;
    lands(game, "Wastes", 1);
    activate(game, baku, 0, { x: 2, targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Ward of Piety", () => {
  it("redirects the next 1 damage to the enchanted creature to any target", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 4);
    cast(game, toHand(game, "Ward of Piety"), { targets: [ref(bears)] });
    const ward = game.battlefield.find((id) => game.state.objects[id].cardName === "Ward of Piety")!;
    activate(game, ward, 0, { targets: [ref(B)] });
    game.debugApplyEffect(B, { kind: "damage", amount: 2, target: 0 }, [ref(bears)]);
    settle(game);
    expect(life(game, B)).toBe(19);
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[bears].damageMarked).toBe(1);
  });
});

describe("Orochi Hatchery", () => {
  it("enters with X charge counters and makes a Snake for each", () => {
    const { game } = table();
    lands(game, "Wastes", 9);
    cast(game, toHand(game, "Orochi Hatchery"), { x: 2 });
    const hatchery = game.battlefield.find((id) => game.state.objects[id].cardName === "Orochi Hatchery")!;
    expect(counters(game, hatchery, "charge")).toBe(2);
    activate(game, hatchery, 0);
    expect(tokensNamed(game, "Snake Token", A)).toBe(2);
  });
});

describe("Night of Souls' Betrayal", () => {
  it("gives every creature -1/-1", () => {
    const { game } = table();
    spawn(game, "Night of Souls' Betrayal");
    const bears = spawn(game, "Grizzly Bears", B);
    expect(pt(game, bears)).toEqual({ power: 1, toughness: 1 });
  });
});

describe("Myojin of Seeing Winds", () => {
  it("enters with a divinity counter from hand, is indestructible, and draws per permanent", () => {
    const { game } = table();
    lands(game, "Island", 10);
    cast(game, toHand(game, "Myojin of Seeing Winds"));
    const myojin = game.battlefield.find((id) => game.state.objects[id].cardName === "Myojin of Seeing Winds")!;
    expect(counters(game, myojin, "divinity")).toBe(1);
    expect(keywords(game, myojin).has("indestructible")).toBe(true);
    const before = hand(game).length;
    activate(game, myojin, 0);
    expect(hand(game).length - before).toBe(11);
    expect(keywords(game, myojin).has("indestructible")).toBe(false);
  });

  it("has no divinity counter when it didn't come from your hand", () => {
    const { game } = table();
    const myojin = enter(game, "Myojin of Seeing Winds");
    expect(counters(game, myojin, "divinity")).toBe(0);
    expect(keywords(game, myojin).has("indestructible")).toBe(false);
  });
});

describe("Blood Speaker", () => {
  it("sacrifices itself in upkeep to fetch a Demon, and returns when a Demon enters", () => {
    const { game, a } = table();
    spawn(game, "Blood Speaker");
    const demon = toLibrary(game, "Demonlord of Ashmouth");
    pickModes(a, 0);
    pickFromZone(a, demon);
    toStep(game, "upkeep");
    settle(game);
    expect(zone(game, demon)).toBe("hand");
    const inYard = game.state.zones.perPlayer[A].graveyard.find(
      (id) => game.state.objects[id].cardName === "Blood Speaker",
    );
    expect(inYard).toBeDefined();
    // Demonlord's own "exile it unless you sacrifice another creature": decline.
    pickModes(a);
    enter(game, "Demonlord of Ashmouth");
    expect(zone(game, inYard!)).toBe("hand");
  });

  it("returns from the graveyard however it got there", () => {
    const { game, a } = table();
    const card = toGraveyard(game, "Blood Speaker");
    pickModes(a);
    enter(game, "Demonlord of Ashmouth");
    expect(zone(game, card)).toBe("hand");
  });
});

describe("Samurai of the Pale Curtain", () => {
  it("exiles a permanent that would be put into a graveyard", () => {
    const { game } = table();
    spawn(game, "Samurai of the Pale Curtain");
    const bears = spawn(game, "Grizzly Bears", B);
    destroy(game, bears, A);
    expect(zone(game, bears)).toBe("exile");
  });
});

describe("Ogre Recluse", () => {
  it("taps whenever a player casts a spell", () => {
    const { game } = table();
    const ogre = spawn(game, "Ogre Recluse");
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Grizzly Bears"));
    expect(game.state.objects[ogre].tapped).toBe(true);
  });
});
