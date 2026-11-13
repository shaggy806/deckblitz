/**
 * `cast-now`'s `from: "command-zone"` — Geode Golem: "whenever this creature
 * deals combat damage to a player, you may cast your commander from the
 * command zone without paying its mana cost. (You still pay any additional
 * costs.)" The commander tax is one of those (its rulings, rule 903.8).
 */
import { describe, expect, it } from "vitest";

import { ScriptedController } from "../controller.js";
import { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, attack, registryOf, table } from "./harness.js";

const COMMANDER = "Isamaru, Hound of Konda";
const registry = registryOf(table().game);

const commanderGame = () => {
  const a = new ScriptedController(A);
  const b = new ScriptedController(B);
  const game = Game.create({
    seed: 1,
    shuffle: false,
    registry,
    rules: { skipFirstDraw: false, maxLandsPerTurn: 99, maxHandSize: 99 },
    controllers: { [A]: a, [B]: b } as Record<PlayerId, ScriptedController>,
    decks: [
      { player: A, cards: Array<string>(40).fill("Plains"), commanders: [COMMANDER] },
      { player: B, cards: Array<string>(40).fill("Plains") },
    ],
  });
  game.advanceUntil((s) => s.turn.number === 1 && s.turn.step === "precombat-main" && s.priority.holder === A);
  const commander = game.state.zones.shared.command.find((id) => game.state.objects[id].cardName === COMMANDER)!;
  const golem = game.debugSpawn("Geode Golem", A, "battlefield", { summoningSick: false });
  a.chooseCastNowFn = (_v, offer) =>
    offer.cards.includes(commander)
      ? { type: "cast-spell", player: A, card: commander, targets: [], via: "effect", free: true }
      : null;
  return { game, a, commander, golem };
};

const lands = (game: Game, n: number): ObjectId[] =>
  Array.from({ length: n }, () => game.debugSpawn("Plains", A, "battlefield", { summoningSick: false }));

describe("Geode Golem", () => {
  it("casts the commander from the command zone for free the first time, and counts the cast", () => {
    const { game, a, commander, golem } = commanderGame();
    attack(game, a, [golem]);
    expect(game.state.objects[commander].zone).toBe("battlefield");
    expect(game.state.players[A].commanderCastCounts[COMMANDER]).toBe(1);
  });

  it("still pays the commander tax: with no mana, a second cast isn't offered", () => {
    const { game, a, commander, golem } = commanderGame();
    game.state.players[A].commanderCastCounts[COMMANDER] = 1;
    attack(game, a, [golem]);
    expect(game.state.objects[commander].zone).toBe("command");
  });

  it("with {2} for the tax, the second cast goes through", () => {
    const { game, a, commander, golem } = commanderGame();
    game.state.players[A].commanderCastCounts[COMMANDER] = 1;
    const plains = lands(game, 2);
    attack(game, a, [golem]);
    expect(game.state.objects[commander].zone).toBe("battlefield");
    expect(plains.every((id) => game.state.objects[id].tapped)).toBe(true);
    expect(game.state.players[A].commanderCastCounts[COMMANDER]).toBe(2);
  });
});
