/**
 * An X paid in life (Toxic Deluge): v2 tries X across a ladder of values
 * (`bot/candidates.ts`' `lifeXLadder`) rather than only at the maximum, which
 * is the whole life total; at the maximum alone it never cast the card.
 */

import { describe, expect, it } from "vitest";

import { EvalBotController } from "../bot/eval-bot.js";
import { createDefaultRegistry } from "../cards.js";
import { Game } from "../game.js";
import { asPlayerId } from "../primitives.js";

const registry = createDefaultRegistry();
const A = asPlayerId("alice");
const B = asPlayerId("bob");

describe("v2 and an X paid in life", () => {
  it("casts Toxic Deluge for just enough X to sweep the opposing board", () => {
    const game = Game.create({
      seed: 3,
      registry,
      decks: [A, B].map((player) => ({ player, cards: Array<string>(40).fill("Swamp") })),
    });
    game.advanceUntil((s) => s.priority.holder === A && s.turn.step === "precombat-main");
    game.state.zones.perPlayer[A].hand = [];
    for (let i = 0; i < 3; i += 1) game.debugSpawn("Swamp", A, "battlefield");
    game.debugSpawn("Toxic Deluge", A, "hand");
    // Toughness 4, 4 and 2: X = 4 kills them all.
    for (const name of ["Craw Wurm", "Serra Angel", "Grizzly Bears"]) {
      game.debugSpawn(name, B, "battlefield", { summoningSick: false });
    }
    const action = new EvalBotController(A, registry).act(game.controllerView(A));
    expect(action.type).toBe("cast-spell");
    expect(action.type === "cast-spell" ? action.xValue : null).toBe(4);
  });
});
