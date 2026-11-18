/**
 * A card another player's effect has a bot choose where it lies (a
 * look-and-choose with `destination: "stay"`): Dawnbreak Reclaimer's "that
 * player chooses a creature card in your graveyard", Plargg and Nassari's "an
 * opponent chooses a nonland card exiled this way".
 *
 * v1 answered both as a search of the other player's zones is answered, with
 * the card they'd miss most, and so handed the Reclaimer's controller their
 * best creature (B334's live check). What's chosen is what they get, unless
 * the effect is for the cards not chosen (`HeuristicBotController.chooseFromZone`).
 * v2 searches the pick, and keeps v1's where its rollouts tell no two apart.
 */

import { describe, expect, it } from "vitest";

import type { Action } from "../actions.js";
import { EvalBotController } from "../bot/eval-bot.js";
import { HeuristicBotController } from "../controller.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, lands, registryOf, spawn, table, toGraveyard, toLibrary, toStep } from "./harness.js";

/** Run to the card alice is asked to choose where it lies. */
function toAlicesPick(game: Game): void {
  game.advanceUntil((s) => (s.awaiting?.kind === "choose-from-zone" && s.awaiting.player === A) || s.result.over);
  const awaiting = game.state.awaiting;
  if (awaiting?.kind !== "choose-from-zone" || awaiting.destination !== "stay") throw new Error("alice was never asked");
}

const chosen = (action: Action): readonly ObjectId[] => (action.type === "choose-from-zone" ? action.chosen : []);

describe("a card chosen where it lies for another player's effect", () => {
  /** Bob's Dawnbreak Reclaimer at his end step, a creature card in alice's
   * graveyard for him to choose, and `cards` in his for her to choose from. */
  function reclaimer(cards: readonly string[], bobsLands: number): { game: Game; ids: ObjectId[] } {
    const { game } = table();
    lands(game, "Plains", bobsLands, B);
    spawn(game, "Dawnbreak Reclaimer", B);
    toGraveyard(game, "Llanowar Elves", A);
    const ids = cards.map((name) => toGraveyard(game, name, B));
    toStep(game, "end", B);
    toAlicesPick(game);
    return { game, ids };
  }

  it("v1 hands the Reclaimer's controller the creature card worth least", () => {
    const { game, ids } = reclaimer(["Trained Armodon", "Grizzly Bears", "Colossal Dreadmaw"], 7);
    const answer = new HeuristicBotController(A, registryOf(game)).act(game.controllerView(A));
    expect(chosen(answer)).toEqual([ids[1]]);
  });

  it("v1 doesn't hand back a creature for being beyond its owner's lands", () => {
    // As a card in hand a Dreadmaw on two lands is the least useful; put onto
    // the battlefield it is the most.
    const { game, ids } = reclaimer(["Colossal Dreadmaw", "Trained Armodon"], 2);
    const answer = new HeuristicBotController(A, registryOf(game)).act(game.controllerView(A));
    expect(chosen(answer)).toEqual([ids[1]]);
  });

  it("v2 hands back the least too", () => {
    const { game, ids } = reclaimer(["Trained Armodon", "Grizzly Bears", "Colossal Dreadmaw"], 7);
    const answer = new EvalBotController(A, registryOf(game)).act(game.controllerView(A));
    expect(chosen(answer)).toEqual([ids[1]]);
  });

  it("v1 withholds the dearest card when the effect is for the ones not chosen", () => {
    // Plargg and Nassari: each player exiles down to a nonland card, an
    // opponent chooses one, and its controller casts the others free.
    const { game } = table();
    spawn(game, "Plargg and Nassari", B);
    const bears = toLibrary(game, "Grizzly Bears", A);
    const dreadmaw = toLibrary(game, "Colossal Dreadmaw", B);
    toStep(game, "upkeep", B);
    toAlicesPick(game);
    const awaiting = game.state.awaiting;
    expect(awaiting?.kind === "choose-from-zone" ? [...awaiting.eligible].sort() : []).toEqual([bears, dreadmaw].sort());
    const answer = new HeuristicBotController(A, registryOf(game)).act(game.controllerView(A));
    expect(chosen(answer)).toEqual([dreadmaw]);
  });
});
