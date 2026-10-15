/**
 * "Whenever you scry (or surveil)" — the `scries` trigger — and "if you've
 * scried or surveilled this turn" — the `scried-or-surveilled` turn stat.
 * A scry or surveil of one or more happens even into an empty library (rules
 * 701.22d, 701.25d); one of 0 doesn't (701.22b, 701.25c).
 */

import { describe, expect, it } from "vitest";

import { whyCannotAttack } from "../combat/eligibility.js";
import type { Game } from "../game.js";
import type { PlayerId } from "../primitives.js";
import {
  A,
  B,
  activate,
  counters,
  enter,
  hand,
  lands,
  nextTurn,
  pickModes,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

const scry = (game: Game, amount: number, player: PlayerId = A): void => {
  game.debugApplyEffect(player, { kind: "scry", amount }, []);
  settle(game);
};
const surveil = (game: Game, amount: number, player: PlayerId = A): void => {
  game.debugApplyEffect(player, { kind: "surveil", amount }, []);
  settle(game);
};

describe("the scries trigger", () => {
  it("Denzilore Fatehold: a counter on each creature you control for a scry, and for a surveil", () => {
    const { game } = table();
    spawn(game, "Denzilore Fatehold");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    scry(game, 1);
    expect(counters(game, bears)).toBe(1);
    surveil(game, 2);
    expect(counters(game, bears)).toBe(2);
    expect(counters(game, theirs)).toBe(0);
  });

  it("doesn't see an opponent's scry, nor a scry 0", () => {
    const { game } = table();
    spawn(game, "Denzilore Fatehold");
    const bears = spawn(game, "Grizzly Bears");
    scry(game, 1, B);
    scry(game, 0);
    expect(counters(game, bears)).toBe(0);
  });

  it("a scry into an empty library still triggers (rule 701.22d)", () => {
    const { game } = table();
    spawn(game, "Denzilore Fatehold");
    const bears = spawn(game, "Grizzly Bears");
    game.state.zones.perPlayer[A].library.length = 0;
    scry(game, 2);
    expect(counters(game, bears)).toBe(1);
  });

  it("Saheeli, Consul of Oversight: one Thopter a turn however often you scry", () => {
    const { game } = table();
    spawn(game, "Saheeli, Consul of Oversight");
    scry(game, 1);
    surveil(game, 1);
    expect(tokensNamed(game, "Thopter Token", A)).toBe(1);
  });

  it("Proft, Consulting Detective: pay {2} for a counter and a card", () => {
    const { game, a } = table();
    const proft = spawn(game, "Proft, Consulting Detective");
    lands(game, "Wastes", 2);
    pickModes(a, 0);
    const before = hand(game).length;
    scry(game, 1);
    expect(counters(game, proft)).toBe(1);
    expect(hand(game).length).toBe(before + 1);
  });

  it("Diviner of Victory gets +1/+1 until end of turn", () => {
    const { game } = table();
    const diviner = spawn(game, "Diviner of Victory");
    const base = pt(game, diviner);
    surveil(game, 1);
    expect(pt(game, diviner)).toEqual({ power: base.power + 1, toughness: base.toughness + 1 });
  });
});

describe("if you've scried or surveilled this turn", () => {
  it("Surveillance Phantasm can attack only once you have, this turn", () => {
    const { game } = table();
    const phantasm = spawn(game, "Surveillance Phantasm");
    expect(whyCannotAttack(game.state, game.registry, A, phantasm, B)).toMatch(/defender/);
    surveil(game, 1);
    expect(whyCannotAttack(game.state, game.registry, A, phantasm, B)).toBeNull();
    nextTurn(game);
    expect(whyCannotAttack(game.state, game.registry, A, phantasm, B)).toMatch(/defender/);
  });

  it("Desperate Futurescribe: +1/+1 until end of turn, or a counter instead once you have", () => {
    const { game, a } = table({ step: "upkeep" });
    spawn(game, "Desperate Futurescribe");
    const bears = spawn(game, "Grizzly Bears");
    a.chooseTargetsFn = () => [ref(bears)];
    toStep(game, "begin-combat");
    settle(game);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    expect(counters(game, bears)).toBe(0);
    // Alice's next turn: the stat starts over, then she surveils.
    toStep(game, "precombat-main");
    surveil(game, 1);
    toStep(game, "begin-combat");
    settle(game);
    expect(counters(game, bears)).toBe(1);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
  });

  it("Proctor of Potential returns from the graveyard with a finality counter only after a scry or surveil", () => {
    const { game } = table();
    const proctor = toGraveyard(game, "Proctor of Potential");
    lands(game, "Plains", 1);
    lands(game, "Island", 1);
    expect(() => activate(game, proctor, 0)).toThrow(/refused/);
    scry(game, 1);
    activate(game, proctor, 0);
    expect(zone(game, proctor)).toBe("battlefield");
    expect(counters(game, proctor, "finality")).toBe(1);
  });

  it("Proctor of Potential surveils as it or another creature of yours enters", () => {
    const { game } = table();
    enter(game, "Proctor of Potential");
    expect(game.state.players[A].turnHistory?.scriedOrSurveilled).toBe(1);
    enter(game, "Grizzly Bears");
    expect(game.state.players[A].turnHistory?.scriedOrSurveilled).toBe(2);
  });
});
