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
  life,
  named,
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
const fuse = (game: Game, id: ObjectId, n: number): void =>
  game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "fuse", amount: n }, [ref(id)]);

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
