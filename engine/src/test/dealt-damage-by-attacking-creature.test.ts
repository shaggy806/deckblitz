/**
 * "Whenever that creature is dealt damage by an attacking creature this turn,
 * you gain that much life" (Glyph of Life): a delayed `dealt-damage` watch of
 * the target narrowed by its source (`bySource`), settled once per damage
 * event for what the matching sources dealt it together (rule 603.2c) — two
 * attackers blocked by one Wall are one trigger for the total — and nothing
 * for damage from a source that isn't an attacking creature.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import type { GameState } from "../state.js";
import { A, B, cast, lands, life, nextTurn, ref, settle, spawn, table, toHand, toStep } from "./harness.js";

const GLYPH = "Glyph of Life";

const blocksDeclared = (s: GameState): boolean =>
  s.turn.step === "declare-blockers" && s.awaiting === null && s.priority.holder === A && s.zones.shared.stack.length === 0;

const triggersOf = (game: Game, glyph: ObjectId): number =>
  game.state.eventLog.filter((e) => e.type === "ability-triggered" && e.source === glyph).length;

/** Bob's turn: his `attackers` attack alice, her Wall of Glare blocks
 * `blocked` of them, and she casts Glyph of Life on it before damage. */
function wallBlocks(attackers: readonly string[], blocked: number) {
  const { game, a, b } = table();
  const wall = spawn(game, "Wall of Glare", A);
  const ids = attackers.map((name) => spawn(game, name, B));
  lands(game, "Plains", 1, A);
  const glyph = toHand(game, GLYPH, A);
  nextTurn(game);
  b.declareAttackersFn = () => ids.map((attacker) => ({ attacker, defender: A }));
  a.declareBlockersFn = () => ids.slice(0, blocked).map((attacker) => ({ blocker: wall, attacker }));
  game.advanceUntil(blocksDeclared);
  cast(game, glyph, { player: A, targets: [ref(wall)] });
  toStep(game, "postcombat-main", B);
  settle(game);
  return { game, wall, glyph, ids };
}

describe("Glyph of Life", () => {
  it("an attacker the Wall blocks deals it 3: alice gains 3", () => {
    const { game } = wallBlocks(["Hill Giant"], 1);
    expect(life(game, A)).toBe(23);
  });

  it("two attackers dealing it damage at once: one trigger, the total (rule 603.2c)", () => {
    const { game, glyph } = wallBlocks(["Grizzly Bears", "Hill Giant"], 2);
    expect(triggersOf(game, glyph)).toBe(1);
    expect(life(game, A)).toBe(25);
  });

  it("only what attacking creatures dealt: an unblocked attacker's damage to alice is no part of it", () => {
    const { game } = wallBlocks(["Grizzly Bears", "Hill Giant"], 1);
    // The Bears were blocked (2 to the Wall); the Giant hit alice for 3.
    expect(life(game, A)).toBe(20 + 2 - 3);
  });

  it("damage from a source that isn't an attacking creature gains nothing", () => {
    const { game } = table();
    const wall = spawn(game, "Wall of Glare", A);
    lands(game, "Plains", 1, A);
    cast(game, toHand(game, GLYPH, A), { targets: [ref(wall)] });
    lands(game, "Mountain", 1, A);
    cast(game, toHand(game, "Shock", A), { targets: [ref(wall)] });
    // A creature that isn't attacking.
    const bears = spawn(game, "Grizzly Bears", B);
    game.debugApplyEffect(B, { kind: "damage", amount: 2, target: 0 }, [ref(wall)], { source: bears });
    settle(game);
    expect(life(game, A)).toBe(20);
  });
});
