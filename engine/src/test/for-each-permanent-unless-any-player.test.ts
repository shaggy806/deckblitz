/**
 * "For each land, destroy that land unless any player pays 1 life"
 * (Cleansing): `for-each-unless` over permanents with `asks: { anyOf:
 * "each-player" }` — for each land, every player still in the game is asked
 * in turn order from the active player (rule 101.4), the next only once the
 * one before declines, and the lands nobody paid for are destroyed together
 * once the last question is answered.
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import { A, B, C, cast, lands, life, quiet, settle, spawn, table, toHand, zone } from "./harness.js";

const question = (game: Game) => {
  game.advanceUntil((s) => s.awaiting !== null);
  return game.state.awaiting;
};

/** Answer the `choose-modes` waiting — pay (mode 0) or decline — returning who answered. */
const answer = (game: Game, pay: boolean) => {
  const awaiting = game.state.awaiting;
  if (awaiting?.kind !== "choose-modes") throw new Error(`expected a question, got ${awaiting?.kind}`);
  game.dispatch({ type: "choose-modes", player: awaiting.player, modes: pay ? [0] : [] });
  return awaiting.player;
};

describe("for each permanent, unless any player pays", () => {
  it("Cleansing: each land asks every player in turn order; unpaid lands go together", () => {
    const { game } = table();
    const plains = lands(game, "Plains", 3);
    const forest = spawn(game, "Forest", B);
    cast(game, toHand(game, "Cleansing"), { settle: false });
    // Four lands, each asked of A then B: decline them all but the Forest,
    // which B pays for after A declines.
    const askedFor: number[] = [];
    let destroyedEarly = false;
    for (let land = 0; land < 4; land++) {
      question(game);
      const about = game.legalActions(game.state.awaiting!.player).find((la) => la.kind === "choose-modes");
      const isForest = about?.kind === "choose-modes" && about.aboutObject === forest;
      expect(answer(game, false)).toBe(A);
      question(game);
      askedFor.push(land);
      // Before the last answer, nothing has been destroyed yet.
      if (zone(game, plains[0]!) !== "battlefield") destroyedEarly = true;
      expect(answer(game, isForest)).toBe(B);
    }
    settle(game);
    expect(askedFor).toHaveLength(4);
    expect(destroyedEarly).toBe(false);
    for (const p of plains) expect(zone(game, p)).toBe("graveyard");
    expect(zone(game, forest)).toBe("battlefield");
    expect(life(game, B)).toBe(19);
    expect(life(game, A)).toBe(20);
  });

  it("Cleansing: once one player pays, nobody after them is asked about that land", () => {
    const { game } = table({ players: 3 });
    lands(game, "Plains", 3);
    const island = spawn(game, "Island", C);
    cast(game, toHand(game, "Cleansing"), { settle: false });
    const asked: string[] = [];
    for (;;) {
      game.advanceUntil((s) => s.awaiting !== null || quiet(s));
      if (game.state.awaiting === null) break;
      const offer = game.legalActions(game.state.awaiting.player).find((la) => la.kind === "choose-modes");
      const forIsland = offer?.kind === "choose-modes" && offer.aboutObject === island;
      // A pays for the Island at once, and declines everything else.
      const who = answer(game, forIsland && game.state.awaiting.player === A);
      if (forIsland) asked.push(String(who));
    }
    settle(game);
    expect(asked).toEqual([String(A)]);
    expect(zone(game, island)).toBe("battlefield");
    expect(life(game, A)).toBe(19);
  });

});
