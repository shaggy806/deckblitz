/**
 * "As long as you control a transformed permanent" (rule 701.27g): a
 * `controls` condition over `{ transformed: true }` — Oculus Whelp's granted
 * dies trigger.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, hand, ref, settle, spawn, table } from "./harness.js";

const transform = (game: Game, id: ObjectId): void => {
  game.debugApplyEffect(A, { kind: "transform", target: 0 }, [ref(id)]);
  settle(game);
};

const kill = (game: Game, id: ObjectId): void => {
  game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(id)]);
  settle(game);
};

describe("Oculus Whelp", () => {
  it("draws a card as it dies while you control a transformed permanent", () => {
    const { game } = table();
    const whelp = spawn(game, "Oculus Whelp");
    const delver = spawn(game, "Delver of Secrets");
    transform(game, delver);
    const before = hand(game).length;
    kill(game, whelp);
    expect(hand(game).length).toBe(before + 1);
  });

  it("draws nothing with the double-faced permanent front face up", () => {
    const { game } = table();
    const whelp = spawn(game, "Oculus Whelp");
    spawn(game, "Delver of Secrets");
    const before = hand(game).length;
    kill(game, whelp);
    expect(hand(game).length).toBe(before);
  });

  it("an opponent's transformed permanent isn't yours", () => {
    const { game } = table();
    const whelp = spawn(game, "Oculus Whelp");
    const delver = spawn(game, "Delver of Secrets", B);
    game.debugApplyEffect(B, { kind: "transform", target: 0 }, [ref(delver)]);
    settle(game);
    const before = hand(game).length;
    kill(game, whelp);
    expect(hand(game).length).toBe(before);
  });
});
