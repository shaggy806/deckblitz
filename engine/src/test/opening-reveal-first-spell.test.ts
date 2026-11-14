/**
 * "You may reveal this card from your opening hand. If you do, when each
 * opponent casts their first spell of the game, counter that spell unless that
 * player pays {1}" (Chancellor of the Annex, rule 103.6b): an opening-hand
 * reveal's `{ whenever }` watch for the rest of the game, and the timing
 * wrapper's `nthThisGame` — the caster's first spell of the game, once per
 * opponent.
 */

import { describe, expect, it } from "vitest";

import { ScriptedController } from "../controller.js";
import { Game } from "../game.js";
import type { GameState } from "../state.js";
import { asPlayerId } from "../primitives.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { lands, pickModes } from "./harness.js";

const A = asPlayerId("alice");
const B = asPlayerId("bob");
const C = asPlayerId("carol");

const deck = (...cards: string[]): string[] => [...cards, ...Array<string>(40 - cards.length).fill("Forest")];

/** Alice starts; every opening-hand question is answered with all it offers. */
function newGame(hands: readonly (readonly string[])[]) {
  const players = [A, B, C].slice(0, hands.length);
  const seats = players.map((p) => new ScriptedController(p));
  for (const seat of seats) seat.chooseFromZoneFn = (_view, eligible) => [...eligible];
  const game = Game.create({
    seed: 3,
    shuffle: false,
    startingPlayer: A,
    rules: { maxHandSize: 99 },
    controllers: Object.fromEntries(players.map((p, i) => [p, seats[i]])),
    decks: players.map((player, i) => ({ player, cards: deck(...hands[i]) })),
  });
  return { game, seats };
}

const at = (game: Game, turn: number, step: GameState["turn"]["step"]): void =>
  game.advanceUntil((s) => s.turn.number === turn && s.turn.step === step && s.zones.shared.stack.length === 0 && s.awaiting === null);

const inHand = (game: Game, player: PlayerId, name: string): ObjectId[] =>
  game.state.zones.perPlayer[player].hand.filter((id) => game.state.objects[id].cardName === name);

const quiet = (s: GameState): boolean => s.zones.shared.stack.length === 0 && s.awaiting === null;

/** `player` casts their copy of `name` from hand and the stack empties. */
function castFromHand(game: Game, player: PlayerId, name: string): ObjectId {
  const [card] = inHand(game, player, name);
  game.dispatch({ type: "cast-spell", player, card, targets: [] });
  game.advanceUntil(quiet);
  return card;
}

describe("Chancellor of the Annex's reveal", () => {
  it("counters an opponent's first spell of the game they can't pay for, and not their second", () => {
    const { game } = newGame([["Llanowar Elves", "Llanowar Elves"], ["Chancellor of the Annex"]]);
    at(game, 1, "precombat-main");
    expect(game.state.delayedTriggers).toHaveLength(1);
    const [forest] = inHand(game, A, "Forest");
    game.dispatch({ type: "play-land", player: A, card: forest });
    const first = castFromHand(game, A, "Llanowar Elves");
    expect(game.state.objects[first].zone).toBe("graveyard");
    // Her second spell, turns later: not taxed, though she could pay now.
    at(game, 3, "precombat-main");
    const [another] = inHand(game, A, "Forest");
    game.dispatch({ type: "play-land", player: A, card: another });
    const second = castFromHand(game, A, "Llanowar Elves");
    expect(game.state.objects[second].zone).toBe("battlefield");
    expect(game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].tapped).length).toBe(1);
    // Still watching for the rest of the game.
    expect(game.state.delayedTriggers).toHaveLength(1);
  });

  it("lets the caster pay {1}, and its owner's own first spell isn't taxed", () => {
    const { game, seats } = newGame([["Llanowar Elves"], ["Chancellor of the Annex", "Llanowar Elves"]]);
    at(game, 1, "precombat-main");
    lands(game, "Forest", 2, A);
    pickModes(seats[0], 0);
    const elves = castFromHand(game, A, "Llanowar Elves");
    expect(game.state.objects[elves].zone).toBe("battlefield");
    // Both Forests tapped: one for the Elves, one for the {1}.
    const forests = game.state.zones.shared.battlefield.filter(
      (id) => game.state.objects[id].cardName === "Forest" && game.state.objects[id].controller === A,
    );
    expect(forests.every((id) => game.state.objects[id].tapped)).toBe(true);
    at(game, 2, "precombat-main");
    lands(game, "Forest", 1, B);
    const bobs = castFromHand(game, B, "Llanowar Elves");
    expect(game.state.objects[bobs].zone).toBe("battlefield");
  });

  it("fires once for each opponent's first spell (the ruling)", () => {
    const { game } = newGame([["Chancellor of the Annex"], ["Llanowar Elves"], ["Llanowar Elves"]]);
    at(game, 2, "precombat-main");
    expect(game.activePlayer).toBe(B);
    lands(game, "Forest", 1, B);
    const bobs = castFromHand(game, B, "Llanowar Elves");
    expect(game.state.objects[bobs].zone).toBe("graveyard");
    at(game, 3, "precombat-main");
    expect(game.activePlayer).toBe(C);
    lands(game, "Forest", 1, C);
    const carols = castFromHand(game, C, "Llanowar Elves");
    expect(game.state.objects[carols].zone).toBe("graveyard");
  });
});
