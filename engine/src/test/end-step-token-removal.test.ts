/**
 * "Sacrifice (exile) them at the beginning of the next end step" is a delayed triggered ability
 * (rule 603.7) — `create-token`'s `sacrificeAtEndStep` / `exileAtEndStep` set one up over the
 * tokens made. It goes on the stack as the end step begins (so it can be responded to), and it
 * reaches every token of the batch, each its own object.
 */
import { describe, expect, it } from "vitest";

import { A, settle, table } from "./harness.js";

const goblins = (game: ReturnType<typeof table>["game"]): number =>
  game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].cardName === "Goblin Token").length;

describe("end-step token removal is a delayed trigger (603.7)", () => {
  it("goes on the stack at the end step and sacrifices every token made", () => {
    const { game } = table();
    game.debugApplyEffect(A, { kind: "create-token", token: "Goblin Token", count: 3, sacrificeAtEndStep: true });
    settle(game);
    expect(goblins(game)).toBe(3);
    game.advanceUntil((s) => s.turn.step === "end" && s.zones.shared.stack.length > 0);
    // On the stack, not yet resolved: the tokens are still here.
    expect(goblins(game)).toBe(3);
    settle(game);
    expect(goblins(game)).toBe(0);
  });

  it("an exile-at-end-step token is exiled the same way", () => {
    const { game } = table();
    game.debugApplyEffect(A, { kind: "create-token", token: "Goblin Token", count: 2, exileAtEndStep: true });
    settle(game);
    game.advanceUntil((s) => s.turn.step === "end" && s.zones.shared.stack.length > 0);
    expect(goblins(game)).toBe(2);
    settle(game);
    expect(goblins(game)).toBe(0);
  });
});
