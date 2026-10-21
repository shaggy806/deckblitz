/**
 * "Creatures with swampwalk can be blocked as though they didn't have
 * swampwalk" (rule 702.14 — Legends' Quagmire, Lord Magnus): the landwalk
 * named is ignored when blocks are declared, whoever controls the static.
 */
import { describe, expect, it } from "vitest";

import { whyCannotBlock } from "../combat/eligibility.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { B, lands, spawn, table } from "./harness.js";

function attackWith(game: Game, a: { declareAttackersFn?: unknown }, attacker: ObjectId): void {
  (a as { declareAttackersFn: () => unknown }).declareAttackersFn = () => [{ attacker, defender: B }];
  game.advanceUntil((s) => s.turn.step === "declare-blockers" || s.awaiting?.kind === "blockers");
}

describe("blockable despite landwalk", () => {
  it("a swampwalker can't be blocked by a Swamp's controller — until Quagmire is out", () => {
    const { game, a } = table();
    const walker = spawn(game, "Anaconda");
    lands(game, "Swamp", 1, B);
    const blocker = spawn(game, "Hill Giant", B);
    attackWith(game, a, walker);
    expect(whyCannotBlock(game.state, game.registry, B, blocker, walker)).toMatch(/swampwalk/);
    spawn(game, "Quagmire", B);
    expect(whyCannotBlock(game.state, game.registry, B, blocker, walker)).toBeNull();
  });

  it("only the landwalk named: Lord Magnus doesn't stop swampwalk", () => {
    const { game, a } = table();
    const walker = spawn(game, "Anaconda");
    lands(game, "Swamp", 1, B);
    spawn(game, "Lord Magnus");
    const blocker = spawn(game, "Hill Giant", B);
    attackWith(game, a, walker);
    expect(whyCannotBlock(game.state, game.registry, B, blocker, walker)).toMatch(/swampwalk/);
  });
});
