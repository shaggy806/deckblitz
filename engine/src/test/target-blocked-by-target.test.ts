/**
 * An `other` target slot's `blockedThisTurnWith`: the slot blocked, or was
 * blocked by, the object of an earlier slot this turn (rules 509.1g-h, the
 * journal's blocks by stint — 400.7) — Glyph of Delusion's "target creature
 * that target Wall blocked this turn".
 */
import { describe, expect, it } from "vitest";

import type { BlockerDeclaration } from "../controller.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, cast, counters, lands, nextTurn, ref, spawn, table, toHand } from "./harness.js";

const blocks =
  (...pairs: readonly (readonly [ObjectId, ObjectId])[]): (() => BlockerDeclaration[]) =>
  () =>
    pairs.map(([blocker, attacker]) => ({ blocker, attacker }));

/** Bob attacks alice with a Hill Giant and Grizzly Bears; her Wall of Stone
 * blocks the Giant. On to the end of combat, alice holding priority. */
function afterBlock(): { game: Game; wall: ObjectId; giant: ObjectId; bears: ObjectId; glyph: ObjectId } {
  const { game, a, b } = table();
  const wall = spawn(game, "Wall of Stone", A);
  const giant = spawn(game, "Hill Giant", B);
  const bears = spawn(game, "Grizzly Bears", B);
  lands(game, "Island", 1);
  const glyph = toHand(game, "Glyph of Delusion");
  nextTurn(game);
  b.declareAttackersFn = () => [
    { attacker: giant, defender: A },
    { attacker: bears, defender: A },
  ];
  a.declareBlockersFn = blocks([wall, giant]);
  game.advanceUntil((s) => s.turn.step === "end-combat" && s.priority.holder === A);
  b.declareAttackersFn = () => [];
  return { game, wall, giant, bears, glyph };
}

const tapped = (game: Game, id: ObjectId): boolean => game.state.objects[id].tapped;

describe("Glyph of Delusion", () => {
  it("puts glyph counters equal to its power on the creature the Wall blocked", () => {
    const { game, wall, giant, glyph } = afterBlock();
    cast(game, glyph, { targets: [ref(wall), ref(giant)] });
    expect(counters(game, giant, "glyph")).toBe(3);
  });

  it("a creature the Wall didn't block can't be its target", () => {
    const { game, wall, bears, glyph } = afterBlock();
    expect(() => cast(game, glyph, { targets: [ref(wall), ref(bears)] })).toThrow(/target/i);
  });

  it("the first target must be a Wall", () => {
    const { game, giant, bears, glyph } = afterBlock();
    expect(() => cast(game, glyph, { targets: [ref(bears), ref(giant)] })).toThrow(/target/i);
  });

  it("only this turn's blocks count", () => {
    const { game, wall, giant, glyph } = afterBlock();
    nextTurn(game);
    expect(() => cast(game, glyph, { targets: [ref(wall), ref(giant)] })).toThrow(/target/i);
  });

  it("the creature stays tapped while it has a glyph counter, losing one each of its controller's upkeeps", () => {
    const { game, wall, giant, glyph } = afterBlock();
    cast(game, glyph, { targets: [ref(wall), ref(giant)] });
    expect(tapped(game, giant)).toBe(true);
    nextTurn(game);
    nextTurn(game);
    // Bob's turn: it didn't untap, and his upkeep took one counter.
    expect(tapped(game, giant)).toBe(true);
    expect(counters(game, giant, "glyph")).toBe(2);
    nextTurn(game);
    nextTurn(game);
    expect(counters(game, giant, "glyph")).toBe(1);
    expect(tapped(game, giant)).toBe(true);
    nextTurn(game);
    nextTurn(game);
    // The last counter came off in the upkeep, after the untap step.
    expect(counters(game, giant, "glyph")).toBe(0);
    expect(tapped(game, giant)).toBe(true);
    nextTurn(game);
    nextTurn(game);
    expect(tapped(game, giant)).toBe(false);
  });
});
