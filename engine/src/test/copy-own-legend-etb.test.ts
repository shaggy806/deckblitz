import { describe, expect, it } from "vitest";

import { HeuristicBotController } from "../controller.js";
import { A, B, lands, spawn, table, toHand } from "./harness.js";

/**
 * v1's copy choice (`HeuristicBotController.chooseCopy`), which v2 takes when
 * its search runs out of time: a legend of our own is copied when its enters
 * trigger, fired once more by the copy, beats the best other copy — the
 * legend rule then has us keep one of the two (a live game, 2026-11-26:
 * Etali's free Phantasmal Image copied an Angel of Vitality).
 */
function askedToCopy(own: string) {
  const { game } = table({ players: 4 });
  lands(game, "Island", 4);
  const legend = spawn(game, own);
  const angel = spawn(game, "Angel of Vitality", B);
  game.dispatch({ type: "cast-spell", player: A, card: toHand(game, "Clone"), targets: [] });
  game.advanceUntil((s) => s.awaiting !== null && s.awaiting.player === A);
  const awaiting = game.state.awaiting;
  if (awaiting?.kind !== "choose-copy") throw new Error(`never asked what to copy (${awaiting?.kind ?? "nothing"})`);
  const v1 = new HeuristicBotController(A, game.registry);
  return { choice: v1.chooseCopy(game.controllerView(A), awaiting.source, awaiting.options), legend, angel };
}

describe("copying a legend of our own for its enters trigger", () => {
  it("Etali, Primal Conqueror: copied, for a free spell from each library", () => {
    const { choice, legend } = askedToCopy("Etali, Primal Conqueror");
    expect(choice).toBe(legend);
  });

  it("a legend with no enters trigger stays uncopied: the Angel instead", () => {
    const { choice, angel } = askedToCopy("Isamaru, Hound of Konda");
    expect(choice).toBe(angel);
  });
});
