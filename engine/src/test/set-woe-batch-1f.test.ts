/**
 * The set walk, Wilds of Eldraine batch 1, part f (2026-10-17): the
 * celebration cards — "if / as long as two or more nonland permanents
 * entered the battlefield under your control this turn" (`CELEBRATION_CONDITION`;
 * the condition's own rules are in `celebration.test.ts`). Written on the
 * shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

import {
  A,
  attack,
  cast,
  counters,
  destroy,
  enter,
  hand,
  keywords,
  lands,
  nextTurn,
  pickTargets,
  pt,
  settle,
  spawn,
  table,
  toHand,
  toStep,
} from "./harness.js";

const canCast = (game: Game, card: ObjectId, player: PlayerId = A): boolean =>
  game.legalActions(player).some((x) => x.kind === "cast-spell" && x.card === card);

/** Two nonland permanents enter under alice's control. */
const celebrate = (game: Game): void => {
  enter(game, "Sol Ring");
  enter(game, "Ornithopter");
};

describe("Raging Battle Mouse", () => {
  it("takes {1} off the second spell, and pumps a creature at combat only on a celebrating turn", () => {
    const { game, a } = table();
    const mouse = spawn(game, "Raging Battle Mouse");
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Grizzly Bears"));
    const second = toHand(game, "Grizzly Bears");
    lands(game, "Forest", 1);
    expect(canCast(game, second)).toBe(true);
    // Two Bears cast (and entered): celebrating.
    cast(game, second);
    pickTargets(a, mouse);
    toStep(game, "begin-combat");
    settle(game);
    expect(pt(game, mouse)).toEqual({ power: 3, toughness: 2 });

    nextTurn(game);
    nextTurn(game);
    enter(game, "Sol Ring");
    toStep(game, "begin-combat");
    settle(game);
    expect(pt(game, mouse)).toEqual({ power: 2, toughness: 1 });
  });
});

describe("Ash, Party Crasher", () => {
  it("gets a counter as it attacks on a celebrating turn — Ash's own entry counting — and not otherwise", () => {
    const { game, a } = table();
    const ash = enter(game, "Ash, Party Crasher");
    enter(game, "Sol Ring");
    attack(game, a, [ash]);
    expect(counters(game, ash)).toBe(1);

    nextTurn(game);
    nextTurn(game);
    enter(game, "Sol Ring");
    attack(game, a, [ash]);
    expect(counters(game, ash)).toBe(1);
  });
});

describe("Pests of Honor", () => {
  it("counts permanents that entered and have left since", () => {
    const { game } = table();
    const pests = spawn(game, "Pests of Honor");
    const bears = enter(game, "Grizzly Bears");
    destroy(game, bears);
    destroy(game, enter(game, "Hill Giant"));
    toStep(game, "begin-combat");
    settle(game);
    expect(counters(game, pests)).toBe(1);
  });
});

describe("Armory Mice", () => {
  it("is 3/3 only while celebrating", () => {
    const { game } = table();
    const mice = spawn(game, "Armory Mice");
    expect(pt(game, mice)).toEqual({ power: 3, toughness: 1 });
    celebrate(game);
    expect(pt(game, mice)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Lady of Laughter", () => {
  it("draws at your end step only on a celebrating turn", () => {
    const { game } = table();
    spawn(game, "Lady of Laughter");
    const before = hand(game).length;
    toStep(game, "end");
    settle(game);
    expect(hand(game).length).toBe(before);
    nextTurn(game);
    nextTurn(game);
    celebrate(game);
    const now = hand(game).length;
    toStep(game, "end");
    settle(game);
    expect(hand(game).length).toBe(now + 1);
  });
});

describe("Bespoke Battlegarb", () => {
  it("attaches itself to up to one creature you control at combat on a celebrating turn", () => {
    const { game, a } = table();
    const garb = spawn(game, "Bespoke Battlegarb");
    const bears = spawn(game, "Grizzly Bears");
    // Not celebrating: no trigger, still unattached.
    toStep(game, "begin-combat");
    settle(game);
    expect(game.state.objects[garb].attachedTo).toBeNull();

    nextTurn(game);
    nextTurn(game);
    celebrate(game);
    pickTargets(a, bears);
    toStep(game, "begin-combat");
    settle(game);
    expect(game.state.objects[garb].attachedTo).toBe(bears);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 2 });
  });
});

describe("Gallant Pie-Wielder", () => {
  it("has double strike while celebrating, first strike always", () => {
    const { game } = table();
    const dwarf = spawn(game, "Gallant Pie-Wielder");
    expect(keywords(game, dwarf).has("first-strike")).toBe(true);
    expect(keywords(game, dwarf).has("double-strike")).toBe(false);
    celebrate(game);
    expect(keywords(game, dwarf).has("double-strike")).toBe(true);
  });
});

describe("Belligerent of the Ball", () => {
  it("gives a creature you control +1/+0 and menace at combat on a celebrating turn", () => {
    const { game, a } = table();
    spawn(game, "Belligerent of the Ball");
    const bears = spawn(game, "Grizzly Bears");
    celebrate(game);
    pickTargets(a, bears);
    toStep(game, "begin-combat");
    settle(game);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 2 });
    expect(keywords(game, bears).has("menace")).toBe(true);
  });
});

describe("Grand Ball Guest", () => {
  it("is a 3/3 trampler only while celebrating", () => {
    const { game } = table();
    const guest = spawn(game, "Grand Ball Guest");
    expect(keywords(game, guest).has("trample")).toBe(false);
    celebrate(game);
    expect(pt(game, guest)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, guest).has("trample")).toBe(true);
  });
});

describe("Tuinvale Guide", () => {
  it("gets +1/+0 and lifelink only while celebrating", () => {
    const { game } = table();
    const guide = spawn(game, "Tuinvale Guide");
    expect(pt(game, guide)).toEqual({ power: 2, toughness: 3 });
    celebrate(game);
    expect(pt(game, guide)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, guide).has("lifelink")).toBe(true);
    expect(keywords(game, guide).has("flying")).toBe(true);
  });
});
