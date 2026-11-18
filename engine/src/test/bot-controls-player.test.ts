/**
 * A searching bot making another player's decisions (rule 723 — Mindslaver):
 * `EvalBotController.standIn`, `EvalStandIn` in `bot/eval-bot.ts`.
 *
 * Until 2026-11-17 the stand-in answered what the player was made to answer
 * and passed every priority window, so a bot's Mindslaver turn was legal and
 * wasted. It now takes, at each of the player's priority windows, the cast or
 * activation that leaves the board best for the bot, where one beats passing.
 */

import { describe, expect, it } from "vitest";

import { EvalBotController } from "../bot/eval-bot.js";
import { createDefaultRegistry } from "../cards.js";
import { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, activate, lands, life, ref, registryOf, spawn, table, toHand, zone } from "./harness.js";

/** Alice, her decisions scripted to pass, uses Mindslaver on bob; a v2 bot in
 * her seat answers for him. Returns the game at her main phase, his turn next. */
function slaved(setup: (game: Game) => void): Game {
  const { game, a } = table();
  const bot = new EvalBotController(A, registryOf(game));
  a.standInFn = (player) => bot.standIn(player);
  lands(game, "Wastes", 4);
  setup(game);
  activate(game, spawn(game, "Mindslaver"), 0, { targets: [ref(B)] });
  return game;
}

/** Play bob's turn out, to alice's next. */
const bobsTurn = (game: Game): void => game.advanceUntil((s) => s.turn.number === 3 || s.result.over);

describe("a seated bot controlling another seated bot", () => {
  it("plays the other seat's turn through, with what it remembers and may know", () => {
    // Both seats v2, as a room seats them: alice's own controller answers for
    // bob's seat during his turn (its stand-in, on its own fair view).
    const registry = createDefaultRegistry();
    const deck = (player: PlayerId, spells: readonly string[]) => ({
      player,
      cards: [...Array<string>(16).fill("Mountain"), ...spells, ...spells, ...spells, ...spells],
    });
    const spells = ["Lightning Bolt", "Grizzly Bears", "Shock", "Hill Giant", "Goblin Piker", "Fireball"];
    const game = Game.create({
      seed: 7,
      registry,
      startingPlayer: A,
      controllers: { [A]: new EvalBotController(A, registry), [B]: new EvalBotController(B, registry) },
      decks: [deck(A, spells), deck(B, spells)],
    });
    game.advanceUntil((s) => s.turn.number === 1 && s.turn.step === "precombat-main" && s.priority.holder === A);
    lands(game, "Wastes", 4);
    lands(game, "Mountain", 4, B);
    const before = life(game, B);
    activate(game, spawn(game, "Mindslaver"), 0, { targets: [ref(B)], settle: false });
    game.advanceUntil((s) => s.turn.number === 3 || s.result.over);
    expect(game.state.result.over || game.state.turn.number === 3).toBe(true);
    // Whatever burn bob held went at his own face or creatures, never alice's:
    // she took nothing in a turn she ran.
    expect(life(game, A)).toBe(20);
    expect(life(game, B)).toBeLessThanOrEqual(before);
  });
});

describe("a bot controlling another player", () => {
  it("has them spend their removal on their own best creature", () => {
    let dreadmaw: ObjectId = "" as ObjectId;
    let bears: ObjectId = "" as ObjectId;
    let murder: ObjectId = "" as ObjectId;
    const game = slaved((g) => {
      bears = spawn(g, "Grizzly Bears", A);
      dreadmaw = spawn(g, "Colossal Dreadmaw", B);
      spawn(g, "Llanowar Elves", B);
      lands(g, "Swamp", 3, B);
      murder = toHand(g, "Murder", B);
    });
    bobsTurn(game);
    expect(zone(game, murder)).toBe("graveyard");
    expect(zone(game, dreadmaw)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("has them burn themselves, not the bot", () => {
    let bolt: ObjectId = "" as ObjectId;
    const game = slaved((g) => {
      lands(g, "Mountain", 1, B);
      bolt = toHand(g, "Lightning Bolt", B);
    });
    bobsTurn(game);
    expect(zone(game, bolt)).toBe("graveyard");
    expect(life(game, B)).toBe(17);
    expect(life(game, A)).toBe(20);
  });

  it("leaves a creature spell that would only build their board in their hand", () => {
    let wurm: ObjectId = "" as ObjectId;
    const game = slaved((g) => {
      lands(g, "Forest", 6, B);
      wurm = toHand(g, "Craw Wurm", B);
    });
    bobsTurn(game);
    expect(zone(game, wurm)).toBe("hand");
  });

  it("makes no more plays in a turn than its cap, and the game goes on", () => {
    const game = slaved((g) => {
      lands(g, "Mountain", 3, B);
      for (let i = 0; i < 3; i += 1) toHand(g, "Lightning Bolt", B);
    });
    bobsTurn(game);
    expect(game.state.turn.number).toBe(3);
    // Three Bolts at his own face.
    expect(life(game, B)).toBe(11);
    expect(life(game, A)).toBe(20);
  });
});
