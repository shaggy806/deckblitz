/**
 * Mirrodin's rest and Legions, group D (batch 219).
 */
import { describe, expect, it } from "vitest";

import type { Action } from "../actions.js";
import {
  A,
  B,
  activate,
  attack,
  cast,
  hand,
  keywords,
  lands,
  life,
  nextTurn,
  pickTargets,
  pt,
  quiet,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  zone,
} from "./harness.js";

describe("Stoic Champion", () => {
  it("gets +2/+2 until end of turn whenever a player cycles a card", () => {
    const { game } = table();
    const champion = spawn(game, "Stoic Champion");
    lands(game, "Wastes", 3);
    const scion = toHand(game, "Scion of Darkness");
    game.dispatch({ type: "cycle", player: A, card: scion });
    settle(game);
    expect(zone(game, scion)).toBe("graveyard");
    expect(pt(game, champion)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Riptide Director", () => {
  it("draws a card for each Wizard you control, itself included", () => {
    const { game } = table();
    const director = spawn(game, "Riptide Director");
    spawn(game, "Aphetto Exterminator");
    spawn(game, "Riptide Director", B);
    lands(game, "Island", 4);
    const before = hand(game).length;
    activate(game, director);
    expect(hand(game).length).toBe(before + 2);
  });
});

describe("Vexing Beetle", () => {
  it("is 6/6 only while no opponent controls a creature", () => {
    const { game } = table();
    const beetle = spawn(game, "Vexing Beetle");
    expect(pt(game, beetle)).toEqual({ power: 6, toughness: 6 });
    spawn(game, "Grizzly Bears", B);
    expect(pt(game, beetle)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Akroma's Devoted", () => {
  it("gives every Cleric creature vigilance, an opponent's too", () => {
    const { game } = table();
    spawn(game, "Akroma's Devoted");
    const theirs = spawn(game, "Akroma's Devoted", B);
    const bears = spawn(game, "Grizzly Bears");
    expect(keywords(game, theirs).has("vigilance")).toBe(true);
    expect(keywords(game, bears).has("vigilance")).toBe(false);
  });
});

describe("Aphetto Exterminator", () => {
  it("gives target creature -3/-3 when turned face up", () => {
    const { game, a } = table();
    lands(game, "Swamp", 7);
    const ex = toHand(game, "Aphetto Exterminator");
    cast(game, ex, { via: "face-down" });
    expect(game.state.objects[ex].faceDown).toBeDefined();
    const ogre = spawn(game, "Gray Ogre", B);
    pickTargets(a, ogre);
    game.dispatch({ type: "turn-face-up", player: A, permanent: ex, morph: true } as Action);
    settle(game);
    expect(pt(game, ex)).toEqual({ power: 3, toughness: 1 });
    expect(zone(game, ogre)).toBe("graveyard");
  });
});

describe("Liege of the Axe", () => {
  it("untaps as it is turned face up", () => {
    const { game } = table();
    lands(game, "Plains", 5);
    const liege = toHand(game, "Liege of the Axe");
    cast(game, liege, { via: "face-down" });
    game.state.objects[liege].tapped = true;
    game.dispatch({ type: "turn-face-up", player: A, permanent: liege, morph: true } as Action);
    settle(game);
    expect(game.state.objects[liege].tapped).toBe(false);
  });
});

describe("Scion of Darkness", () => {
  it("may put a creature card from the damaged player's graveyard onto the battlefield under your control", () => {
    const { game, a } = table();
    const scion = spawn(game, "Scion of Darkness");
    const bears = toGraveyard(game, "Grizzly Bears", B);
    toGraveyard(game, "Grizzly Bears", A);
    pickTargets(a, bears);
    a.chooseModesFn = (_v, _min, max) => (max >= 1 ? [0] : []);
    attack(game, a, [scion]);
    expect(life(game, B)).toBe(14);
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[bears].controller).toBe(A);
  });
});

describe("Goblin War Wagon", () => {
  it("doesn't untap in the untap step, but untaps in upkeep for {2}", () => {
    const { game, a } = table();
    const wagon = spawn(game, "Goblin War Wagon", A, { tapped: true });
    lands(game, "Wastes", 2);
    a.chooseModesFn = () => [];
    game.advanceUntil((s) => s.turn.number === 3 && s.turn.step === "precombat-main" && quiet(s));
    expect(game.state.objects[wagon].tapped).toBe(true);
    a.chooseModesFn = (_v, _min, max) => (max >= 1 ? [0] : []);
    nextTurn(game);
    nextTurn(game);
    expect(game.state.objects[wagon].tapped).toBe(false);
  });
});

describe("Goblin Dynamo", () => {
  it("sacrifices itself to deal X damage to any target", () => {
    const { game } = table();
    const dynamo = spawn(game, "Goblin Dynamo");
    lands(game, "Mountain", 5);
    activate(game, dynamo, 1, { targets: [ref(B)], x: 4 });
    expect(life(game, B)).toBe(16);
    expect(zone(game, dynamo)).toBe("graveyard");
  });
});
