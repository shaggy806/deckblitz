/**
 * A bot digging its library for a card (`bot/dig.ts`): the name Demonic
 * Consultation and Spoils of the Vault choose, and the card Tainted Pact
 * stops at, picked as a tutor picks its find. They used to name the card the
 * library held most of, and take the first card offered (a player's report,
 * 2026-11-23).
 */

import { describe, expect, it } from "vitest";

import { HeuristicBotController } from "../controller.js";
import { digOfCard } from "../bot/dig.js";
import { createDefaultRegistry } from "../cards.js";
import { Game } from "../game.js";
import { asPlayerId } from "../primitives.js";
import type { GameState } from "../state.js";

const A = asPlayerId("alice");
const B = asPlayerId("bob");

const quiet = (s: GameState): boolean =>
  s.zones.shared.stack.length === 0 && s.awaiting === null && s.pendingTriggers.length === 0;

/** Alice at her first main phase on six Swamps, her library `library` from
 * the bottom up (the last name is the top card) and her hand empty. */
function newGame(library: readonly string[]): Game {
  const game = Game.create({
    seed: 1,
    shuffle: false,
    startingPlayer: A,
    rules: { skipFirstDraw: false, maxLandsPerTurn: 99, maxHandSize: 99 },
    controllers: { [A]: new HeuristicBotController(A), [B]: new HeuristicBotController(B) },
    decks: [
      { player: A, cards: Array(40).fill("Swamp") },
      { player: B, cards: Array(40).fill("Swamp") },
    ],
  });
  game.advanceUntil((s) => s.turn.number === 1 && s.turn.step === "precombat-main");
  game.state.zones.perPlayer[A].hand = [];
  game.state.zones.perPlayer[A].library = [];
  for (const name of library) game.debugSpawn(name, A, "library");
  for (let i = 0; i < 6; i += 1) game.debugSpawn("Swamp", A, "battlefield");
  return game;
}

const handOf = (game: Game): string[] =>
  game.state.zones.perPlayer[A].hand.map((id) => game.state.objects[id].cardName);

function castAndSettle(game: Game, name: string): void {
  const card = game.debugSpawn(name, A, "hand");
  game.dispatch({ type: "cast-spell", player: A, card, targets: [] });
  game.advanceUntil(quiet);
}

/** `count` cards no hand wants much: vanilla 1/1s. */
const filler = (count: number): string[] => Array<string>(count).fill("Mons's Goblin Raiders");

describe("what a card's effect is read as", () => {
  const registry = createDefaultRegistry();
  it.each([
    ["Demonic Consultation", { kind: "named", exiledFirst: 6, lifeEach: false }],
    ["Divining Witch", { kind: "named", exiledFirst: 6, lifeEach: false }],
    ["Spoils of the Vault", { kind: "named", exiledFirst: 0, lifeEach: true }],
    ["Tainted Pact", { kind: "until-taken" }],
  ])("%s is a dig", (name, dig) => {
    expect(digOfCard(registry.get(name))).toEqual(dig);
  });

  it.each(["Demonic Tutor", "Wood Sage", "Petra Sphinx", "Meddling Mage", "Opt"])("%s is not", (name) => {
    expect(digOfCard(registry.get(name))).toBeNull();
  });
});

describe("the name a bot digs for", () => {
  it("is the card its hand most wants, not the one its library holds most of", () => {
    // Seventy cards, one Shivan Dragon among them: there 6 times in 70 to be
    // in the six exiled first.
    const game = newGame([...Array<string>(40).fill("Swamp"), "Shivan Dragon", ...filler(29)]);
    castAndSettle(game, "Demonic Consultation");
    expect(handOf(game)).toEqual(["Shivan Dragon"]);
  });

  it("is the name with copies to spare when one copy is too likely to be missed", () => {
    // Forty cards: the one Dragon is in the top six 15 times in 100, and a
    // miss exiles the library.
    const game = newGame([...Array<string>(20).fill("Swamp"), "Shivan Dragon", ...filler(19)]);
    castAndSettle(game, "Demonic Consultation");
    expect(handOf(game)).not.toContain("Shivan Dragon");
    expect(handOf(game)).toHaveLength(1);
    expect(game.state.zones.perPlayer[A].library.length).toBeGreaterThan(0);
  });

  it("never reads where the card lies", () => {
    // The same seventy with the Dragon on top, in the six exiled: named all
    // the same, and the library goes with it.
    const game = newGame([...Array<string>(40).fill("Swamp"), ...filler(29), "Shivan Dragon"]);
    castAndSettle(game, "Demonic Consultation");
    expect(handOf(game)).toEqual([]);
    expect(game.state.zones.perPlayer[A].library).toHaveLength(0);
  });

  it("for Spoils of the Vault is a card that won't cost its life to reach", () => {
    // One Dragon in seventy lies thirty-five cards down on average, a life
    // each; a Swamp is a card or two down (here, on top).
    const game = newGame([...filler(29), "Shivan Dragon", ...Array<string>(40).fill("Swamp")]);
    const life = game.state.players[A].life;
    castAndSettle(game, "Spoils of the Vault");
    expect(handOf(game)).toEqual(["Swamp"]);
    expect(game.state.players[A].life).toBe(life);
  });
});

describe("the card a bot stops Tainted Pact at", () => {
  it("is the first one near the best its library holds", () => {
    // Three poor cards on top of the Dragon: turned down, then the Dragon
    // taken. The names differ, so nothing ends the dig early.
    const game = newGame([
      ...Array<string>(40).fill("Swamp"),
      "Shivan Dragon",
      "Mons's Goblin Raiders",
      "Merfolk of the Pearl Trident",
      "Savannah Lions",
    ]);
    castAndSettle(game, "Tainted Pact");
    expect(handOf(game)).toEqual(["Shivan Dragon"]);
    expect(game.state.zones.perPlayer[A].library).toHaveLength(40);
  });

  it("is the first card of all once the library is down to thirty", () => {
    const game = newGame([...Array<string>(28).fill("Swamp"), "Shivan Dragon", "Mons's Goblin Raiders"]);
    castAndSettle(game, "Tainted Pact");
    expect(handOf(game)).toEqual(["Mons's Goblin Raiders"]);
    expect(game.state.zones.perPlayer[A].library).toHaveLength(29);
  });
});
