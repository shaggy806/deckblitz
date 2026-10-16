/**
 * Case cards (rule 719.3): "To solve — [condition]" is "at the beginning of
 * your end step, if [condition] and this Case is not solved, this Case
 * becomes solved" (719.3a); solved is a designation that lasts until the
 * permanent leaves the battlefield (719.3b); "Solved — [ability]" works only
 * while it's solved (719.3c). The `caseToSolve` helper, the `solve` effect
 * and the `solved` condition — Case of the Crimson Pulse.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import { A, hand, nextTurn, settle, spawn, table, toStep } from "./harness.js";

const solved = (game: Game, id: ObjectId): boolean => game.state.objects[id].solved === true;
const emptyHand = (game: Game): void => {
  for (const id of [...hand(game)]) game.debugMove(id, "graveyard");
};

describe("Cases", () => {
  it("solves at its controller's end step only if the condition holds then", () => {
    const { game } = table();
    const pulse = spawn(game, "Case of the Crimson Pulse");
    // Cards in hand at the end step: not solved.
    toStep(game, "end");
    settle(game);
    expect(solved(game, pulse)).toBe(false);
    nextTurn(game);
    nextTurn(game);
    emptyHand(game);
    toStep(game, "end");
    settle(game);
    expect(solved(game, pulse)).toBe(true);
    expect(game.viewFor(A).objects[pulse]?.solved).toBe(true);
  });

  it("'Solved —' works only once solved: the upkeep trigger", () => {
    const { game } = table();
    const pulse = spawn(game, "Case of the Crimson Pulse");
    nextTurn(game);
    nextTurn(game); // Alice's upkeep passed unsolved: her hand only grew by the draw.
    const unsolvedHand = hand(game).length;
    expect(unsolvedHand).toBeGreaterThan(2);
    emptyHand(game);
    toStep(game, "end");
    settle(game);
    expect(solved(game, pulse)).toBe(true);
    nextTurn(game);
    nextTurn(game, "draw");
    settle(game);
    // Upkeep: discard the (empty) hand, draw two; then the draw step's card.
    expect(hand(game).length).toBe(3);
  });

  it("leaving the battlefield ends it (a new object isn't solved)", () => {
    const { game } = table();
    const pulse = spawn(game, "Case of the Crimson Pulse");
    emptyHand(game);
    toStep(game, "end");
    settle(game);
    expect(solved(game, pulse)).toBe(true);
    game.debugMove(pulse, "hand");
    game.debugMove(pulse, "battlefield");
    expect(solved(game, pulse)).toBe(false);
  });
});
