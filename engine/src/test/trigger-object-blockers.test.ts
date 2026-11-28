/**
 * An intervening-if (rule 603.4) over the creatures blocking a trigger's
 * object: an `amounts` condition counting `{ countOf }` a filter whose
 * `blockingRelation` is `of: "trigger-object"`, bound as the trigger fires and
 * again as it resolves — Wall of Caltrops' "if at least one other Wall
 * creature is blocking that creature and no non-Wall creatures are blocking
 * that creature" (rules 509.1h, 702.22).
 */
import { describe, expect, it } from "vitest";

import type { BlockerDeclaration } from "../controller.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, keywords, nextTurn, spawn, table } from "./harness.js";

const blocks =
  (...pairs: readonly (readonly [ObjectId, ObjectId])[]): (() => BlockerDeclaration[]) =>
  () =>
    pairs.map(([blocker, attacker]) => ({ blocker, attacker }));

/** Blocks declared and every trigger resolved, still in the declare blockers step. */
const toBlocks = (game: Game): void =>
  game.advanceUntil(
    (s) => s.turn.step === "declare-blockers" && s.awaiting === null && s.zones.shared.stack.length === 0,
  );

/** Bob attacks alice with a Hill Giant; alice blocks it with `blockers`. */
function blockGiant(names: readonly string[]): { game: Game; walls: ObjectId[] } {
  const { game, a, b } = table();
  const walls = names.map((n) => spawn(game, n, A));
  const giant = spawn(game, "Hill Giant", B);
  nextTurn(game);
  b.declareAttackersFn = () => [{ attacker: giant, defender: A }];
  a.declareBlockersFn = blocks(...walls.map((w) => [w, giant] as const));
  toBlocks(game);
  return { game, walls };
}

const banding = (game: Game, id: ObjectId): boolean => keywords(game, id).has("banding");

describe("Wall of Caltrops", () => {
  it("has defender, and no banding of its own", () => {
    const { game } = table();
    const wall = spawn(game, "Wall of Caltrops");
    expect(keywords(game, wall).has("defender")).toBe(true);
    expect(banding(game, wall)).toBe(false);
  });

  it("gains banding blocking beside another Wall", () => {
    const { game, walls } = blockGiant(["Wall of Caltrops", "Wall of Stone"]);
    expect(banding(game, walls[0])).toBe(true);
    expect(banding(game, walls[1])).toBe(false);
  });

  it("blocking alone, it gains nothing: the other Wall must be another", () => {
    const { game, walls } = blockGiant(["Wall of Caltrops"]);
    expect(banding(game, walls[0])).toBe(false);
  });

  it("a non-Wall blocking the same creature stops it", () => {
    const { game, walls } = blockGiant(["Wall of Caltrops", "Wall of Stone", "Grizzly Bears"]);
    expect(banding(game, walls[0])).toBe(false);
  });

  it("two of them blocking together each gain banding", () => {
    const { game, walls } = blockGiant(["Wall of Caltrops", "Wall of Caltrops"]);
    expect(banding(game, walls[0])).toBe(true);
    expect(banding(game, walls[1])).toBe(true);
  });

  it("a Wall blocking another creature doesn't count", () => {
    const { game, a, b } = table();
    const caltrops = spawn(game, "Wall of Caltrops", A);
    const stone = spawn(game, "Wall of Stone", A);
    const giant = spawn(game, "Hill Giant", B);
    const bears = spawn(game, "Grizzly Bears", B);
    nextTurn(game);
    b.declareAttackersFn = () => [
      { attacker: giant, defender: A },
      { attacker: bears, defender: A },
    ];
    a.declareBlockersFn = blocks([caltrops, giant], [stone, bears]);
    toBlocks(game);
    expect(banding(game, caltrops)).toBe(false);
  });

  it("asks again as it resolves: the other Wall gone by then, nothing (rule 603.4)", () => {
    const { game, a, b } = table();
    const caltrops = spawn(game, "Wall of Caltrops", A);
    const stone = spawn(game, "Wall of Stone", A);
    const giant = spawn(game, "Hill Giant", B);
    nextTurn(game);
    b.declareAttackersFn = () => [{ attacker: giant, defender: A }];
    a.declareBlockersFn = blocks([caltrops, giant], [stone, giant]);
    game.advanceUntil((s) => s.turn.step === "declare-blockers" && s.zones.shared.stack.length > 0);
    game.debugMove(stone, "graveyard");
    toBlocks(game);
    expect(banding(game, caltrops)).toBe(false);
  });

  it("the banding lasts the turn", () => {
    const { game, walls } = blockGiant(["Wall of Caltrops", "Wall of Stone"]);
    game.advanceUntil((s) => s.turn.step === "end");
    expect(banding(game, walls[0])).toBe(true);
    nextTurn(game);
    expect(banding(game, walls[0])).toBe(false);
  });
});
