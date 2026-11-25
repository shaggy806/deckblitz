/**
 * Which of its own permanents v1 gives up when one player alone chooses one
 * for what follows (Imperial Edict's "target opponent chooses a creature they
 * control. Destroy it."): the least valuable, ranked as a target of the
 * follow-up (`loneChoiceFollowUp` in `controller.ts`). It took the first one
 * listed (B339: a Craterhoof Behemoth over Llanowar Elves). v2 searches the
 * question and was right already; v1 is what a rollout's seats play.
 */

import { describe, expect, it } from "vitest";
import { HeuristicBotController } from "../controller.js";
import { Game } from "../game.js";
import { createDefaultRegistry } from "../cards.js";
import { asPlayerId } from "../primitives.js";
import type { ObjectId } from "../primitives.js";

const registry = createDefaultRegistry();
const A = asPlayerId("alice");
const B = asPlayerId("bob");

/** Alice's creatures `names`, in that battlefield order, and Bob's Imperial
 * Edict at her: v1's answer, by card name. */
function edictTakes(names: readonly string[]): string {
  const forests = { cards: Array<string>(40).fill("Forest") };
  const game = Game.create({ seed: 3, registry, decks: [{ player: A, ...forests }, { player: B, ...forests }] });
  game.advanceUntil((s) => s.turnOrder[s.turn.activePlayerIndex] === B && s.priority.holder === B && s.turn.step === "precombat-main");
  for (const name of names) game.debugSpawn(name, A, "battlefield");
  for (let i = 0; i < 2; i += 1) game.debugSpawn("Swamp", B, "battlefield");
  const edict = game.debugSpawn("Imperial Edict", B, "hand");
  game.dispatch({ type: "cast-spell", player: B, card: edict, targets: [{ kind: "player", player: A }] });
  game.advanceUntil((s) => s.awaiting?.kind === "choose-permanents" || s.result.over);
  const awaiting = game.state.awaiting;
  if (awaiting?.kind !== "choose-permanents" || awaiting.player !== A) throw new Error("alice was never asked to choose");
  const bot = new HeuristicBotController(A, registry);
  const chosen: readonly ObjectId[] = bot.choosePermanents(game.controllerView(A), awaiting.eligible, awaiting.min, awaiting.max);
  expect(chosen).toHaveLength(1);
  return game.state.objects[chosen[0]].cardName;
}

describe("v1's own permanent chosen for an edict", () => {
  it("is the least valuable, whatever comes first", () => {
    expect(edictTakes(["Craterhoof Behemoth", "Llanowar Elves"])).toBe("Llanowar Elves");
    expect(edictTakes(["Llanowar Elves", "Craterhoof Behemoth"])).toBe("Llanowar Elves");
  });
});
