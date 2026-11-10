/**
 * Bots and Equipment. v2's half is pinned by gate scenarios ("moves Lightning
 * Greaves to the creature just cast", "equips Blade of Selves at a
 * four-player table"); this pins v1's: it equips, moves Equipment only to a
 * clearly better creature, and never shuffles it back.
 */

import { describe, expect, it } from "vitest";

import { createDefaultRegistry } from "../cards.js";
import { ActivationCap, MAX_FREE_ACTIVATIONS_PER_TURN, isFreeCost } from "../bot/activation-cap.js";
import { EvalBotController } from "../bot/eval-bot.js";
import { HeuristicBotController } from "../controller.js";
import { Game } from "../game.js";
import { asPlayerId } from "../primitives.js";
import type { ObjectId } from "../primitives.js";

const registry = createDefaultRegistry();
const A = asPlayerId("alice");
const B = asPlayerId("bob");

function main(): Game {
  const game = Game.create({
    seed: 3,
    registry,
    decks: [A, B].map((player) => ({ player, cards: Array<string>(40).fill("Forest") })),
  });
  game.advanceUntil((s) => s.priority.holder === A && s.turn.step === "precombat-main");
  game.state.zones.perPlayer[A].hand = [];
  return game;
}

const creature = (game: Game, name: string, sick = false): ObjectId =>
  game.debugSpawn(name, A, "battlefield", { summoningSick: sick });

/** v1's move, as "equip <host>" or the action type. */
function move(game: Game): string {
  const action = new HeuristicBotController(A, registry).act(game.controllerView(A));
  if (action.type !== "activate-ability") return action.type;
  const target = action.targets?.[0];
  return target?.kind === "object" ? `equip ${game.state.objects[target.object].cardName}` : "equip ?";
}

describe("v2's activation cap", () => {
  const wurmNeedsGreaves = (): { game: Game; greaves: ObjectId } => {
    const game = main();
    const bears = creature(game, "Grizzly Bears");
    const greaves = creature(game, "Lightning Greaves");
    game.state.objects[greaves].attachedTo = bears;
    creature(game, "Craw Wurm", true);
    return { game, greaves };
  };
  const movesGreaves = (game: Game, greaves: ObjectId, bot: EvalBotController): boolean => {
    const action = bot.act(game.controllerView(A));
    return action.type === "activate-ability" && action.source === greaves;
  };

  it("moves free Equipment until the cap, then stops for the turn", () => {
    const { game, greaves } = wurmNeedsGreaves();
    const turn = game.state.turn.number;
    const fresh = new EvalBotController(A, registry);
    expect(movesGreaves(game, greaves, fresh)).toBe(true);

    const spent = new EvalBotController(A, registry);
    for (let i = 0; i < MAX_FREE_ACTIVATIONS_PER_TURN; i += 1) spent.activationCap.note(turn, greaves, 0);
    expect(movesGreaves(game, greaves, spent)).toBe(false);

    // A new turn clears it.
    expect(spent.activationCap.allows(turn + 1, greaves, 0, true)).toBe(true);
  });

  it("counts a cost as free only when nothing is paid", () => {
    expect(isFreeCost({ mana: null, tap: false })).toBe(true);
    expect(isFreeCost({ mana: "{0}", tap: false })).toBe(true);
    expect(isFreeCost({ mana: "{1}", tap: false })).toBe(false);
    expect(isFreeCost({ mana: null, tap: true })).toBe(false);
    expect(isFreeCost({ mana: null, tap: false, sacrifice: "self" })).toBe(false);
  });

  it("lets a paid ability run far past the free limit", () => {
    const cap = new ActivationCap();
    const source = "obj-1" as ObjectId;
    for (let i = 0; i < MAX_FREE_ACTIVATIONS_PER_TURN; i += 1) cap.note(5, source, 0);
    expect(cap.allows(5, source, 0, false)).toBe(true);
    expect(cap.allows(5, source, 0, true)).toBe(false);
  });
});

describe("v1 and Equipment", () => {
  it("equips an unattached Equipment", () => {
    const game = main();
    creature(game, "Grizzly Bears");
    creature(game, "Lightning Greaves");
    expect(move(game)).toBe("equip Grizzly Bears");
  });

  it("moves Lightning Greaves to a better creature, once", () => {
    const game = main();
    const bears = creature(game, "Grizzly Bears");
    const greaves = creature(game, "Lightning Greaves");
    game.state.objects[greaves].attachedTo = bears;
    creature(game, "Craw Wurm", true);
    expect(move(game)).toBe("equip Craw Wurm");

    const action = new HeuristicBotController(A, registry).act(game.controllerView(A));
    game.dispatch(action);
    game.advanceUntil((s) => s.priority.holder === A && s.zones.shared.stack.length === 0);
    expect(game.state.objects[greaves].attachedTo).not.toBe(bears);
    // On the Wurm now: the Bears rank below it, so it stays.
    expect(move(game)).toBe("pass-priority");
  });

  it("leaves Equipment on its host when the alternative is about as good", () => {
    const game = main();
    const bears = creature(game, "Grizzly Bears");
    const greaves = creature(game, "Lightning Greaves");
    game.state.objects[greaves].attachedTo = bears;
    creature(game, "Grizzly Bears");
    expect(move(game)).toBe("pass-priority");
  });
});
