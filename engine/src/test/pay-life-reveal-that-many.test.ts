/**
 * "Pay any amount of life. Target opponent reveals that many cards from their
 * hand. You choose one of them and exile it." (Vizkopa Confessor): a
 * `players-pay-any-amount` of `who: "you"` whose `then` is a `discard-chosen`
 * of `reveals: "x"`, exiling the pick. The life is chosen as it resolves, 0
 * allowed (its rulings); the opponent picks which cards to reveal (rule
 * 701.20a), the ability's controller which of those to exile.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import { A, B, enter, hand, life, pickTargets, settle, table, toHand, zone } from "./harness.js";

const payLife = (game: Game, n: number): void => {
  game.advanceUntil((s) => s.awaiting?.kind === "choose-number");
  expect(game.state.awaiting).toMatchObject({ kind: "choose-number", player: A });
  game.dispatch({ type: "choose-number", player: A, number: n });
};

describe("Vizkopa Confessor", () => {
  it("pays the life, the opponent reveals that many, and the pick is exiled", () => {
    const { game, a } = table();
    for (const id of [...hand(game, B)]) game.debugMove(id, "library");
    const bolt = toHand(game, "Lightning Bolt", B);
    const bears = toHand(game, "Grizzly Bears", B);
    const giant = toHand(game, "Hill Giant", B);
    pickTargets(a, B);
    enter(game, "Vizkopa Confessor", A, { settle: false });
    payLife(game, 2);
    expect(life(game, A)).toBe(18);
    // Bob shows two of his three.
    game.advanceUntil((s) => s.awaiting !== null);
    expect(game.state.awaiting).toMatchObject({ kind: "choose-from-zone", player: B, destination: "reveal", min: 2, max: 2 });
    game.dispatch({ type: "choose-from-zone", player: B, chosen: [bolt, bears] });
    // Alice picks from those two alone, and it's exiled.
    expect(game.state.awaiting).toMatchObject({ kind: "choose-from-zone", player: A, destination: "exile", eligible: [bolt, bears] });
    game.dispatch({ type: "choose-from-zone", player: A, chosen: [bears] });
    settle(game);
    expect(zone(game, bears)).toBe("exile");
    expect(zone(game, bolt)).toBe("hand");
    expect(zone(game, giant)).toBe("hand");
  });

  it("paying 0 reveals and exiles nothing", () => {
    const { game, a } = table();
    const bolt = toHand(game, "Lightning Bolt", B);
    pickTargets(a, B);
    enter(game, "Vizkopa Confessor", A, { settle: false });
    payLife(game, 0);
    settle(game);
    expect(life(game, A)).toBe(20);
    expect(zone(game, bolt)).toBe("hand");
  });
});
