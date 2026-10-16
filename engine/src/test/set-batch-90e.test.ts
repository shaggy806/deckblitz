/**
 * Set walk batch 90, part e (2026-10-16): the rad counter and squad cards of Fallout (PIP), and older cards that waited on them.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { PlayerId } from "../primitives.js";

import {
  A,
  B,
  attack,
  cast,
  counters,
  destroy,
  hand,
  lands,
  named,
  pickTargets,
  pt,
  ref,
  spawn,
  table,
  toHand,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

const rad = (game: Game, player: PlayerId = A): number => game.state.players[player].counters.rad ?? 0;

describe("Contaminated Drink", () => {
  it("draws X, then gets half X rad counters, rounded up", () => {
    const { game } = table();
    lands(game, "Island", 1);
    lands(game, "Swamp", 1);
    lands(game, "Wastes", 3);
    const drink = toHand(game, "Contaminated Drink");
    const before = hand(game).length;
    cast(game, drink, { x: 3 });
    // The Drink left the hand, three cards came in.
    expect(hand(game).length).toBe(before - 1 + 3);
    expect(rad(game)).toBe(2);
    expect(rad(game, B)).toBe(0);
  });
});

describe("Megaton's Fate", () => {
  it("Disarm destroys the artifact and makes four Treasures", () => {
    const { game } = table();
    lands(game, "Mountain", 6);
    const stone = spawn(game, "Mind Stone", B);
    cast(game, toHand(game, "Megaton's Fate"), { modes: [0], targets: [ref(stone)] });
    expect(zone(game, stone)).toBe("graveyard");
    expect(tokensNamed(game, "Treasure Token", A)).toBe(4);
    expect(rad(game)).toBe(0);
  });

  it("Detonate deals 8 to each creature and gives each player four rad counters", () => {
    const { game } = table();
    lands(game, "Mountain", 6);
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Megaton's Fate"), { modes: [1] });
    expect(zone(game, mine)).toBe("graveyard");
    expect(zone(game, theirs)).toBe("graveyard");
    expect(rad(game, A)).toBe(4);
    expect(rad(game, B)).toBe(4);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(0);
  });
});

describe("Acquired Mutation", () => {
  it("+2/+2, and the defending player gets two rad counters when it attacks", () => {
    const { game, a } = table();
    lands(game, "Mountain", 3);
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    cast(game, toHand(game, "Acquired Mutation"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    attack(game, a, [bears]);
    expect(rad(game, B)).toBe(2);
    expect(rad(game, A)).toBe(0);
  });
});

describe("Gary Clone", () => {
  it("squad makes copies named Gary Clone; each attacking Gary pumps every Gary you control", () => {
    const { game, a } = table();
    lands(game, "Plains", 6);
    const other = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Gary Clone"), { kicked: true, kickCount: 2 });
    const garys = named(game, "Gary Clone", A);
    expect(garys).toHaveLength(3);
    expect(garys.filter((id) => game.state.objects[id].isToken === true)).toHaveLength(2);
    toStep(game, "precombat-main");
    // Two attack; the third stays home and is pumped by both.
    attack(game, a, [garys[0], garys[1]]);
    for (const id of named(game, "Gary Clone", A)) expect(pt(game, id)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, other)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Nuclear Fallout", () => {
  it("each creature gets -2X/-2X and each player gets X rad counters", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const bears = spawn(game, "Grizzly Bears", B);
    const big = spawn(game, "Hill Giant");
    cast(game, toHand(game, "Nuclear Fallout"), { x: 1 });
    expect(zone(game, bears)).toBe("graveyard");
    expect(pt(game, big)).toEqual({ power: 1, toughness: 1 });
    expect(rad(game, A)).toBe(1);
    expect(rad(game, B)).toBe(1);
  });
});

describe("Feral Ghoul", () => {
  it("grows when another creature you control dies, and dying gives each opponent its last power in rad", () => {
    const { game } = table();
    const ghoul = spawn(game, "Feral Ghoul");
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears", B);
    destroy(game, bears);
    expect(counters(game, ghoul)).toBe(1);
    destroy(game, ghoul);
    expect(zone(game, ghoul)).toBe("graveyard");
    expect(rad(game, B)).toBe(3);
    expect(rad(game, A)).toBe(0);
  });
});
