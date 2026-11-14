/**
 * Myth Unbound: "Your commander costs {1} less to cast for each time it's
 * been cast from the command zone this game" — a `costModification` whose
 * `reduceGeneric` is `{ commanderCastsOf: "priced" }`, the spell being
 * priced's own count (rule 903.8's, the tax's) — and "whenever your
 * commander is put into the command zone from anywhere, draw a card", the
 * `commander-to-command-zone` trigger event (rules 903.9a, 903.9b).
 */
import { describe, expect, it } from "vitest";

import { ScriptedController } from "../controller.js";
import { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, ref, registryOf, settle, table } from "./harness.js";

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
  return { game, a, commander };
};

const lands = (game: Game, n: number, name = "Plains"): ObjectId[] =>
  Array.from({ length: n }, () => game.debugSpawn(name, A, "battlefield", { summoningSick: false }));

const castable = (game: Game, card: ObjectId): boolean =>
  game.legalActions(A).some((a) => a.kind === "cast-spell" && a.card === card);

describe("Myth Unbound", () => {
  it("takes {1} off for each earlier cast from the command zone, against the tax", () => {
    const { game, commander } = commanderGame();
    game.state.players[A].commanderCastCounts[COMMANDER] = 2;
    lands(game, 3);
    // {W} and {4} of tax: five mana, more than three Plains make.
    expect(castable(game, commander)).toBe(false);
    game.debugSpawn("Myth Unbound", A, "battlefield");
    // {W}, {4} of tax, {2} off: three.
    expect(castable(game, commander)).toBe(true);
    game.dispatch({ type: "cast-spell", player: A, card: commander, targets: [] });
    settle(game);
    expect(game.state.objects[commander].zone).toBe("battlefield");
    expect(game.state.players[A].commanderCastCounts[COMMANDER]).toBe(3);
  });

  it("takes nothing off a first cast, nor off another card", () => {
    const { game, commander } = commanderGame();
    game.debugSpawn("Myth Unbound", A, "battlefield");
    expect(castable(game, commander)).toBe(false);
    lands(game, 1);
    expect(castable(game, commander)).toBe(true);
  });

  it("draws a card whenever the commander goes to the command zone, not when it's cast", () => {
    const { game, commander } = commanderGame();
    game.debugSpawn("Myth Unbound", A, "battlefield");
    lands(game, 1);
    lands(game, 1, "Mountain");
    const before = game.state.zones.perPlayer[A].hand.length;
    game.dispatch({ type: "cast-spell", player: A, card: commander, targets: [] });
    settle(game);
    expect(game.state.zones.perPlayer[A].hand.length).toBe(before);
    const bolt = game.debugSpawn("Lightning Bolt", A, "hand");
    game.dispatch({ type: "cast-spell", player: A, card: bolt, targets: [ref(commander)] });
    settle(game);
    expect(game.state.objects[commander].zone).toBe("command");
    // The Bolt left the hand; the draw put one card back.
    expect(game.state.zones.perPlayer[A].hand.length).toBe(before + 1);
  });

  it("is only its owner's: an opponent's commander going there draws nothing", () => {
    const { game, commander } = commanderGame();
    game.debugSpawn("Myth Unbound", B, "battlefield");
    lands(game, 1);
    lands(game, 1, "Mountain");
    const before = game.state.zones.perPlayer[B].hand.length;
    game.dispatch({ type: "cast-spell", player: A, card: commander, targets: [] });
    settle(game);
    const bolt = game.debugSpawn("Lightning Bolt", A, "hand");
    game.dispatch({ type: "cast-spell", player: A, card: bolt, targets: [ref(commander)] });
    settle(game);
    expect(game.state.objects[commander].zone).toBe("command");
    expect(game.state.zones.perPlayer[B].hand.length).toBe(before);
  });
});
