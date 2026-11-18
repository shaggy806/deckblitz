/**
 * "Can't be blocked unless it's attacking its owner or a permanent its owner
 * controls" (Become the Pilot): a `cant-be-blocked` record's `unlessAttacking`
 * aim, read as blocks are declared about what the creature is attacking then
 * (rule 509.1b). `"owner-and-permanents"` is its owner or a planeswalker or
 * battle they control.
 */
import { describe, expect, it } from "vitest";

import { whyCannotBlock } from "../combat/eligibility.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import type { ScriptedController } from "../controller.js";
import { A, B, C, cast, controller, lands, pt, ref, spawn, table, toHand } from "./harness.js";

const PILOT = "Become the Pilot";

/** Alice casts Become the Pilot on `creature` and takes it. */
function steal(game: Game, creature: ObjectId): ObjectId {
  lands(game, "Island", 5);
  const aura = toHand(game, PILOT);
  cast(game, aura, { targets: [ref(creature)] });
  return aura;
}

/** `attacker` attacks `defender`; the game runs to the declare blockers step. */
function attackOnly(game: Game, a: ScriptedController, attacker: ObjectId, defender: PlayerId | ObjectId): void {
  a.declareAttackersFn = () => [{ attacker, defender }];
  game.advanceUntil((s) => s.turn.step === "declare-blockers" || s.awaiting?.kind === "blockers");
}

describe("Become the Pilot: can't be blocked unless attacking its owner", () => {
  it("steals the creature, +2/+2; its owner may block it, another player may not", () => {
    const { game, a } = table({ players: 3 });
    const bears = spawn(game, "Grizzly Bears", B, { sick: false });
    steal(game, bears);
    expect(controller(game, bears)).toBe(A);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    const bobs = spawn(game, "Hill Giant", B);
    game.state.objects[bears].summoningSick = false;
    attackOnly(game, a, bears, B);
    expect(whyCannotBlock(game.state, game.registry, B, bobs, bears)).toBeNull();
  });

  it("attacking another player, it can't be blocked", () => {
    const { game, a } = table({ players: 3 });
    const bears = spawn(game, "Grizzly Bears", B, { sick: false });
    steal(game, bears);
    const carols = spawn(game, "Hill Giant", C);
    game.state.objects[bears].summoningSick = false;
    attackOnly(game, a, bears, C);
    expect(whyCannotBlock(game.state, game.registry, C, carols, bears)).toMatch(/can't block/);
  });

  it("a planeswalker its owner controls counts; one another player controls doesn't", () => {
    const { game, a } = table({ players: 3 });
    const bears = spawn(game, "Grizzly Bears", B, { sick: false });
    steal(game, bears);
    const bobsWalker = spawn(game, "Saheeli Rai", B);
    const bobs = spawn(game, "Hill Giant", B);
    game.state.objects[bears].summoningSick = false;
    attackOnly(game, a, bears, bobsWalker);
    expect(whyCannotBlock(game.state, game.registry, B, bobs, bears)).toBeNull();

    const other = table({ players: 3 });
    const bears2 = spawn(other.game, "Grizzly Bears", B, { sick: false });
    steal(other.game, bears2);
    const carolsWalker = spawn(other.game, "Saheeli Rai", C);
    const carols = spawn(other.game, "Hill Giant", C);
    other.game.state.objects[bears2].summoningSick = false;
    attackOnly(other.game, other.a, bears2, carolsWalker);
    expect(whyCannotBlock(other.game.state, other.game.registry, C, carols, bears2)).toMatch(/can't block/);
  });

  it("enchants only a noncommander creature", () => {
    const { game } = table({ players: 3 });
    const bears = spawn(game, "Grizzly Bears", B);
    game.state.objects[bears].isCommander = true;
    lands(game, "Island", 5);
    expect(() => cast(game, toHand(game, PILOT), { targets: [ref(bears)] })).toThrow(/target/i);
  });
});
