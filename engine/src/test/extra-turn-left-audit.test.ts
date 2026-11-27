import { describe, expect, it } from "vitest";

import { A, B, cast, lands, table, toHand } from "./harness.js";

/**
 * A rules audit (2026-11-26): an extra turn of a player who has since left
 * the game doesn't begin (rule 800.4k); the next player in turn order goes.
 */
describe("an extra turn of a player who left, audited", () => {
  it("alice takes Time Warp, then concedes: bob's turn comes next, not alice's extra one", () => {
    const { game, a } = table({ players: 3 });
    a.chooseTargetsFn = () => [{ kind: "player", player: A }];
    lands(game, "Island", 5);
    cast(game, toHand(game, "Time Warp"), { targets: [{ kind: "player", player: A }] });
    game.concede(A);
    game.advanceUntil((s) => s.turn.number === 2 && s.turn.step === "precombat-main");
    expect(game.state.turnOrder[game.state.turn.activePlayerIndex]).toBe(B);
  });

  it("with alice still in, her extra turn comes next (control)", () => {
    const { game, a } = table({ players: 3 });
    a.chooseTargetsFn = () => [{ kind: "player", player: A }];
    lands(game, "Island", 5);
    cast(game, toHand(game, "Time Warp"), { targets: [{ kind: "player", player: A }] });
    game.advanceUntil((s) => s.turn.number === 2 && s.turn.step === "precombat-main");
    expect(game.state.turnOrder[game.state.turn.activePlayerIndex]).toBe(A);
  });
});
