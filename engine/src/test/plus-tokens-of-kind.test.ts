/**
 * `plusTokens` with `ofTokens`: "that many" more of a token for each token of
 * one kind in the event, not for every token — Bilbo, Fellow Conspirator's
 * "if you would create a Food token, instead create a Food token and a
 * Treasure token". Written from the Oracle text and its rulings.
 */
import { describe, expect, it } from "vitest";

import { A, B, settle, spawn, table, tokensNamed } from "./harness.js";

describe("Bilbo, Fellow Conspirator", () => {
  it("creates a Treasure for each Food you would create", () => {
    const { game } = table();
    spawn(game, "Bilbo, Fellow Conspirator");
    game.debugApplyEffect(A, { kind: "create-token", token: "Food Token", count: 2 });
    settle(game);
    expect(tokensNamed(game, "Food Token", A)).toBe(2);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(2);
  });

  it("adds nothing to tokens that aren't Food", () => {
    const { game } = table();
    spawn(game, "Bilbo, Fellow Conspirator");
    game.debugApplyEffect(A, { kind: "create-token", token: "Clue Token", count: 2 });
    settle(game);
    expect(tokensNamed(game, "Clue Token", A)).toBe(2);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(0);
  });

  it("only for your own Food", () => {
    const { game } = table();
    spawn(game, "Bilbo, Fellow Conspirator");
    game.debugApplyEffect(B, { kind: "create-token", token: "Food Token", count: 1 });
    settle(game);
    expect(tokensNamed(game, "Food Token", B)).toBe(1);
    expect(tokensNamed(game, "Treasure Token", B)).toBe(0);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(0);
  });

  it("applies to a Food another replacement made, in the order that makes the most (rule 616.1)", () => {
    const { game } = table();
    spawn(game, "Bilbo, Fellow Conspirator");
    spawn(game, "Academy Manufactor");
    game.debugApplyEffect(A, { kind: "create-token", token: "Clue Token", count: 1 });
    settle(game);
    // A Clue becomes one of each, then the Food brings a Treasure.
    expect(tokensNamed(game, "Clue Token", A)).toBe(1);
    expect(tokensNamed(game, "Food Token", A)).toBe(1);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(2);
  });

  it("leaves Chatterfang's every-token count as it was", () => {
    const { game } = table();
    spawn(game, "Chatterfang, Squirrel General");
    game.debugApplyEffect(A, { kind: "create-token", token: "Clue Token", count: 2 });
    settle(game);
    expect(tokensNamed(game, "Squirrel Token", A)).toBe(2);
  });
});
