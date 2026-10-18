/**
 * Phyrexia: All Will Be One (ONE/ONC), batch 1, part d (2026-10-17).
 * Written on the shared table in `harness.ts`, each test from the Oracle text.
 */
import { describe, expect, it } from "vitest";

import type { Action } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
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
  named,
  nextTurn,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  subtypes,
  table,
  toHand,
  toLibrary,
  toStep,
  types,
  zone,
} from "./harness.js";

/** `player` gets `n` poison counters. */
function poison(game: Game, player: PlayerId, n: number): void {
  game.debugApplyEffect(player, { kind: "add-player-counters", counter: "poison", amount: n });
  settle(game);
}

describe("Hexgold Halberd", () => {
  it("makes a Rebel wearing it, which has first strike and trample only during your turn", () => {
    const { game } = table();
    const halberd = enter(game, "Hexgold Halberd");
    const [rebel] = named(game, "Rebel Token", A);
    expect(rebel).toBeDefined();
    expect(game.state.objects[halberd].attachedTo).toBe(rebel);
    expect(keywords(game, rebel).has("first-strike")).toBe(true);
    expect(keywords(game, rebel).has("trample")).toBe(true);
    nextTurn(game);
    expect(keywords(game, rebel).has("first-strike")).toBe(false);
    expect(keywords(game, rebel).has("trample")).toBe(false);
  });
});

describe("Zealot's Conviction", () => {
  it("gives +1/+1, and +2/+1 with first strike once an opponent has three poison counters", () => {
    const { game } = table();
    const bear = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 1);
    cast(game, toHand(game, "Zealot's Conviction"), { targets: [ref(bear)] });
    expect(pt(game, bear)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, bear).has("first-strike")).toBe(false);
    // Its controller's own poison counters don't count.
    poison(game, A, 3);
    expect(pt(game, bear)).toEqual({ power: 3, toughness: 3 });
    poison(game, B, 3);
    expect(pt(game, bear)).toEqual({ power: 4, toughness: 3 });
    expect(keywords(game, bear).has("first-strike")).toBe(true);
  });
});

describe("Chittering Skitterling", () => {
  it("can't be activated until an opponent has three poison counters, then only once each turn", () => {
    const { game } = table();
    const rat = spawn(game, "Chittering Skitterling");
    const first = spawn(game, "Grizzly Bears");
    const second = spawn(game, "Sol Ring");
    toLibrary(game, "Island");
    const sacrificing = (sacrifice: ObjectId): Action => ({
      type: "activate-ability",
      player: A,
      source: rat,
      abilityIndex: 0,
      targets: [],
      sacrifice,
    });
    expect(game.canDispatch(sacrificing(first))).not.toBeNull();
    poison(game, B, 3);
    const before = hand(game).length;
    expect(game.canDispatch(sacrificing(first))).toBeNull();
    game.dispatch(sacrificing(first));
    settle(game);
    expect(zone(game, first)).toBe("graveyard");
    expect(hand(game).length).toBe(before + 1);
    // An artifact pays too — but not a second time this turn.
    expect(game.canDispatch(sacrificing(second))).not.toBeNull();
    nextTurn(game);
    nextTurn(game);
    expect(game.canDispatch(sacrificing(second))).toBeNull();
  });
});

describe("Migloz, Maze Crusher", () => {
  it("enters with five oil counters and spends them on its abilities", () => {
    const { game } = table();
    const migloz = enter(game, "Migloz, Maze Crusher");
    expect(counters(game, migloz, "oil")).toBe(5);
    lands(game, "Mountain", 6);
    const relic = spawn(game, "Sol Ring", B);
    activate(game, migloz, 2, { targets: [{ kind: "object", object: relic }] });
    expect(zone(game, relic)).toBe("graveyard");
    expect(counters(game, migloz, "oil")).toBe(2);
    activate(game, migloz, 0);
    expect(keywords(game, migloz).has("vigilance")).toBe(true);
    expect(keywords(game, migloz).has("menace")).toBe(true);
    expect(counters(game, migloz, "oil")).toBe(1);
    // One oil counter left: the +2/+2 needs two.
    expect(() => activate(game, migloz, 1)).toThrow();
  });
});

describe("Incisor Glider", () => {
  it("pumps your creatures when it attacks only if an opponent has three poison counters", () => {
    const { game, a } = table();
    const glider = spawn(game, "Incisor Glider");
    const bear = spawn(game, "Grizzly Bears");
    attack(game, a, [glider]);
    expect(pt(game, bear)).toEqual({ power: 2, toughness: 2 });

    const second = table();
    const glider2 = spawn(second.game, "Incisor Glider");
    const bear2 = spawn(second.game, "Grizzly Bears");
    poison(second.game, B, 3);
    attack(second.game, second.a, [glider2]);
    expect(pt(second.game, bear2)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Unctus's Retrofitter", () => {
  it("makes an artifact a 4/4 artifact creature for as long as the Retrofitter remains", () => {
    const { game, a } = table();
    const relic = spawn(game, "Sol Ring");
    pickTargets(a, relic);
    const fitter = enter(game, "Unctus's Retrofitter");
    expect(types(game, relic)).toEqual(expect.arrayContaining(["artifact", "creature"]));
    expect(pt(game, relic)).toEqual({ power: 4, toughness: 4 });
    destroy(game, fitter);
    expect(types(game, relic)).not.toContain("creature");
  });
});

describe("Evolved Spinoderm", () => {
  it("has hexproof with three or more oil counters, trample with two or fewer, and is sacrificed at none", () => {
    const { game } = table();
    const spinoderm = enter(game, "Evolved Spinoderm");
    expect(counters(game, spinoderm, "oil")).toBe(4);
    expect(keywords(game, spinoderm).has("hexproof")).toBe(true);
    expect(keywords(game, spinoderm).has("trample")).toBe(false);
    toStep(game, "upkeep");
    settle(game);
    expect(counters(game, spinoderm, "oil")).toBe(3);
    expect(keywords(game, spinoderm).has("hexproof")).toBe(true);
    toStep(game, "upkeep");
    settle(game);
    expect(counters(game, spinoderm, "oil")).toBe(2);
    expect(keywords(game, spinoderm).has("hexproof")).toBe(false);
    expect(keywords(game, spinoderm).has("trample")).toBe(true);
    toStep(game, "upkeep");
    settle(game);
    expect(zone(game, spinoderm)).toBe("battlefield");
    toStep(game, "upkeep");
    settle(game);
    expect(zone(game, spinoderm)).toBe("graveyard");
  });
});

describe("Ichor Synthesizer", () => {
  it("gets an oil counter per noncreature spell, and +2/+0 and can't be blocked at four", () => {
    const { game } = table();
    const synth = spawn(game, "Ichor Synthesizer");
    lands(game, "Island", 1);
    cast(game, toHand(game, "Opt"));
    expect(counters(game, synth, "oil")).toBe(1);
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Grizzly Bears"));
    expect(counters(game, synth, "oil")).toBe(1);
    const addOil = (n: number): void => {
      game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "oil", amount: n }, [ref(synth)]);
      settle(game);
    };
    addOil(2);
    expect(pt(game, synth)).toEqual({ power: 1, toughness: 3 });
    expect(keywords(game, synth).has("unblockable")).toBe(false);
    addOil(1);
    expect(pt(game, synth)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, synth).has("unblockable")).toBe(true);
  });
});

describe("Kuldotha Cackler", () => {
  it("gets +X/+0 when it attacks, X the permanents you control with oil counters", () => {
    const { game, a } = table();
    const cackler = spawn(game, "Kuldotha Cackler");
    enter(game, "Gitaxian Raptor");
    enter(game, "Migloz, Maze Crusher");
    enter(game, "Gitaxian Raptor", B);
    attack(game, a, [cackler]);
    expect(pt(game, cackler)).toEqual({ power: 4, toughness: 3 });
  });
});

describe("Eye of Malcator", () => {
  it("becomes a 4/4 Phyrexian Eye artifact creature until end of turn when another artifact you control enters", () => {
    const { game } = table();
    const eye = enter(game, "Eye of Malcator");
    expect(types(game, eye)).not.toContain("creature");
    enter(game, "Sol Ring", B);
    expect(types(game, eye)).not.toContain("creature");
    enter(game, "Sol Ring");
    expect(types(game, eye)).toEqual(expect.arrayContaining(["artifact", "creature"]));
    expect(subtypes(game, eye)).toEqual(expect.arrayContaining(["Phyrexian", "Eye"]));
    expect(pt(game, eye)).toEqual({ power: 4, toughness: 4 });
    nextTurn(game);
    expect(types(game, eye)).not.toContain("creature");
  });
});

describe("Gitaxian Raptor", () => {
  it("enters with three oil counters, each removable for +1/-1 until end of turn", () => {
    const { game } = table();
    const raptor = enter(game, "Gitaxian Raptor");
    expect(counters(game, raptor, "oil")).toBe(3);
    activate(game, raptor);
    activate(game, raptor);
    expect(pt(game, raptor)).toEqual({ power: 3, toughness: 2 });
    expect(counters(game, raptor, "oil")).toBe(1);
  });
});
