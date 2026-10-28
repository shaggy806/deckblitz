// Rule 103.6b: "If a card allows a player to reveal it from their opening
// hand, the player taking this action does so." Each revealed card sets up a
// delayed triggered ability its owner controls (`CardDefinition.openingHandReveal`)
// — the Chancellors, Sphinx of Foresight — asked after the Leylines, the
// starting player first (`Game.beginOpeningHandActions`).

import { describe, expect, it } from "vitest";

import { ScriptedController } from "../controller.js";
import { Game } from "../game.js";
import type { GameState } from "../state.js";
import { asPlayerId } from "../primitives.js";
import type { ObjectId, PlayerId } from "../primitives.js";

const A = asPlayerId("alice");
const B = asPlayerId("bob");

/** `cards` on top, then Forests: no shuffle, so they're all in the opening hand. */
const deck = (...cards: string[]): string[] => [...cards, ...Array<string>(40 - cards.length).fill("Forest")];

/** Alice starts; each seat answers every opening-hand question with `reveal`
 * (all of what it's offered, by default). */
function newGame(alice: string[], bob: string[], reveal: Partial<Record<PlayerId, boolean>> = {}) {
  const a = new ScriptedController(A);
  const b = new ScriptedController(B);
  for (const seat of [a, b]) {
    seat.chooseFromZoneFn = (_view, eligible) => (reveal[seat.playerId] === false ? [] : [...eligible]);
  }
  const game = Game.create({
    seed: 3,
    shuffle: false,
    startingPlayer: A,
    rules: { maxHandSize: 99 },
    controllers: { [A]: a, [B]: b },
    decks: [
      { player: A, cards: deck(...alice) },
      { player: B, cards: deck(...bob) },
    ],
  });
  return { game, a, b };
}

const at = (game: Game, turn: number, step: GameState["turn"]["step"]): void =>
  game.advanceUntil((s) => s.turn.number === turn && s.turn.step === step && s.zones.shared.stack.length === 0 && s.awaiting === null);

const greenIn = (game: Game, player: PlayerId): number =>
  game.state.players[player].manaPool.filter((m) => m.type === "G").length;

const inHand = (game: Game, player: PlayerId, name: string): ObjectId[] =>
  game.state.zones.perPlayer[player].hand.filter((id) => game.state.objects[id].cardName === name);

describe("opening-hand reveals (rule 103.6b)", () => {
  it("asks for the reveal after the Leylines, and the card stays in the hand", () => {
    const { game } = newGame([], ["Leyline of the Void", "Chancellor of the Dross"]);
    const first = game.state.awaiting;
    expect(first?.kind === "choose-from-zone" && first.destination).toBe("battlefield");
    game.dispatch({ type: "choose-from-zone", player: B, chosen: inHand(game, B, "Leyline of the Void") });
    const second = game.state.awaiting;
    expect(second?.kind === "choose-from-zone" && second.destination).toBe("reveal");
    expect(game.legalActions(B)).toMatchObject([{ kind: "choose-from-zone", openingHand: true, destination: "reveal" }]);
    const [dross] = inHand(game, B, "Chancellor of the Dross");
    game.dispatch({ type: "choose-from-zone", player: B, chosen: [dross] });
    expect(game.state.turn.number).toBe(1);
    expect(game.state.objects[dross].zone).toBe("hand");
    expect(game.state.delayedTriggers).toHaveLength(1);
  });

  it("Chancellor of the Dross drains each opponent at the game's first upkeep, on the other player's turn", () => {
    const { game } = newGame([], ["Chancellor of the Dross"]);
    at(game, 1, "draw");
    expect(game.activePlayer).toBe(A);
    expect(game.state.players[A].life).toBe(17);
    expect(game.state.players[B].life).toBe(23);
    // Once only: bob's own first upkeep does nothing more.
    at(game, 2, "draw");
    expect(game.state.players[A].life).toBe(17);
  });

  it("does nothing for a card that wasn't revealed", () => {
    const { game } = newGame([], ["Chancellor of the Dross"], { [B]: false });
    at(game, 1, "draw");
    expect(game.state.players[A].life).toBe(20);
    expect(game.state.delayedTriggers).toHaveLength(0);
  });

  it("two Chancellors of the Spires revealed each mill seven (the ruling)", () => {
    const { game } = newGame(["Chancellor of the Spires", "Chancellor of the Spires"], []);
    const library = game.state.zones.perPlayer[B].library.length;
    at(game, 1, "draw");
    expect(game.state.zones.perPlayer[B].library.length).toBe(library - 14);
    expect(game.state.zones.perPlayer[B].graveyard).toHaveLength(14);
  });

  it("Sphinx of Foresight's scry 3 waits for its owner's first upkeep", () => {
    const { game, b } = newGame([], ["Sphinx of Foresight"]);
    const scries: number[] = [];
    b.chooseScryFn = (_view, cards) => {
      scries.push(cards.length);
      return [];
    };
    at(game, 1, "draw");
    expect(scries).toEqual([]);
    at(game, 2, "draw");
    expect(scries).toEqual([3]);
  });

  it("Chancellor of the Tangle adds {G} at its owner's first main phase, not the opponent's", () => {
    const { game } = newGame([], ["Chancellor of the Tangle"]);
    at(game, 1, "precombat-main");
    expect(greenIn(game, B)).toBe(0);
    at(game, 2, "precombat-main");
    expect(greenIn(game, B)).toBe(1);
  });

  it("Chancellor of the Forge makes a hasty Goblin at the first upkeep", () => {
    const { game } = newGame(["Chancellor of the Forge"], []);
    at(game, 1, "draw");
    const goblins = game.state.zones.shared.battlefield.filter(
      (id) => game.state.objects[id].cardName === "Phyrexian Goblin Token (Haste)",
    );
    expect(goblins).toHaveLength(1);
    expect(game.state.objects[goblins[0]].controller).toBe(A);
  });
});
