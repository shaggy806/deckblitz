/**
 * "When you cast a spell with the chosen name for the first time this turn"
 * (Medomai's Prophecy's chapter III): a delayed `cast-spell` watch with the
 * timing wrapper, its `chosenName` filter read from the Saga — the earlier
 * spells the wrapper counts are asked about the same name, so one cast
 * before the delayed trigger was set up keeps any later one from being the
 * first.
 */
import { describe, expect, it } from "vitest";
import type { EffectSpec } from "../effects.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, cast, hand, lands, nextTurn, settle, spawn, table, toHand } from "./harness.js";

const chapter = (game: Game, n: number): EffectSpec => {
  const def = game.registry.get("Medomai's Prophecy");
  const found = (def.chapters ?? []).find((c) => c.at.includes(n));
  if (found === undefined) throw new Error(`no chapter ${n}`);
  return found.effect as EffectSpec;
};

/** A Saga past chapter I, with Opt named (chapter II), and chapter III's
 * delayed trigger set up unless `armed` is false. */
function prophecy(armed = true): { game: Game; saga: ObjectId } {
  const t = table();
  const { game, a } = t;
  const saga = spawn(game, "Medomai's Prophecy");
  settle(game);
  a.chooseCardNameFn = () => "Opt";
  game.debugApplyEffect(A, chapter(game, 2), [], { source: saga });
  settle(game);
  if (armed) {
    game.debugApplyEffect(A, chapter(game, 3), [], { source: saga });
    settle(game);
  }
  lands(game, "Island", 4);
  return { game, saga };
}

/** Cards drawn by casting `name` (its own draw included). */
const drawnByCasting = (game: Game, name: string): number => {
  const card = toHand(game, name);
  const before = hand(game).length - 1;
  cast(game, card);
  return hand(game).length - before;
};

describe("a delayed trigger on the first spell with the chosen name this turn", () => {
  it("Medomai's Prophecy: the first Opt draws two more; a second Opt, and another name, draw none", () => {
    const { game } = prophecy();
    lands(game, "Swamp", 1);
    expect(drawnByCasting(game, "Dark Ritual")).toBe(0);
    expect(drawnByCasting(game, "Opt")).toBe(3);
    expect(drawnByCasting(game, "Opt")).toBe(1);
  });

  it("Medomai's Prophecy: an Opt cast this turn before chapter III resolved means no later Opt is the first", () => {
    const { game, saga } = prophecy(false);
    expect(drawnByCasting(game, "Opt")).toBe(1);
    game.debugApplyEffect(A, chapter(game, 3), [], { source: saga });
    settle(game);
    expect(drawnByCasting(game, "Opt")).toBe(1);
  });

  it("Medomai's Prophecy: the delayed trigger lasts this turn only", () => {
    const { game } = prophecy();
    nextTurn(game);
    nextTurn(game);
    lands(game, "Island", 1);
    expect(drawnByCasting(game, "Opt")).toBe(1);
  });
});
