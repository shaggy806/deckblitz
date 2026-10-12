/**
 * The set walk, batch 62, part d (2026-10-12): Teenage Mutant Ninja Turtles.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  attack,
  cast,
  counters,
  destroy,
  enter,
  grant,
  hand,
  keywords,
  lands,
  life,
  named,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

const canCast = (game: Game, card: ObjectId): boolean =>
  game.legalActions(A).some((x) => x.kind === "cast-spell" && x.card === card);

describe("Savanti Romero, Time's Exile", () => {
  it("adds a +1/+1 counter at your beginning of combat, then draws and loses life for every counter on it", () => {
    const { game } = table();
    const savanti = spawn(game, "Savanti Romero, Time's Exile");
    // A counter of another kind counts too (the ruling).
    game.state.objects[savanti].counters.oil = 1;
    const before = hand(game).length;
    toStep(game, "begin-combat");
    settle(game);
    expect(counters(game, savanti)).toBe(1);
    expect(hand(game).length).toBe(before + 2);
    expect(life(game)).toBe(18);
  });
});

describe("Saved by the Shell", () => {
  it("costs {1} less with a Turtle, and the creature gets a counter, trample, hexproof and indestructible", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    const bears = spawn(game, "Grizzly Bears");
    const shell = toHand(game, "Saved by the Shell");
    expect(canCast(game, shell)).toBe(false);
    spawn(game, "Aegis Turtle");
    expect(canCast(game, shell)).toBe(true);
    cast(game, shell, { targets: [ref(bears)] });
    expect(counters(game, bears)).toBe(1);
    const kw = keywords(game, bears);
    expect(["trample", "hexproof", "indestructible"].every((k) => kw.has(k))).toBe(true);
  });
});

describe("Splinter, Radical Rat", () => {
  it("makes a Ninja creature's triggered ability trigger twice, but not a non-Ninja's or an opponent's Ninja's", () => {
    const { game } = table();
    spawn(game, "Splinter, Radical Rat");
    enter(game, "Mechanized Ninja Cavalry");
    expect(tokensNamed(game, "Robot Token (Big Mother Mouser)", A)).toBe(2);
    enter(game, "Captain of the Watch");
    expect(tokensNamed(game, "Soldier Token", A)).toBe(3);
    enter(game, "Mechanized Ninja Cavalry", B);
    expect(tokensNamed(game, "Robot Token (Big Mother Mouser)", B)).toBe(1);
  });

  it("{1}{U}: target Ninja can't be blocked this turn", () => {
    const { game } = table();
    const splinter = spawn(game, "Splinter, Radical Rat");
    lands(game, "Island", 2);
    const ninja = spawn(game, "Mechanized Ninja Cavalry");
    game.dispatch({ type: "activate-ability", player: A, source: splinter, abilityIndex: 0, targets: [ref(ninja)] });
    settle(game);
    expect(keywords(game, ninja).has("unblockable")).toBe(true);
  });
});

describe("Tainted Treats", () => {
  it("makes a Food for a mana value 4 or less, none for more, and one even if the target survives", () => {
    const { game } = table();
    lands(game, "Bayou", 9);
    cast(game, toHand(game, "Tainted Treats"), { targets: [ref(spawn(game, "Hill Giant", B))] });
    expect(tokensNamed(game, "Food Token", A)).toBe(1);
    cast(game, toHand(game, "Tainted Treats"), { targets: [ref(spawn(game, "Craw Wurm", B))] });
    expect(tokensNamed(game, "Food Token", A)).toBe(1);
    const bears = spawn(game, "Grizzly Bears", B);
    grant(game, bears, "indestructible");
    cast(game, toHand(game, "Tainted Treats"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("battlefield");
    expect(tokensNamed(game, "Food Token", A)).toBe(2);
  });
});

describe("Shredder's Revenge", () => {
  it("the second mode: the target player draws two and loses 2 life", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const before = hand(game, B).length;
    cast(game, toHand(game, "Shredder's Revenge"), { modes: [1], targets: [ref(B)] });
    expect(hand(game, B).length).toBe(before + 2);
    expect(life(game, B)).toBe(18);
    expect(life(game, A)).toBe(20);
  });
});

describe("Pain 101", () => {
  it("gives deathtouch and a return-tapped-when-it-dies ability until end of turn", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Pain 101"), { targets: [ref(bears)] });
    expect(keywords(game, bears).has("deathtouch")).toBe(true);
    destroy(game, bears);
    const [back] = named(game, "Grizzly Bears", A);
    expect(back).toBeDefined();
    expect(game.state.objects[back].tapped).toBe(true);
  });
});

describe("Triceraton Commander", () => {
  it("makes X Dinosaur Soldiers for {X}{X}", () => {
    const { game } = table();
    lands(game, "Plains", 6);
    cast(game, toHand(game, "Triceraton Commander"), { x: 2 });
    expect(tokensNamed(game, "Dinosaur Soldier Token", A)).toBe(2);
  });

  it("attacking, pumps and gives flying to your other Dinosaurs only", () => {
    const g = table();
    const { game } = g;
    const commander = spawn(game, "Triceraton Commander");
    const dino = spawn(game, "Dinosaur Soldier Token");
    const theirs = spawn(game, "Dinosaur Soldier Token", B);
    const bears = spawn(game, "Grizzly Bears");
    attack(game, g.a, [commander]);
    expect(pt(game, dino)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, dino).has("flying")).toBe(true);
    expect(pt(game, commander)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
    expect(keywords(game, theirs).has("flying")).toBe(false);
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });
});
