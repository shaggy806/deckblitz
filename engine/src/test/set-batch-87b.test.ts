/**
 * Set walk batch 87, part b (2026-10-15): Modern Horizons 3 (MH3) and Modern Horizons 3 Commander (M3C), the rest of the sets.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

import {
  A,
  B,
  C,
  activate,
  attack,
  cast,
  counters,
  enter,
  grant,
  hand,
  life,
  named,
  pickFromZone,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  tokensNamed,
  watchTargets,
  zone,
} from "./harness.js";

const isTapped = (game: Game, id: ObjectId): boolean => game.state.objects[id].tapped === true;
const libraryOf = (game: Game, player: PlayerId): readonly ObjectId[] => game.state.zones.perPlayer[player].library;
const castOffers = (game: Game, card: ObjectId) =>
  game
    .legalActions(A)
    .filter((a): a is Extract<LegalAction, { kind: "cast-spell" }> => a.kind === "cast-spell" && a.card === card);

describe("White Orchid Phantom", () => {
  it("destroys a nonbasic land, and its controller may fetch a basic land tapped", () => {
    const { game, a, b } = table();
    const tower = spawn(game, "Command Tower", B);
    const basic = spawn(game, "Wastes", B);
    const seen = watchTargets(a, () => [tower]);
    const wastes = libraryOf(game, B)[0];
    pickFromZone(b, wastes);
    enter(game, "White Orchid Phantom");
    // A basic land isn't a legal target.
    expect(seen.offered[0]).toContain(tower);
    expect(seen.offered[0]).not.toContain(basic);
    expect(zone(game, tower)).toBe("graveyard");
    expect(zone(game, wastes)).toBe("battlefield");
    expect(game.state.objects[wastes].controller).toBe(B);
    expect(isTapped(game, wastes)).toBe(true);
  });

  it("still lets the controller search when the land survives (indestructible)", () => {
    const { game, a, b } = table();
    const tower = spawn(game, "Command Tower", B);
    grant(game, tower, "indestructible");
    pickTargets(a, tower);
    const wastes = libraryOf(game, B)[0];
    pickFromZone(b, wastes);
    enter(game, "White Orchid Phantom");
    expect(zone(game, tower)).toBe("battlefield");
    expect(zone(game, wastes)).toBe("battlefield");
  });

  it("is up to one: with no land chosen, nobody searches", () => {
    const { game, a, b } = table();
    spawn(game, "Command Tower", B);
    pickTargets(a, null);
    let asked = 0;
    b.chooseFromZoneFn = (_view, eligible) => {
      asked += 1;
      return eligible.slice(0, 1);
    };
    const before = libraryOf(game, B).length;
    enter(game, "White Orchid Phantom");
    expect(asked).toBe(0);
    expect(libraryOf(game, B).length).toBe(before);
  });
});

describe("Cranial Ram", () => {
  it("makes a Germ that gets +X/+1 for the artifacts you control", () => {
    const { game } = table();
    enter(game, "Cranial Ram");
    const [germ] = named(game, "Phyrexian Germ Token");
    // The Ram is the one artifact: 0/0 + 1/1.
    expect(pt(game, germ)).toEqual({ power: 1, toughness: 1 });
    spawn(game, "Memnite");
    spawn(game, "Ornithopter");
    expect(pt(game, germ)).toEqual({ power: 3, toughness: 1 });
    // An opponent's artifact isn't yours.
    spawn(game, "Memnite", B);
    expect(pt(game, germ)).toEqual({ power: 3, toughness: 1 });
  });

  it("equips for {2}", () => {
    const { game } = table();
    // Cast, so the game stays in the main phase.
    const ram = toHand(game, "Cranial Ram");
    spawn(game, "Swamp");
    spawn(game, "Mountain");
    cast(game, ram);
    expect(tokensNamed(game, "Phyrexian Germ Token")).toBe(1);
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Wastes");
    spawn(game, "Wastes");
    activate(game, ram, 0, { targets: [ref(bears)] });
    // The Ram is the one artifact: +1/+1. The Germ, unequipped, dies.
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    expect(tokensNamed(game, "Phyrexian Germ Token")).toBe(0);
  });
});

describe("Refurbished Familiar", () => {
  it("makes each opponent discard, and draws a card for each who can't", () => {
    const { game } = table({ players: 3 });
    // Carol has no cards to discard.
    game.debugApplyEffect(C, { kind: "discard-hand", who: "you" });
    expect(hand(game, C).length).toBe(0);
    const bobHand = hand(game, B).length;
    const mine = hand(game, A).length;
    enter(game, "Refurbished Familiar");
    expect(hand(game, B).length).toBe(bobHand - 1);
    expect(hand(game, A).length).toBe(mine + 1);
  });

  it("draws nothing when every opponent discards", () => {
    const { game } = table({ players: 3 });
    const mine = hand(game, A).length;
    enter(game, "Refurbished Familiar");
    expect(hand(game, A).length).toBe(mine);
    expect(hand(game, B).length).toBe(6);
    expect(hand(game, C).length).toBe(6);
  });

  it("has affinity for artifacts", () => {
    const { game } = table();
    const familiar = toHand(game, "Refurbished Familiar");
    spawn(game, "Swamp");
    expect(castOffers(game, familiar)).toEqual([]);
    spawn(game, "Memnite");
    spawn(game, "Memnite");
    spawn(game, "Ornithopter");
    expect(castOffers(game, familiar).length).toBeGreaterThan(0);
  });
});

describe("Spawn-Gang Commander", () => {
  it("makes three Spawn as it's cast, and pings for {1}{C} and an Eldrazi", () => {
    const { game } = table();
    const commander = toHand(game, "Spawn-Gang Commander");
    spawn(game, "Mountain");
    spawn(game, "Mountain");
    spawn(game, "Wastes");
    spawn(game, "Wastes");
    spawn(game, "Wastes");
    cast(game, commander);
    expect(tokensNamed(game, "Eldrazi Spawn Token")).toBe(3);
    expect(game.characteristics(commander).colors.size).toBe(0);
    spawn(game, "Wastes");
    spawn(game, "Wastes");
    const bears = spawn(game, "Grizzly Bears");
    const spawnToken = named(game, "Eldrazi Spawn Token")[0];
    // A non-Eldrazi can't pay it.
    expect(
      game.canDispatch({
        type: "activate-ability",
        player: A,
        source: commander,
        abilityIndex: 0,
        targets: [ref(B)],
        sacrifice: bears,
      }),
    ).not.toBeNull();
    game.dispatch({
      type: "activate-ability",
      player: A,
      source: commander,
      abilityIndex: 0,
      targets: [ref(B)],
      sacrifice: spawnToken,
    });
    settle(game);
    expect(life(game, B)).toBe(18);
    expect(tokensNamed(game, "Eldrazi Spawn Token")).toBe(2);
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Phlage, Titan of Fire's Fury", () => {
  it("cast from hand, it burns and gains life, then is sacrificed", () => {
    const { game, a } = table();
    const phlage = toHand(game, "Phlage, Titan of Fire's Fury");
    spawn(game, "Mountain");
    spawn(game, "Plains");
    spawn(game, "Wastes");
    pickTargets(a, B);
    cast(game, phlage);
    expect(life(game, B)).toBe(17);
    expect(life(game, A)).toBe(23);
    expect(zone(game, phlage)).toBe("graveyard");
  });

  it("escaped, it stays, and burns again when it attacks", () => {
    const { game, a } = table();
    const phlage = toGraveyard(game, "Phlage, Titan of Fire's Fury");
    const others = Array.from({ length: 5 }, () => toGraveyard(game, "Wastes"));
    spawn(game, "Mountain");
    spawn(game, "Mountain");
    spawn(game, "Plains");
    spawn(game, "Plains");
    pickTargets(a, B);
    cast(game, phlage, { via: "escape" });
    expect(zone(game, phlage)).toBe("battlefield");
    expect(others.every((id) => zone(game, id) === "exile")).toBe(true);
    expect(life(game, B)).toBe(17);
    expect(life(game, A)).toBe(23);
    game.state.objects[phlage].summoningSick = false;
    attack(game, a, [phlage]);
    // 3 from the attack trigger, 6 in combat.
    expect(life(game, B)).toBe(8);
    expect(life(game, A)).toBe(26);
  });

  it("isn't offered escape with fewer than five other cards in your graveyard", () => {
    const { game } = table();
    const phlage = toGraveyard(game, "Phlage, Titan of Fire's Fury");
    for (let i = 0; i < 4; i += 1) toGraveyard(game, "Wastes");
    spawn(game, "Mountain");
    spawn(game, "Mountain");
    spawn(game, "Plains");
    spawn(game, "Plains");
    expect(castOffers(game, phlage)).toEqual([]);
  });
});

describe("Frogmyr Enforcer", () => {
  it("prototyped, it's a red 2/2 whose cost affinity reduces", () => {
    const { game } = table();
    const frog = toHand(game, "Frogmyr Enforcer");
    spawn(game, "Memnite");
    spawn(game, "Ornithopter");
    spawn(game, "Mountain");
    spawn(game, "Wastes");
    // {3}{R} less two is {1}{R}; {7} less two isn't affordable.
    expect(castOffers(game, frog).map((o) => o.prototype ?? false)).toEqual([true]);
    cast(game, frog, { prototype: true });
    expect(zone(game, frog)).toBe("battlefield");
    expect(pt(game, frog)).toEqual({ power: 2, toughness: 2 });
    expect([...game.characteristics(frog).colors]).toEqual(["R"]);
  });

  it("cast normally, it's a colorless 4/4", () => {
    const { game } = table();
    const frog = toHand(game, "Frogmyr Enforcer");
    spawn(game, "Memnite");
    spawn(game, "Memnite");
    spawn(game, "Ornithopter");
    for (let i = 0; i < 4; i += 1) spawn(game, "Wastes");
    cast(game, frog, { prototype: false });
    expect(pt(game, frog)).toEqual({ power: 4, toughness: 4 });
    expect(game.characteristics(frog).colors.size).toBe(0);
  });
});

describe("Titans' Vanguard", () => {
  it("puts a counter on each colorless creature you control as it's cast and as it attacks", () => {
    const { game, a } = table();
    const vanguard = toHand(game, "Titans' Vanguard");
    const memnite = spawn(game, "Memnite");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Memnite", B);
    spawn(game, "Mountain");
    spawn(game, "Forest");
    for (let i = 0; i < 3; i += 1) spawn(game, "Wastes");
    cast(game, vanguard);
    expect(counters(game, memnite)).toBe(1);
    expect(counters(game, bears)).toBe(0);
    expect(counters(game, theirs)).toBe(0);
    // Still on the stack as its cast trigger resolved.
    expect(counters(game, vanguard)).toBe(0);
    game.state.objects[vanguard].summoningSick = false;
    attack(game, a, [vanguard]);
    expect(counters(game, memnite)).toBe(2);
    expect(counters(game, vanguard)).toBe(1);
    expect(counters(game, bears)).toBe(0);
  });
});

describe("Faithful Watchdog", () => {
  it("enters with three +1/+1 counters and has vigilance", () => {
    const { game } = table();
    const dog = enter(game, "Faithful Watchdog");
    expect(counters(game, dog)).toBe(3);
    expect(pt(game, dog)).toEqual({ power: 3, toughness: 3 });
    expect(game.characteristics(dog).keywords.has("vigilance")).toBe(true);
  });
});

describe("Argent Dais", () => {
  it("enters with two oil counters, and exiles another nonland permanent whose controller draws two", () => {
    const { game } = table();
    const dais = enter(game, "Argent Dais");
    expect(counters(game, dais, "oil")).toBe(2);
    const bears = spawn(game, "Grizzly Bears", B);
    spawn(game, "Wastes");
    spawn(game, "Wastes");
    // "Another": not itself.
    expect(() => activate(game, dais, 0, { targets: [ref(dais)] })).toThrow();
    const bobHand = hand(game, B).length;
    const mine = hand(game, A).length;
    activate(game, dais, 0, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("exile");
    expect(hand(game, B).length).toBe(bobHand + 2);
    expect(hand(game, A).length).toBe(mine);
    expect(counters(game, dais, "oil")).toBe(0);
  });

  it("gets an oil counter whenever two or more creatures attack, whoever attacks", () => {
    const { game, a, b } = table();
    const dais = enter(game, "Argent Dais");
    const x = spawn(game, "Grizzly Bears");
    const y = spawn(game, "Grizzly Bears");
    attack(game, a, [x]);
    expect(counters(game, dais, "oil")).toBe(2);
    const p = spawn(game, "Grizzly Bears", B);
    const q = spawn(game, "Grizzly Bears", B);
    attack(game, b, [p, q], A);
    expect(counters(game, dais, "oil")).toBe(3);
    attack(game, a, [x, y]);
    expect(counters(game, dais, "oil")).toBe(4);
  });
});
