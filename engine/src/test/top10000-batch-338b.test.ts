/**
 * Top-10000 batch 338b (lane triggers-journal): Bishop of Binding's X read
 * from the card it exiled until it leaves.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  activate,
  attack,
  B,
  counters,
  destroy,
  enter,
  grant,
  hand,
  lands,
  life,
  named,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toStep,
  zone,
} from "./harness.js";

/** Put `n` fuse counters on `id` the way an effect does. */
const fuse = (game: Game, id: ObjectId, n: number, counter = "fuse"): void =>
  game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter, amount: n }, [ref(id)]);
/** Remove `n` counters of `counter` from `id` the way an effect does. */
const unfuse = (game: Game, id: ObjectId, n: number, counter: string): void =>
  game.debugApplyEffect(A, { kind: "remove-counter", target: 0, counter, amount: n }, [ref(id)]);

describe("batch 338b — Bishop of Binding", () => {
  it("gives a Vampire +X/+X, X the exiled card's power, and the card comes back when it leaves", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant", B);
    pickTargets(a, giant);
    const bishop = enter(game, "Bishop of Binding");
    expect(zone(game, giant)).toBe("exile");
    pickTargets(a, bishop);
    attack(game, a, [bishop]);
    // Hill Giant is a 3/3: the 1/1 Bishop is 4/4 until end of turn.
    expect(pt(game, bishop)).toEqual({ power: 4, toughness: 4 });
    destroy(game, bishop);
    expect(game.battlefield.some((id) => game.state.objects[id].cardName === "Hill Giant")).toBe(true);
  });

  it("X is 0 with no card exiled", () => {
    const { game, a } = table();
    const bishop = enter(game, "Bishop of Binding");
    pickTargets(a, bishop);
    attack(game, a, [bishop]);
    expect(pt(game, bishop)).toEqual({ power: 1, toughness: 1 });
  });
});

describe("batch 338b — Bomb Squad (a state trigger about each creature)", () => {
  it("the fourth fuse counter destroys the creature, and it deals 4 damage to its controller", () => {
    const { game } = table();
    const squad = spawn(game, "Bomb Squad");
    const giant = spawn(game, "Hill Giant", B);
    fuse(game, giant, 3);
    settle(game);
    expect(zone(game, giant)).toBe("battlefield");
    activate(game, squad, 0, { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("graveyard");
    expect(life(game, B)).toBe(16);
    expect(life(game, A)).toBe(20);
  });

  it("triggers once for each creature, and an indestructible one lives on with its counters gone", () => {
    const { game } = table();
    spawn(game, "Bomb Squad");
    const giant = spawn(game, "Hill Giant", B);
    const bears = spawn(game, "Grizzly Bears", A);
    grant(game, giant, "indestructible");
    fuse(game, giant, 4);
    fuse(game, bears, 5);
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, giant)).toBe("battlefield");
    expect(counters(game, giant, "fuse")).toBe(0);
    expect(life(game, A)).toBe(16);
    expect(life(game, B)).toBe(16);
  });

  it("two Bomb Squads each trigger: 8 damage (the ruling)", () => {
    const { game } = table();
    spawn(game, "Bomb Squad");
    spawn(game, "Bomb Squad");
    const giant = spawn(game, "Hill Giant", B);
    fuse(game, giant, 4);
    settle(game);
    expect(zone(game, giant)).toBe("graveyard");
    expect(life(game, B)).toBe(12);
  });

  it("at your upkeep, each creature with a fuse counter gets another", () => {
    const { game } = table();
    spawn(game, "Bomb Squad");
    const giant = spawn(game, "Hill Giant", B);
    const bears = spawn(game, "Grizzly Bears", B);
    fuse(game, giant, 1);
    toStep(game, "upkeep");
    settle(game);
    expect(counters(game, giant, "fuse")).toBe(2);
    expect(counters(game, bears, "fuse")).toBe(0);
    expect(named(game, "Bomb Squad").length).toBe(1);
  });
});

describe("batch 338b — Churning Reservoir (counters removed this turn)", () => {
  const goblins = (game: Game): number => named(game, "Phyrexian Goblin Token").length;

  it("activates only once an oil counter came off a permanent you controlled", () => {
    const { game } = table();
    const reservoir = spawn(game, "Churning Reservoir");
    lands(game, "Mountain", 4);
    const bears = spawn(game, "Grizzly Bears");
    fuse(game, bears, 2, "oil");
    expect(() => activate(game, reservoir)).toThrow();
    // A +1/+1 counter isn't an oil counter.
    fuse(game, bears, 1, "+1/+1");
    unfuse(game, bears, 1, "+1/+1");
    expect(() => activate(game, reservoir)).toThrow();
    unfuse(game, bears, 1, "oil");
    activate(game, reservoir);
    expect(goblins(game)).toBe(1);
  });

  it("an opponent's permanent losing one doesn't count; one with an oil counter dying does, anyone's", () => {
    const { game } = table();
    const reservoir = spawn(game, "Churning Reservoir");
    lands(game, "Mountain", 4);
    const theirs = spawn(game, "Grizzly Bears", B);
    fuse(game, theirs, 2, "oil");
    unfuse(game, theirs, 1, "oil");
    expect(() => activate(game, reservoir)).toThrow();
    destroy(game, theirs);
    activate(game, reservoir);
    expect(goblins(game)).toBe(1);
  });

  it("a permanent put into a graveyard with no oil counter doesn't count", () => {
    const { game } = table();
    const reservoir = spawn(game, "Churning Reservoir");
    lands(game, "Mountain", 4);
    destroy(game, spawn(game, "Grizzly Bears"));
    expect(() => activate(game, reservoir)).toThrow();
  });

  it("puts an oil counter on another nontoken artifact or creature you control at your upkeep", () => {
    const { game, a } = table();
    const reservoir = spawn(game, "Churning Reservoir");
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    toStep(game, "upkeep");
    settle(game);
    expect(counters(game, bears, "oil")).toBe(1);
    expect(counters(game, reservoir, "oil")).toBe(0);
  });
});

describe("batch 338b — Corruption of Towashi (transforms or enters transformed)", () => {
  /** Onto the battlefield as `name` — a back face's name puts its card there back face up — announcing the entry. */
  const arrive = (game: Game, name: string, player = A): ObjectId => {
    const id = game.debugSpawn(name, player, "battlefield", { announceEntry: true, summoningSick: false });
    settle(game);
    return id;
  };

  it("incubates 4, and draws when the Incubator transforms — once a turn", () => {
    const { game, a } = table();
    lands(game, "Island", 4);
    pickModes(a, 0);
    arrive(game, "Corruption of Towashi");
    const incubators = named(game, "Incubator Token");
    expect(incubators.length).toBe(1);
    expect(counters(game, incubators[0])).toBe(4);
    const before = hand(game).length;
    activate(game, incubators[0]);
    expect(hand(game).length).toBe(before + 1);
    // A second transform this turn draws nothing.
    pickModes(a, 0);
    arrive(game, "Insectile Aberration");
    expect(hand(game).length).toBe(before + 1);
  });

  it("a transforming double-faced card entering back face up triggers it; a modal one doesn't, nor an opponent's", () => {
    const { game, a } = table();
    spawn(game, "Corruption of Towashi");
    const before = hand(game).length;
    pickModes(a, 0);
    arrive(game, "Agadeem, the Undercrypt");
    arrive(game, "Insectile Aberration", B);
    arrive(game, "Delver of Secrets");
    expect(hand(game).length).toBe(before);
    const aberration = arrive(game, "Insectile Aberration");
    expect(game.state.objects[aberration].face).toBe(1);
    expect(hand(game).length).toBe(before + 1);
  });
});
