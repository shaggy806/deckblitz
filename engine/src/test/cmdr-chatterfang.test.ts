/**
 * Chatterfang, Squirrel General: "those tokens plus that many 1/1 green
 * Squirrel creature tokens are created instead" (`TokenMultiplierReplacement.
 * plusTokens`) — any kind of token, a token copy too; the Squirrels get what
 * the effect does to the tokens (tapped), none of what they are; with a
 * doubler, the same whichever order. And {B}, Sacrifice X Squirrels.
 */
import { describe, expect, it } from "vitest";

import { A, activate, lands, named, pt, ref, settle, spawn, table, tokensNamed } from "./harness.js";

describe("Chatterfang, Squirrel General", () => {
  it("adds that many Squirrels to any tokens created under your control", () => {
    const { game } = table();
    spawn(game, "Chatterfang, Squirrel General");
    game.debugApplyEffect(A, { kind: "create-token", token: "Treasure Token", count: 2 });
    settle(game);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(2);
    expect(tokensNamed(game, "Squirrel Token", A)).toBe(2);
  });

  it("with a token doubler: twice the tokens and twice the Squirrels", () => {
    const { game } = table();
    spawn(game, "Chatterfang, Squirrel General");
    spawn(game, "Anointed Procession");
    game.debugApplyEffect(A, { kind: "create-token", token: "Treasure Token", count: 1 });
    settle(game);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(2);
    expect(tokensNamed(game, "Squirrel Token", A)).toBe(2);
  });

  it("the Squirrels enter tapped with tokens that do, and a copy's Squirrel is a plain Squirrel", () => {
    const { game } = table();
    spawn(game, "Chatterfang, Squirrel General");
    game.debugApplyEffect(A, { kind: "create-token", token: "Soldier Token", count: 1, tapped: true });
    settle(game);
    for (const id of named(game, "Squirrel Token", A)) expect(game.state.objects[id].tapped).toBe(true);
    const bears = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "create-token-copy", of: 0, count: 1 }, [ref(bears)]);
    settle(game);
    expect(named(game, "Grizzly Bears", A)).toHaveLength(2);
    expect(tokensNamed(game, "Squirrel Token", A)).toBe(2);
  });

  it("{B}, Sacrifice X Squirrels: target creature gets +X/-X", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    const chatterfang = spawn(game, "Chatterfang, Squirrel General");
    game.debugApplyEffect(A, { kind: "create-token", token: "Treasure Token", count: 2 });
    settle(game);
    const giant = spawn(game, "Hill Giant");
    activate(game, chatterfang, 0, { targets: [ref(giant)], x: 2, settle: false });
    // Chatterfang is a Squirrel too: the two tokens, here.
    const awaiting = game.state.awaiting;
    expect(awaiting?.kind).toBe("sacrifice");
    if (awaiting?.kind === "sacrifice") {
      const squirrels = awaiting.eligible.filter((id) => id !== chatterfang);
      const picks = squirrels.flatMap((id) => Array<typeof id>(game.state.objects[id].stackCount ?? 1).fill(id));
      game.dispatch({ type: "sacrifice", player: A, permanents: picks.slice(0, 2) });
    }
    settle(game);
    expect(tokensNamed(game, "Squirrel Token", A)).toBe(0);
    expect(game.state.objects[chatterfang].zone).toBe("battlefield");
    expect(pt(game, giant)).toEqual({ power: 5, toughness: 1 });
  });
});
