/**
 * Which creature a bot makes its Ring-bearer (rule 701.54): one that can
 * attack and deal damage, an evasive one first, then the most damage — not
 * the first creature on the battlefield, which is what both bots took
 * (`HeuristicBotController.bestRingBearer`; v2 inherits it, its search
 * offering no other candidate for a choice of exactly one).
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

/** Alice's creatures `names`, in that battlefield order, and the Ring
 * tempting her: the bot's answer, by card name. */
function bearerAmong(names: readonly string[]): string {
  const forests = { cards: Array<string>(40).fill("Forest") };
  const game = Game.create({ seed: 3, registry, decks: [{ player: A, ...forests }, { player: B, ...forests }] });
  game.advanceUntil((s) => s.turnOrder[s.turn.activePlayerIndex] === A && s.priority.holder === A && s.turn.step === "precombat-main");
  for (const name of names) game.debugSpawn(name, A, "battlefield");
  game.debugSpawn("Island", A, "battlefield");
  const escape = game.debugSpawn("Birthday Escape", A, "hand");
  game.dispatch({ type: "cast-spell", player: A, card: escape });
  game.advanceUntil((s) => s.awaiting?.kind === "choose-permanents" || s.result.over);
  const awaiting = game.state.awaiting;
  if (awaiting?.kind !== "choose-permanents") throw new Error("the Ring never asked for a Ring-bearer");
  const bot = new HeuristicBotController(A, registry);
  const chosen: readonly ObjectId[] = bot.choosePermanents(game.controllerView(A), awaiting.eligible, awaiting.min, awaiting.max);
  expect(chosen).toHaveLength(1);
  return game.state.objects[chosen[0]].cardName;
}

describe("a bot's Ring-bearer", () => {
  it("is the evasive attacker, not the first creature or the biggest", () => {
    expect(bearerAmong(["Grizzly Bears", "Wall of Omens", "Craw Wurm", "Wind Drake"])).toBe("Wind Drake");
  });

  it("is the creature that hits hardest, with nothing evasive", () => {
    expect(bearerAmong(["Grizzly Bears", "Wall of Omens", "Craw Wurm"])).toBe("Craw Wurm");
  });

  it("is never a creature that can't deal damage, flying or not", () => {
    // Birds of Paradise flies, but a 0/1 never connects for the Ring.
    expect(bearerAmong(["Birds of Paradise", "Grizzly Bears"])).toBe("Grizzly Bears");
    // A wall can't attack at all.
    expect(bearerAmong(["Wall of Omens", "Grizzly Bears"])).toBe("Grizzly Bears");
  });

  it("is still somebody when nobody can attack", () => {
    expect(bearerAmong(["Wall of Omens"])).toBe("Wall of Omens");
  });
});
