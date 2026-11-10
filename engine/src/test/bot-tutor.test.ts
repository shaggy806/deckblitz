/**
 * What the bots take from a library search. v1 used to take library order
 * for anything but lands, so a tutor found whatever card came next, and v2
 * kept that answer (its rollouts can't tell one card in hand from another).
 */

import { describe, expect, it } from "vitest";

import { createDefaultRegistry } from "../cards.js";
import { HeuristicBotController } from "../controller.js";
import { Game } from "../game.js";
import { asPlayerId } from "../primitives.js";

const registry = createDefaultRegistry();
const A = asPlayerId("alice");
const B = asPlayerId("bob");

function boardWithLands(lands: number): Game {
  const game = Game.create({
    seed: 3,
    registry,
    decks: [A, B].map((player) => ({ player, cards: Array<string>(40).fill("Forest") })),
  });
  game.advanceUntil((s) => s.priority.holder === A && s.turn.step === "precombat-main");
  for (let i = 0; i < lands; i += 1) game.debugSpawn("Forest", A, "battlefield");
  return game;
}

describe("v1's pick from a library search", () => {
  it("takes the dear spell the board can cast over the one that comes first", () => {
    const game = boardWithLands(5);
    const bears = game.debugSpawn("Grizzly Bears", A, "library");
    const wurm = game.debugSpawn("Craw Wurm", A, "library");
    const pick = new HeuristicBotController(A, registry).chooseFromZone(game.controllerView(A), [bears, wurm], 1, 1);
    expect(pick).toEqual([wurm]);
  });

  it("leaves a spell still out of reach for one it can cast soon", () => {
    const game = boardWithLands(2);
    const wurm = game.debugSpawn("Craw Wurm", A, "library");
    const bears = game.debugSpawn("Grizzly Bears", A, "library");
    const pick = new HeuristicBotController(A, registry).chooseFromZone(game.controllerView(A), [wurm, bears], 1, 1);
    expect(pick).toEqual([bears]);
  });
});
