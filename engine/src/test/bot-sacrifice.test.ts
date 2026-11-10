/**
 * Sacrificing for cards (Deadly Dispute, Village Rites). The evaluation
 * prices a creature at about two and a half cards whatever it does, so v2
 * held these with a vanilla 2/2 to pay; they're card flow now when what they
 * pay with is spare (`HeuristicBotController.isSpareFodder`), cast at a
 * cantrip's moment — an instant at the end of the turn before ours.
 */

import { describe, expect, it } from "vitest";

import { EvalBotController } from "../bot/eval-bot.js";
import { createDefaultRegistry } from "../cards.js";
import { Game } from "../game.js";
import { asPlayerId } from "../primitives.js";

const registry = createDefaultRegistry();
const A = asPlayerId("alice");
const B = asPlayerId("bob");

/** Bob's end step, Alice holding priority: the end of the turn before hers. */
function endOfBobsTurn(fodder: string, spell: string, swamps: number): Game {
  const game = Game.create({
    seed: 3,
    registry,
    decks: [A, B].map((player) => ({ player, cards: Array<string>(40).fill("Wastes") })),
  });
  game.advanceUntil(
    (s) => s.turn.number >= 4 && s.turnOrder[s.turn.activePlayerIndex] === B && s.turn.step === "end" && s.priority.holder === A,
  );
  game.state.zones.perPlayer[A].hand = [];
  for (let i = 0; i < swamps; i += 1) game.debugSpawn("Swamp", A, "battlefield");
  game.debugSpawn(fodder, A, "battlefield", { summoningSick: false });
  game.debugSpawn(spell, A, "hand");
  return game;
}

const choice = (game: Game): string => {
  const action = new EvalBotController(A, registry).act(game.controllerView(A));
  if (action.type !== "cast-spell") return action.type;
  const sacrificed = action.sacrifice === undefined ? "" : ` sacrificing ${game.state.objects[action.sacrifice]?.cardName}`;
  return `${game.state.objects[action.card]?.cardName}${sacrificed}`;
};

describe("v2 sacrifices a spare creature for cards", () => {
  it("casts Deadly Dispute on a Grizzly Bears", () => {
    expect(choice(endOfBobsTurn("Grizzly Bears", "Deadly Dispute", 3))).toBe("Deadly Dispute sacrificing Grizzly Bears");
  });

  it("casts Village Rites on a Grizzly Bears", () => {
    expect(choice(endOfBobsTurn("Grizzly Bears", "Village Rites", 2))).toBe("Village Rites sacrificing Grizzly Bears");
  });

  it("keeps Blood Artist: an ongoing ability isn't spare", () => {
    expect(choice(endOfBobsTurn("Blood Artist", "Village Rites", 2))).toBe("pass-priority");
  });

  it("keeps a Craw Wurm: a big body isn't spare", () => {
    expect(choice(endOfBobsTurn("Craw Wurm", "Deadly Dispute", 3))).toBe("pass-priority");
  });
});
