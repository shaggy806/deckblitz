/**
 * A `for-each-unless` over what this resolution did "this way" — Stench of
 * Evil's "destroy all Plains. For each land destroyed this way, ~ deals 1
 * damage to that land's controller unless they pay {2}": one question per
 * land destroyed, asked of its controller as it left, in turn order (rule
 * 101.4); a land that wasn't destroyed (indestructible) asks nothing.
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { PlayerId } from "../primitives.js";
import { A, B, cast, lands, life, settle, spawn, table, toHand, zone } from "./harness.js";

const question = (game: Game) => {
  game.advanceUntil((s) => s.awaiting !== null);
  return game.state.awaiting;
};

const answer = (game: Game, player: PlayerId, pay: boolean): void => {
  const awaiting = game.state.awaiting;
  if (awaiting?.kind !== "choose-modes") throw new Error(`expected a question, got ${awaiting?.kind}`);
  expect(awaiting.player).toBe(player);
  game.dispatch({ type: "choose-modes", player: awaiting.player, modes: pay ? [0] : [] });
};

describe("for-each-unless over a this-way set (Stench of Evil)", () => {
  it("each Plains destroyed is its controller's own question; paying for one, not the other", () => {
    const { game } = table();
    lands(game, "Swamp", 6);
    const myPlains = lands(game, "Plains", 1);
    const theirPlains = lands(game, "Plains", 2, B);
    lands(game, "Island", 4, B);
    cast(game, toHand(game, "Stench of Evil"), { settle: false });
    // The active player first (rule 101.4).
    question(game);
    answer(game, A, false);
    question(game);
    answer(game, B, true);
    question(game);
    answer(game, B, false);
    settle(game);
    for (const id of [...myPlains, ...theirPlains]) expect(zone(game, id)).toBe("graveyard");
    expect(life(game, A)).toBe(19);
    expect(life(game, B)).toBe(19);
  });

  it("a player who can't pay {2} isn't asked, and takes the damage", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    lands(game, "Plains", 3, B);
    cast(game, toHand(game, "Stench of Evil"), {});
    expect(life(game, B)).toBe(17);
    expect(life(game, A)).toBe(20);
  });

  it("a Plains that wasn't destroyed asks nothing", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    const mine = lands(game, "Plains", 1);
    const theirs = lands(game, "Plains", 2, B);
    // Avacyn makes B's permanents indestructible.
    spawn(game, "Avacyn, Angel of Hope", B);
    cast(game, toHand(game, "Stench of Evil"), {});
    for (const id of theirs) expect(zone(game, id)).toBe("battlefield");
    expect(zone(game, mine[0])).toBe("graveyard");
    expect(life(game, B)).toBe(20);
    expect(life(game, A)).toBe(19);
  });
});
