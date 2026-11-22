/**
 * "Move X +1/+1 counters from this creature onto another target creature"
 * (Tester of the Tangential, X paid for by its `may`): `move-counters`'
 * `amount: { count }`, read as it resolves — each counter's move its own
 * (rule 122.5), so as many as the creature has when it has fewer.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import type { GameState } from "../state.js";

import { A, counters, lands, ref, settle, spawn, table, toStep } from "./harness.js";

const quiet = (s: GameState): boolean => s.zones.shared.stack.length === 0 && s.awaiting === null && s.pendingTriggers.length === 0;

function payAndMove(game: Game, x: number, onto: ObjectId): void {
  game.advanceUntil((s) => s.awaiting?.kind === "choose-modes" || quiet(s));
  expect(game.state.awaiting?.kind).toBe("choose-modes");
  game.dispatch({ type: "choose-modes", player: A, modes: [0], xValue: x });
  // The reflexive ability's target, chosen as it triggers (rule 603.12).
  game.advanceUntil((s) => s.awaiting?.kind === "choose-targets" || quiet(s));
  if (game.state.awaiting?.kind === "choose-targets") {
    game.dispatch({ type: "choose-targets", player: A, targets: [ref(onto)] });
  }
  settle(game);
}

describe("move X counters (Tester of the Tangential)", () => {
  it("pays {X} at the beginning of combat and moves X +1/+1 counters onto another creature", () => {
    const { game } = table();
    lands(game, "Island", 2);
    const tester = spawn(game, "Tester of the Tangential");
    const bear = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 3 }, [ref(tester)]);
    toStep(game, "precombat-main");
    game.advanceUntil((s) => s.turn.step === "begin-combat" || s.awaiting !== null);
    payAndMove(game, 2, bear);
    expect(counters(game, tester)).toBe(1);
    expect(counters(game, bear)).toBe(2);
  });

  it("moves as many as there are when X is more", () => {
    const { game } = table();
    lands(game, "Island", 3);
    const tester = spawn(game, "Tester of the Tangential");
    const bear = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 }, [ref(tester)]);
    game.advanceUntil((s) => s.turn.step === "begin-combat" || s.awaiting !== null);
    payAndMove(game, 3, bear);
    expect(counters(game, tester)).toBe(0);
    expect(counters(game, bear)).toBe(1);
  });
});
