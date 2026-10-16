/**
 * Rad counters (rule 728): a kind of player counter whose inherent triggered
 * ability (728.1) — "at the beginning of each player's precombat main phase,
 * if that player has one or more rad counters, that player mills a number of
 * cards equal to the number of rad counters they have. For each nonland card
 * milled this way, that player loses 1 life and removes one rad counter from
 * themselves." — rides an object of its own (`PlayerState.radAbility`).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { PlayerId } from "../primitives.js";

import { A, B, graveyard, life, nextTurn, settle, table, toLibrary } from "./harness.js";

const rad = (game: Game, player: PlayerId = A): number => game.state.players[player].counters.rad ?? 0;
const giveRad = (game: Game, n: number, player: PlayerId = A): void => {
  game.debugApplyEffect(player, { kind: "add-player-counters", counter: "rad", amount: n }, []);
  settle(game);
};

describe("rad counters", () => {
  it("at its player's precombat main: mill that many, and per nonland card lose 1 life and a counter", () => {
    const { game } = table({ deck: "Grizzly Bears" });
    // The top three: a land among two creatures.
    toLibrary(game, "Grizzly Bears");
    toLibrary(game, "Forest");
    toLibrary(game, "Grizzly Bears");
    giveRad(game, 3);
    expect(rad(game)).toBe(3);
    expect(game.state.players[A].radAbility).toBeDefined();
    nextTurn(game); // Bob's precombat main: not Alice's counters.
    settle(game);
    expect(rad(game)).toBe(3);
    expect(life(game)).toBe(20);
    nextTurn(game); // Alice's.
    const before = graveyard(game).length;
    settle(game);
    // Her draw took the top card; the mill took the next three.
    expect(graveyard(game).length).toBe(before + 3);
    const milledNonland = graveyard(game).slice(-3).filter((id) => game.state.objects[id].cardName !== "Forest").length;
    expect(milledNonland).toBe(2);
    expect(life(game)).toBe(20 - milledNonland);
    expect(rad(game)).toBe(3 - milledNonland);
  });

  it("lands milled don't take counters away", () => {
    const { game } = table(); // a library of Wastes
    giveRad(game, 2);
    nextTurn(game);
    nextTurn(game);
    settle(game);
    expect(life(game)).toBe(20);
    expect(rad(game)).toBe(2);
  });

  it("does nothing once the counters are gone (an intervening if)", () => {
    const { game } = table({ deck: "Grizzly Bears" });
    giveRad(game, 2);
    game.debugApplyEffect(A, { kind: "remove-player-counters", counter: "rad", amount: "all" }, []);
    settle(game);
    expect(rad(game)).toBe(0);
    const before = graveyard(game).length;
    nextTurn(game);
    nextTurn(game);
    settle(game);
    expect(graveyard(game).length).toBe(before);
  });

  it("each player's are their own, and proliferate grows them", () => {
    const { game } = table({ deck: "Grizzly Bears" });
    giveRad(game, 1, B);
    expect(rad(game, B)).toBe(1);
    expect(rad(game, A)).toBe(0);
    game.debugApplyEffect(A, { kind: "proliferate" }, []);
    // Alice's own choice: a default controller proliferates only what's
    // good for her, so she leaves Bob's rad alone — pick it explicitly.
    const awaiting = game.state.awaiting;
    if (awaiting?.kind === "proliferate") {
      game.dispatch({ type: "proliferate", player: A, chosen: [{ kind: "player", player: B }] });
    }
    settle(game);
    expect(rad(game, B)).toBe(2);
  });
});
