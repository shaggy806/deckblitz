import { describe, expect, it } from "vitest";
import {
  A,
  B,
  activate,
  cast,
  counters,
  graveyard,
  lands,
  life,
  pickFromZone,
  pickModes,
  pt,
  ref,
  spawn,
  table,
  toHand,
  zone,
  nextTurn,
  settle,
} from "./harness.js";

describe("Gaea's Touch", () => {
  it("puts only a basic Forest from hand onto the battlefield, once each turn, without using the land drop", () => {
    const { game, a } = table();
    const touch = spawn(game, "Gaea's Touch");
    const forest = toHand(game, "Forest");
    const forest2 = toHand(game, "Forest");
    const shock = toHand(game, "Stomping Ground");
    const seen = pickFromZone(a, forest);
    activate(game, touch, 0);
    expect(seen.offered).toContain(forest);
    expect(seen.offered).not.toContain(shock);
    expect(zone(game, forest)).toBe("battlefield");
    expect(game.state.players[A].landsPlayedThisTurn ?? 0).toBe(0);
    expect(() => activate(game, touch, 0)).toThrow();
    expect(zone(game, forest2)).toBe("hand");
  });
});

describe("Ashes to Ashes", () => {
  it("exiles two nonartifact creatures and deals 5 damage to you", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const bears = spawn(game, "Grizzly Bears", B);
    const crow = spawn(game, "Storm Crow", B);
    cast(game, toHand(game, "Ashes to Ashes"), { targets: [ref(bears), ref(crow)] });
    expect(zone(game, bears)).toBe("exile");
    expect(zone(game, crow)).toBe("exile");
    expect(life(game, A)).toBe(15);
  });

  it("can't target an artifact creature or the same creature twice", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const bears = spawn(game, "Grizzly Bears", B);
    const thopter = spawn(game, "Ornithopter", B);
    expect(() => cast(game, toHand(game, "Ashes to Ashes"), { targets: [ref(bears), ref(thopter)] })).toThrow();
    expect(() => cast(game, toHand(game, "Ashes to Ashes"), { targets: [ref(bears), ref(bears)] })).toThrow();
  });
});

describe("Goblin Caves", () => {
  it("gives every Goblin +0/+2 only while on a basic Mountain", () => {
    const { game } = table();
    const mountain = spawn(game, "Mountain", B);
    const forest = spawn(game, "Forest");
    const goblin = spawn(game, "Raging Goblin");
    const theirGoblin = spawn(game, "Raging Goblin", B);
    const bears = spawn(game, "Grizzly Bears");
    const caves = spawn(game, "Goblin Caves");
    game.state.objects[caves].attachedTo = mountain;
    expect(pt(game, goblin)).toEqual({ power: 1, toughness: 3 });
    expect(pt(game, theirGoblin)).toEqual({ power: 1, toughness: 3 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    game.state.objects[caves].attachedTo = forest;
    expect(pt(game, goblin)).toEqual({ power: 1, toughness: 1 });
  });
});

describe("Uncle Istvan", () => {
  it("prevents damage from creatures, including their abilities, but not from other sources", () => {
    const { game } = table();
    const istvan = spawn(game, "Uncle Istvan");
    const sorcerer = spawn(game, "Prodigal Sorcerer");
    activate(game, sorcerer, 0, { targets: [ref(istvan)] });
    expect(game.state.objects[istvan].damageMarked).toBe(0);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Shock"), { targets: [ref(istvan)] });
    expect(game.state.objects[istvan].damageMarked).toBe(2);
  });
});

describe("Erosion", () => {
  it("destroys the enchanted land on its controller's upkeep unless they pay {1} or 1 life", () => {
    const { game, b } = table();
    const [forest] = lands(game, "Forest", 1, B);
    const erosion = spawn(game, "Erosion");
    game.state.objects[erosion].attachedTo = forest;
    pickModes(b, 1); // pay 1 life
    nextTurn(game); // bob's turn
    expect(zone(game, forest)).toBe("battlefield");
    expect(life(game, B)).toBe(19);
    nextTurn(game); // alice's turn: not her land
    expect(zone(game, forest)).toBe("battlefield");
    pickModes(b); // pay nothing
    nextTurn(game);
    expect(zone(game, forest)).toBe("graveyard");
    expect(life(game, B)).toBe(19);
  });
});

describe("Eternal Flame", () => {
  it("deals X to the opponent and half X, rounded up, to you", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    cast(game, toHand(game, "Eternal Flame"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(15);
    expect(life(game, A)).toBe(17);
  });
});

describe("Orc General", () => {
  it("sacrifices another Orc or Goblin to pump the other Orcs, everyone's", () => {
    const { game } = table();
    const general = spawn(game, "Orc General");
    const goblin = spawn(game, "Raging Goblin");
    const orc = spawn(game, "Orcish Artillery");
    const theirOrc = spawn(game, "Orcish Artillery", B);
    const bears = spawn(game, "Grizzly Bears");
    const own = { type: "activate-ability", player: A, source: general, abilityIndex: 0, targets: [], sacrifice: general } as const;
    expect(game.canDispatch(own)).not.toBeNull();
    expect(game.canDispatch({ ...own, sacrifice: bears })).not.toBeNull();
    game.dispatch({ ...own, sacrifice: goblin });
    settle(game);
    expect(zone(game, goblin)).toBe("graveyard");
    expect(pt(game, orc)).toEqual({ power: 2, toughness: 4 });
    expect(pt(game, theirOrc)).toEqual({ power: 2, toughness: 4 });
    expect(pt(game, general)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Living Armor", () => {
  it("puts +0/+1 counters equal to the creature's mana value", () => {
    const { game } = table();
    const armor = spawn(game, "Living Armor");
    const angel = spawn(game, "Serra Angel");
    activate(game, armor, 0, { targets: [ref(angel)] });
    expect(counters(game, angel, "+0/+1")).toBe(5);
    expect(pt(game, angel)).toEqual({ power: 4, toughness: 9 });
    expect(graveyard(game)).toContain(armor);
  });
});

describe("Savaen Elves", () => {
  it("destroys an Aura on a land, never one on a creature", () => {
    const { game } = table();
    const elves = spawn(game, "Savaen Elves");
    lands(game, "Forest", 2);
    const [land] = lands(game, "Forest", 1, B);
    const growth = spawn(game, "Wild Growth", B);
    game.state.objects[growth].attachedTo = land;
    const bears = spawn(game, "Grizzly Bears", B);
    const holy = spawn(game, "Holy Strength", B);
    game.state.objects[holy].attachedTo = bears;
    expect(() => activate(game, elves, 0, { targets: [ref(holy)], settle: false })).toThrow();
    activate(game, elves, 0, { targets: [ref(growth)] });
    expect(zone(game, growth)).toBe("graveyard");
  });
});

describe("Flood and Riptide", () => {
  it("Flood taps a creature without flying; Riptide taps every blue creature", () => {
    const { game } = table();
    const flood = spawn(game, "Flood");
    lands(game, "Island", 3);
    const crow = spawn(game, "Storm Crow", B);
    const merfolk = spawn(game, "Merfolk of the Pearl Trident", B);
    const bears = spawn(game, "Grizzly Bears", B);
    expect(() => activate(game, flood, 0, { targets: [ref(crow)], settle: false })).toThrow();
    activate(game, flood, 0, { targets: [ref(bears)] });
    expect(game.state.objects[bears].tapped).toBe(true);
    cast(game, toHand(game, "Riptide"));
    expect(game.state.objects[crow].tapped).toBe(true);
    expect(game.state.objects[merfolk].tapped).toBe(true);
  });
});

describe("Tivadar's Crusade and Goblin Digging Team", () => {
  it("destroys all Goblins; the Digging Team destroys a Wall", () => {
    const { game } = table();
    const team = spawn(game, "Goblin Digging Team");
    const wall = spawn(game, "Wall of Stone", B);
    activate(game, team, 0, { targets: [ref(wall)] });
    expect(zone(game, wall)).toBe("graveyard");
    expect(zone(game, team)).toBe("graveyard");
    const goblin = spawn(game, "Raging Goblin", B);
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 3);
    cast(game, toHand(game, "Tivadar's Crusade"));
    expect(zone(game, goblin)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
  });
});
