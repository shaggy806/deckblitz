/**
 * A mana source that lends the colours of the cards exiled with it (Chrome
 * Mox; `bot/linked-mana.ts`): the evaluation counts its mana only with a
 * coloured card under it, and v1 gives it the hand's least useful coloured
 * card. A report from a live game, 2026-11-23: a bot cast a Chrome Mox and
 * imprinted nothing, an empty Mox having counted as the same mana rock as
 * an imprinted one (`docs/bot-misplays.md`).
 */
import { describe, expect, it } from "vitest";
import { playerFeatures } from "../bot/features.js";
import { createDefaultRegistry } from "../cards.js";
import { invalidateComputedCache } from "../characteristics.js";
import { HeuristicBotController } from "../controller.js";
import { Game } from "../game.js";
import { asPlayerId } from "../primitives.js";
import type { ObjectId } from "../primitives.js";

const [A, B] = ["alice", "bob"].map(asPlayerId);
const registry = createDefaultRegistry();

/** Alice's main phase, a Chrome Mox entering with `hand` in her hand, its
 * imprint asked. */
function imprinting(hand: readonly string[]): { game: Game; mox: ObjectId; cards: ObjectId[] } {
  const game = Game.create({
    seed: 1,
    shuffle: false,
    registry,
    startingPlayer: A,
    decks: [A, B].map((player) => ({ player, cards: Array(40).fill("Forest") })),
  });
  game.advanceUntil((s) => s.turn.step === "precombat-main" && s.priority.holder === A);
  game.state.turn.number = 20;
  game.state.zones.perPlayer[A].hand = [];
  const cards = hand.map((name) => game.debugSpawn(name, A, "hand"));
  const mox = game.debugSpawn("Chrome Mox", A, "battlefield", { announceEntry: true, summoningSick: false });
  game.advanceUntil((s) => s.awaiting?.kind === "choose-from-zone" || s.result.over);
  expect(game.state.awaiting?.kind).toBe("choose-from-zone");
  return { game, mox, cards };
}

const settle = (game: Game): void =>
  game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null && s.pendingTriggers.length === 0);

const nonlandMana = (game: Game): number => playerFeatures(game.state, registry, A, false, 7).nonlandMana;

describe("Chrome Mox in the evaluation", () => {
  it("makes no mana with nothing imprinted", () => {
    const { game } = imprinting(["Grizzly Bears"]);
    game.dispatch({ type: "choose-from-zone", player: A, chosen: [] });
    settle(game);
    expect(nonlandMana(game)).toBe(0);
  });

  it("makes a mana with a coloured card imprinted", () => {
    const { game, cards } = imprinting(["Grizzly Bears"]);
    game.dispatch({ type: "choose-from-zone", player: A, chosen: [cards[0]!] });
    settle(game);
    expect(nonlandMana(game)).toBe(1);
  });

  it("makes no mana with a colourless card imprinted", () => {
    const { game, cards } = imprinting(["Kozilek, the Great Distortion"]);
    game.dispatch({ type: "choose-from-zone", player: A, chosen: [cards[0]!] });
    settle(game);
    expect(nonlandMana(game)).toBe(0);
  });

  it("makes none once it has left and come back, its old card no longer linked", () => {
    const { game, mox, cards } = imprinting(["Grizzly Bears"]);
    game.dispatch({ type: "choose-from-zone", player: A, chosen: [cards[0]!] });
    settle(game);
    game.state.objects[mox]!.zoneChangeCount = (game.state.objects[mox]!.zoneChangeCount ?? 0) + 1;
    invalidateComputedCache();
    expect(nonlandMana(game)).toBe(0);
  });
});

describe("Chrome Mox's imprint, as v1 answers it", () => {
  const answer = (game: Game): readonly ObjectId[] => {
    const action = new HeuristicBotController(A, registry).act(game.controllerView(A));
    return action.type === "choose-from-zone" ? action.chosen : [];
  };

  it("imprints one coloured card, never a colourless one", () => {
    const { game, cards } = imprinting(["Kozilek, the Great Distortion", "Grizzly Bears", "Llanowar Elves"]);
    const chosen = answer(game);
    expect(chosen).toHaveLength(1);
    expect(chosen[0]).not.toBe(cards[0]);
  });

  it("imprints nothing when only a colourless card is on offer", () => {
    const { game } = imprinting(["Kozilek, the Great Distortion"]);
    expect(answer(game)).toEqual([]);
  });
});
