/**
 * "You gain life rather than lose life from radiation" — Strong, the Brutish
 * Thespian: a `would-lose-life` replacement with `from: "radiation"` (rule
 * 728.1a: life lost as a result of the rad counters' triggered ability) and
 * an `{ effect }` instead, so the loss never happens (rule 614.6).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { PlayerId } from "../primitives.js";

import { A, B, cast, counters, lands, life, nextTurn, ref, settle, spawn, table, toHand, turnTotal } from "./harness.js";

const rad = (game: Game, player: PlayerId = A): number => game.state.players[player].counters.rad ?? 0;
const giveRad = (game: Game, n: number, player: PlayerId = A): void => {
  game.debugApplyEffect(player, { kind: "add-player-counters", counter: "rad", amount: n }, []);
  settle(game);
};

describe("life lost from radiation, replaced (Strong, the Brutish Thespian)", () => {
  it("its controller gains that much life instead, and still removes the rad counters", () => {
    const { game } = table({ deck: "Grizzly Bears" });
    spawn(game, "Strong, the Brutish Thespian");
    giveRad(game, 3);
    nextTurn(game);
    nextTurn(game); // Alice's precombat main: three nonland cards milled.
    settle(game);
    expect(life(game)).toBe(23);
    expect(rad(game)).toBe(0);
    expect(turnTotal(game.state, A, "life-lost")).toBe(0);
    expect(turnTotal(game.state, A, "life-gained")).toBe(3);
  });

  it("without it, the same radiation is a loss", () => {
    const { game } = table({ deck: "Grizzly Bears" });
    giveRad(game, 3);
    nextTurn(game);
    nextTurn(game);
    settle(game);
    expect(life(game)).toBe(17);
  });

  it("only its controller's loss, and only from radiation", () => {
    const { game } = table({ deck: "Grizzly Bears" });
    spawn(game, "Strong, the Brutish Thespian");
    giveRad(game, 2, B);
    nextTurn(game); // Bob's precombat main.
    settle(game);
    expect(life(game, B)).toBe(18);
    expect(rad(game, B)).toBe(0);
    // Any other loss of Alice's is a loss.
    game.debugApplyEffect(A, { kind: "lose-life", amount: 2 }, []);
    settle(game);
    expect(life(game)).toBe(18);
  });

  it("enrage: three rad counters and three +1/+1 counters", () => {
    const { game } = table();
    const strong = spawn(game, "Strong, the Brutish Thespian");
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Shock"), { targets: [ref(strong)] });
    expect(rad(game)).toBe(3);
    expect(counters(game, strong)).toBe(3);
  });
});
