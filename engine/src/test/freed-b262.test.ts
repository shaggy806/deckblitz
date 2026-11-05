/**
 * Batch 262, the lead's cards: Memory Vessel (an agent blocked it on the
 * impulse window's owner; the window is the activator's).
 */
import { describe, expect, it } from "vitest";

import { createDefaultRegistry } from "../cards/registry.js";
import { ScriptedController } from "../controller.js";
import { Game } from "../game.js";
import { asPlayerId } from "../primitives.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { printedCardName } from "../state.js";
import type { GameState } from "../state.js";
import { cast, counters, enter, life, toHand, keywords, lands, pt, ref, spawn, table, toGraveyard } from "./harness.js";

const A = asPlayerId("alice");
const B = asPlayerId("bob");
const registry = createDefaultRegistry();

const quiet = (s: GameState): boolean =>
  s.zones.shared.stack.length === 0 && s.awaiting === null && s.pendingTriggers.length === 0;
const offers = (game: Game, player: PlayerId, card: ObjectId): boolean =>
  game.legalActions(player).some(
    (action) => (action.kind === "cast-spell" || action.kind === "play-land") && action.card === card,
  );

describe("Memory Vessel", () => {
  it("each player plays their own exiled cards until your next turn, and nothing from hand", () => {
    const controllers = { [A]: new ScriptedController(A), [B]: new ScriptedController(B) };
    const game = Game.create({
      seed: 1,
      shuffle: false,
      registry,
      rules: { skipFirstDraw: false, maxLandsPerTurn: 99, maxHandSize: 99 },
      controllers,
      decks: [A, B].map((player) => ({ player, cards: Array<string>(40).fill("Island") })),
    });
    game.advanceUntil((s) => s.turn.number === 1 && s.turn.step === "precombat-main");
    const vessel = game.debugSpawn("Memory Vessel", A, "battlefield", { summoningSick: false });
    const aTop = game.debugSpawn("Forest", A, "library");
    const bTop = game.debugSpawn("Forest", B, "library");
    const aHand = game.debugSpawn("Mountain", A, "hand");
    game.dispatch({ type: "activate-ability", player: A, source: vessel, abilityIndex: 0, targets: [] });
    game.advanceUntil(quiet);
    expect(game.state.objects[vessel].zone).toBe("exile");
    expect(game.state.objects[aTop].zone).toBe("exile");
    expect(game.state.objects[bTop].zone).toBe("exile");
    // Alice may play her own exiled land, not bob's, and not the one in her hand.
    expect(offers(game, A, aTop)).toBe(true);
    expect(offers(game, A, bTop)).toBe(false);
    expect(offers(game, A, aHand)).toBe(false);
    // Bob's turn: his own exiled card, and still nothing from his hand.
    game.advanceUntil((s) => s.turn.number === 2 && s.turn.step === "precombat-main" && s.priority.holder === B && quiet(s));
    const bHand = game.debugSpawn("Forest", B, "hand");
    expect(offers(game, B, bTop)).toBe(true);
    expect(offers(game, B, bHand)).toBe(false);
    // Alice's next turn: both lapse.
    game.advanceUntil((s) => s.turn.number === 3 && s.turn.step === "precombat-main" && s.priority.holder === A && quiet(s));
    expect(offers(game, A, aTop)).toBe(false);
    expect(offers(game, A, aHand)).toBe(true);
  });
});

describe("Katilda, Dawnhart Martyr // Katilda's Rising Dawn", () => {
  it("counts the Spirits and enchantments you control, itself among them", () => {
    const { game } = table();
    const katilda = spawn(game, "Katilda, Dawnhart Martyr");
    expect(pt(game, katilda)).toEqual({ power: 1, toughness: 1 });
    enter(game, "Glorious Anthem");
    spawn(game, "Grizzly Bears");
    // Itself and the Anthem (2/2), and the Anthem's +1/+1.
    expect(pt(game, katilda)).toEqual({ power: 3, toughness: 3 });
  });

  it("disturbed onto a creature: flying, lifelink, and +X/+X counting the Aura", () => {
    const { game } = table();
    lands(game, "Plains", 5);
    const bears = spawn(game, "Grizzly Bears");
    const katilda = toGraveyard(game, "Katilda, Dawnhart Martyr");
    cast(game, katilda, { targets: [ref(bears)], via: "disturb", face: 1 });
    expect(keywords(game, bears).has("flying")).toBe(true);
    expect(keywords(game, bears).has("lifelink")).toBe(true);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Ral, Monsoon Mage // Ral, Leyline Prodigy", () => {
  it("an instant on your turn flips: lost, 1 damage; won, Ral returns transformed with a loyalty counter per instant and sorcery cast", () => {
    const outcomes = new Set<string>();
    for (const seed of [1, 2, 3, 4, 5, 6, 7, 8]) {
      const { game, a } = table({ seed });
      a.chooseModesFn = () => [0]; // "you may exile Ral" — yes
      lands(game, "Island", 1);
      spawn(game, "Ral, Monsoon Mage");
      cast(game, toHand(game, "Opt"));
      const ral = game.battlefield.find((id) => printedCardName(game.state.objects[id]).startsWith("Ral"));
      expect(ral).toBeDefined();
      const name = printedCardName(game.state.objects[ral!]);
      if (name === "Ral, Leyline Prodigy") {
        expect(counters(game, ral!, "loyalty")).toBe(3);
        expect(life(game)).toBe(20);
      } else {
        expect(name).toBe("Ral, Monsoon Mage");
        expect(life(game)).toBe(19);
      }
      outcomes.add(name);
    }
    expect(outcomes.size).toBe(2);
  });
});
