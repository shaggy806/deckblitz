/**
 * Commander 2018 and Core Set 2019 (C18, M19; B126), group D. One test per
 * card whose behaviour is more than a stat line, on the clause most likely to
 * be wrong.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { restrictionsOf } from "../characteristics.js";
import {
  A,
  B,
  C,
  activate,
  attack,
  cast,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  loyalty,
  pickModes,
  pickTargets,
  pt,
  ref,
  spawn,
  subtypes,
  table,
  toGraveyard,
  toHand,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

const planeswalker = (game: Game, name: string, player: PlayerId, n: number): ObjectId => {
  const id = spawn(game, name, player);
  game.state.objects[id].counters.loyalty = n;
  return id;
};

describe("Skull Storm", () => {
  it("makes each opponent sacrifice a creature, and each who can't loses half their life rounded up", () => {
    const { game } = table({ players: 3 });
    game.state.players[B].life = 15;
    const bears = spawn(game, "Grizzly Bears", C);
    lands(game, "Swamp", 9);
    cast(game, toHand(game, "Skull Storm"));
    expect(life(game, B)).toBe(7);
    expect(zone(game, bears)).toBe("graveyard");
    expect(life(game, C)).toBe(20);
  });
});

describe("Vedalken Humiliator", () => {
  it("with metalcraft, opponents' creatures lose all abilities and are 1/1 until end of turn", () => {
    const { game, a } = table();
    const humiliator = spawn(game, "Vedalken Humiliator");
    lands(game, "Sol Ring", 3);
    const angel = spawn(game, "Serra Angel", B);
    attack(game, a, [humiliator]);
    expect(pt(game, angel)).toEqual({ power: 1, toughness: 1 });
    expect(keywords(game, angel).has("flying")).toBe(false);
  });

  it("does nothing without three artifacts", () => {
    const { game, a } = table();
    const humiliator = spawn(game, "Vedalken Humiliator");
    lands(game, "Sol Ring", 2);
    const angel = spawn(game, "Serra Angel", B);
    attack(game, a, [humiliator]);
    expect(pt(game, angel)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Chromium, the Mutable", () => {
  it("becomes a 1/1 Human with no abilities but hexproof and can't be blocked", () => {
    const { game } = table();
    const chromium = spawn(game, "Chromium, the Mutable");
    const before = hand(game).length;
    activate(game, chromium, 0);
    expect(hand(game).length).toBe(before - 1);
    expect(pt(game, chromium)).toEqual({ power: 1, toughness: 1 });
    expect(subtypes(game, chromium)).toEqual(["Human"]);
    const kw = keywords(game, chromium);
    expect(kw.has("flying")).toBe(false);
    expect(kw.has("hexproof")).toBe(true);
    expect(restrictionsOf(game.state, game.registry, chromium).has("cant-be-blocked")).toBe(true);
  });
});

describe("Diamond Mare", () => {
  it("gains 1 life for a spell of the chosen color only", () => {
    const { game } = table();
    const mare = spawn(game, "Diamond Mare");
    game.state.objects[mare].chosenOnEnter = "B";
    lands(game, "Swamp", 1);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Dark Ritual"));
    expect(life(game)).toBe(21);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(life(game)).toBe(21);
  });
});

describe("Sparktongue Dragon", () => {
  it("deals 3 damage to any target when its {2}{R} is paid", () => {
    const { game, a } = table();
    lands(game, "Mountain", 3);
    pickModes(a, 0);
    pickTargets(a, B);
    enter(game, "Sparktongue Dragon");
    expect(life(game, B)).toBe(17);
  });
});

describe("Sarkhan, Dragonsoul and Sarkhan's Whelp", () => {
  it("+2 deals 1 to each opponent and their creatures, and the Whelp pings any target", () => {
    const { game, a } = table();
    spawn(game, "Sarkhan's Whelp");
    const sarkhan = planeswalker(game, "Sarkhan, Dragonsoul", A, 5);
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, B);
    loyalty(game, sarkhan, 2);
    expect(life(game, B)).toBe(18);
    expect(game.state.objects[bears].damageMarked).toBe(1);
    expect(game.state.objects[sarkhan].counters.loyalty).toBe(7);
  });
});

describe("Druid of Horns", () => {
  it("makes a 3/3 Beast when you cast an Aura targeting it", () => {
    const { game } = table();
    const druid = spawn(game, "Druid of Horns");
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Rancor"), { targets: [ref(druid)] });
    expect(tokensNamed(game, "3/3 Beast Token", A)).toBe(1);
  });
});

describe("Novice Knight", () => {
  it("can attack while enchanted", () => {
    const { game, a } = table();
    const knight = spawn(game, "Novice Knight");
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Rancor"), { targets: [ref(knight)] });
    attack(game, a, [knight]);
    expect(life(game, B)).toBe(16);
  });
});

describe("Leonin Vanguard", () => {
  it("gets +1/+1 and gains you 1 life at combat with three creatures", () => {
    const { game } = table();
    const vanguard = spawn(game, "Leonin Vanguard");
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    toStep(game, "declare-attackers");
    expect(pt(game, vanguard)).toEqual({ power: 2, toughness: 2 });
    expect(life(game)).toBe(21);
  });

  it("does nothing with two", () => {
    const { game } = table();
    const vanguard = spawn(game, "Leonin Vanguard");
    spawn(game, "Grizzly Bears");
    toStep(game, "declare-attackers");
    expect(pt(game, vanguard)).toEqual({ power: 1, toughness: 1 });
    expect(life(game)).toBe(20);
  });
});

describe("Vivien's Jaguar", () => {
  it("returns from the graveyard only while you control a Vivien planeswalker", () => {
    const { game } = table();
    const jaguar = toGraveyard(game, "Vivien's Jaguar");
    lands(game, "Forest", 3);
    expect(() => activate(game, jaguar, 0)).toThrow();
    planeswalker(game, "Vivien Reid", A, 5);
    activate(game, jaguar, 0);
    expect(zone(game, jaguar)).toBe("hand");
  });
});

describe("Surge Mare", () => {
  it("may loot when it deals damage to an opponent", () => {
    const { game, a } = table();
    const mare = spawn(game, "Surge Mare");
    lands(game, "Island", 2);
    activate(game, mare, 0);
    pickModes(a, 0);
    const before = hand(game).length;
    const graveBefore = graveyard(game).length;
    attack(game, a, [mare]);
    expect(life(game, B)).toBe(18);
    expect(hand(game).length).toBe(before);
    expect(graveyard(game).length).toBe(graveBefore + 1);
  });
});
