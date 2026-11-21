/**
 * "The game is a draw" (rule 104.4c) — `game-is-a-draw` — and the
 * `counters-removed` trigger's `byYou` off a permanent, read from the
 * `counter-removed` event's `by`: Divine Intervention.
 */

import { describe, expect, it } from "vitest";

import { A, B, C, D, counters, enter, ref, settle, table } from "./harness.js";

const NAME = "Divine Intervention";

describe("game-is-a-draw", () => {
  it("ends the game with nobody winning, in a four-player game too (104.4c)", () => {
    const { game } = table({ players: 4 });
    game.debugApplyEffect(C, { kind: "game-is-a-draw" });
    expect(game.state.result.over).toBe(true);
    expect(game.state.result.winner).toBeNull();
    for (const p of [A, B, C, D]) expect(game.state.players[p].hasLost).toBe(false);
  });

  it("isn't stopped by \"can't win\" or \"can't lose\"", () => {
    const { game } = table();
    game.debugApplyEffect(A, {
      kind: "prohibit",
      prohibits: [{ act: "lose-game", who: "you" }, { act: "win-game", who: "each-opponent" }],
    });
    game.debugApplyEffect(B, { kind: "game-is-a-draw" });
    expect(game.state.result).toMatchObject({ over: true, winner: null });
  });
});

describe("Divine Intervention", () => {
  it("enters with two counters, loses one each upkeep, and the last one draws the game", () => {
    const { game } = table({ players: 4 });
    const di = enter(game, NAME);
    expect(counters(game, di, "intervention")).toBe(2);
    // Alice's next upkeep: one off.
    game.advanceUntil((s) => s.turn.number === 5 && s.turn.step === "draw");
    expect(counters(game, di, "intervention")).toBe(1);
    expect(game.state.result.over).toBe(false);
    game.advanceUntil((s) => s.result.over || s.turn.number > 9);
    expect(game.state.result).toMatchObject({ over: true, winner: null });
    expect(game.state.turn.number).toBe(9);
    expect(game.state.turn.step).toBe("upkeep");
  });

  it("doesn't trigger when another player removes the last counter (the rulings)", () => {
    const { game } = table();
    const di = enter(game, NAME);
    game.debugApplyEffect(B, { kind: "remove-counter", target: 0, counter: "intervention", amount: 2 }, [ref(di)]);
    settle(game);
    expect(counters(game, di, "intervention")).toBe(0);
    expect(game.state.pendingTriggers).toHaveLength(0);
    expect(game.state.result.over).toBe(false);
  });

  it("triggers when its controller's own effect removes the last one", () => {
    const { game } = table();
    const di = enter(game, NAME);
    game.debugApplyEffect(A, { kind: "remove-counter", target: 0, counter: "intervention", amount: 2 }, [ref(di)]);
    settle(game);
    expect(game.state.result).toMatchObject({ over: true, winner: null });
  });
});
