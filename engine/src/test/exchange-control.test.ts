/**
 * Exchanging control (rule 701.12): of two permanents — each controller gains
 * the other's at once, all or nothing (701.12a), nothing when one player
 * controls both (701.12b) — and "you and target opponent each gain control of
 * all creatures the other controls" (Reins of Power), both sets fixed before
 * either moves.
 */

import { describe, expect, it } from "vitest";

import type { EffectSpec } from "../effects.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import type { TargetRef } from "../target.js";
import { A, B, C, controller, life, settle, spawn, table } from "./harness.js";

const obj = (id: ObjectId): TargetRef => ({ kind: "object", object: id });
const run = (game: Game, effect: EffectSpec, targets: readonly TargetRef[], player: PlayerId = A, source?: ObjectId): void => {
  game.debugApplyEffect(player, effect, targets, { source });
  settle(game);
};
const SWAP: EffectSpec = {
  kind: "exchange-control",
  objects: [0, 1],
  then: { kind: "gain-life", amount: 1 },
  otherwise: { kind: "gain-life", amount: 5 },
};

describe("exchange-control", () => {
  it("each controller gains the other's permanent, with one timestamp", () => {
    const { game } = table();
    const mine = spawn(game, "Grizzly Bears", A);
    const theirs = spawn(game, "Hill Giant", B);
    run(game, SWAP, [obj(mine), obj(theirs)]);
    expect(controller(game, mine)).toBe(B);
    expect(controller(game, theirs)).toBe(A);
    const stamps = [mine, theirs].map((id) => game.state.objects[id].controlEffects?.at(-1)?.timestamp);
    expect(stamps[0]).toBe(stamps[1]);
    expect(life(game, A)).toBe(21);
  });

  it("between two other players' permanents too (a 3-player table)", () => {
    const { game } = table({ players: 3 });
    const bobs = spawn(game, "Grizzly Bears", B);
    const carols = spawn(game, "Hill Giant", C);
    run(game, SWAP, [obj(bobs), obj(carols)]);
    expect(controller(game, bobs)).toBe(C);
    expect(controller(game, carols)).toBe(B);
  });

  it("does nothing when one player controls both (701.12b)", () => {
    const { game } = table();
    const one = spawn(game, "Grizzly Bears", B);
    const two = spawn(game, "Hill Giant", B);
    run(game, SWAP, [obj(one), obj(two)]);
    expect(controller(game, one)).toBe(B);
    expect(controller(game, two)).toBe(B);
    expect(life(game, A)).toBe(25);
  });

  it("is all or nothing: with one gone, the other stays put (701.12a)", () => {
    const { game } = table();
    const mine = spawn(game, "Grizzly Bears", A);
    const theirs = spawn(game, "Hill Giant", B);
    game.debugMove(theirs, "graveyard");
    run(game, SWAP, [obj(mine), obj(theirs)]);
    expect(controller(game, mine)).toBe(A);
    expect(life(game, A)).toBe(25);
  });

  it("can exchange its own source (\"this artifact and target nonland permanent\")", () => {
    const { game } = table();
    const totem = spawn(game, "Grizzly Bears", A);
    const theirs = spawn(game, "Hill Giant", B);
    run(game, { kind: "exchange-control", objects: ["source", 0] }, [obj(theirs)], A, totem);
    expect(controller(game, totem)).toBe(B);
    expect(controller(game, theirs)).toBe(A);
  });
});

describe("gain-control-all over a target player's", () => {
  it("takes every creature that player controls, and no one else's", () => {
    const { game } = table({ players: 3 });
    const bobs = spawn(game, "Hill Giant", B);
    const carols = spawn(game, "Hill Giant", C);
    run(
      game,
      { kind: "gain-control-all", filter: { type: "creature" }, untilEndOfTurn: false, controlledByTarget: 0 },
      [{ kind: "player", player: B }],
    );
    expect(controller(game, bobs)).toBe(A);
    expect(controller(game, carols)).toBe(C);
  });
});

describe("exchange-control-all", () => {
  it("you and the opponent each gain the other's creatures until end of turn; others' stay", () => {
    const { game } = table({ players: 3 });
    const mine = spawn(game, "Grizzly Bears", A);
    const bobs = [spawn(game, "Hill Giant", B), spawn(game, "Grizzly Bears", B)];
    const carols = spawn(game, "Hill Giant", C);
    const land = spawn(game, "Wastes", B);
    run(
      game,
      { kind: "exchange-control-all", filter: { type: "creature" }, with: { target: 0 }, untilEndOfTurn: true },
      [{ kind: "player", player: B }],
    );
    expect(controller(game, mine)).toBe(B);
    expect(bobs.map((id) => controller(game, id))).toEqual([A, A]);
    expect(controller(game, carols)).toBe(C);
    expect(controller(game, land)).toBe(B);
    game.advanceUntil((s) => s.turn.number === 2);
    expect(controller(game, mine)).toBe(A);
    expect(bobs.map((id) => controller(game, id))).toEqual([B, B]);
  });
});
