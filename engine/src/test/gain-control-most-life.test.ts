/**
 * "At the beginning of your upkeep, if a player has more life than each other
 * player, the player with the most life gains control of this creature"
 * (Wild Dogs, Ghazbán Ogre): Sokenzan Renegade's shape over life totals.
 */

import { describe, expect, it } from "vitest";

import { A, B, C, controller, nextTurn, spawn, table } from "./harness.js";

describe("the player with the most life gains control", () => {
  it("Wild Dogs goes to the one player with the most life", () => {
    const { game } = table({ players: 3 });
    const dogs = spawn(game, "Wild Dogs", B);
    game.state.players[C].life = 30;
    game.state.players[A].life = 20;
    game.state.players[B].life = 10;
    // Bob's upkeep: alice's turn ends, his begins.
    nextTurn(game, "draw");
    expect(controller(game, dogs)).toBe(C);
  });

  it("Ghazbán Ogre stays put when the most is tied", () => {
    const { game } = table({ players: 3 });
    const ogre = spawn(game, "Ghazbán Ogre", B);
    game.state.players[C].life = 30;
    game.state.players[A].life = 30;
    game.state.players[B].life = 10;
    nextTurn(game, "draw");
    expect(controller(game, ogre)).toBe(B);
  });

  it("its controller with the most life keeps it", () => {
    const { game } = table();
    const dogs = spawn(game, "Wild Dogs", B);
    game.state.players[A].life = 15;
    nextTurn(game, "draw");
    expect(controller(game, dogs)).toBe(B);
  });
});
