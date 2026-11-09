/**
 * Paying exactly all of one's life (rule 119.4) past a commander tax paid in
 * life: the offer names the pips that take the life the tax leaves.
 */

import { describe, expect, it } from "vitest";

import { ScriptedController } from "../controller.js";
import { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, lands, spawn } from "./harness.js";

const LIESA = "Liesa, Shroud of Dusk";

/** Liesa ({2}{W}{W}{B}) in the command zone, cast `casts` times before, with
 * K'rrik on the battlefield and four Plains: her {B} is 2 life or nothing. */
const board = (life: number, casts: number): { game: Game; liesa: ObjectId } => {
  const game = Game.create({
    seed: 1,
    shuffle: false,
    startingPlayer: A,
    rules: { skipFirstDraw: false, maxLandsPerTurn: 99, maxHandSize: 99, startingLife: life },
    controllers: { [A]: new ScriptedController(A), [B]: new ScriptedController(B) },
    decks: [
      { player: A, cards: Array<string>(40).fill("Plains"), commanders: [LIESA] },
      { player: B, cards: Array<string>(40).fill("Plains") },
    ],
  });
  game.advanceUntil((s) => s.turn.number === 1 && s.turn.step === "precombat-main" && s.priority.holder === A);
  game.state.players[A].life = life;
  game.state.players[A].commanderCastCounts[LIESA] = casts;
  spawn(game, "K'rrik, Son of Yawgmoth");
  lands(game, "Plains", 4);
  const liesa = game.state.zones.shared.command.find((id) => game.state.objects[id].cardName === LIESA)!;
  return { game, liesa };
};

const offerOf = (game: Game, card: ObjectId) => {
  const offer = game.offersFor(A).find((o) => o.kind === "cast-spell" && o.card === card);
  return offer?.kind === "cast-spell" ? offer : undefined;
};

describe("an all-your-life payment past a commander tax paid in life", () => {
  it("names the pips the tax leaves life for", () => {
    const { game, liesa } = board(4, 1);
    expect(game.legalActions(A).some((o) => o.kind === "cast-spell" && o.card === liesa)).toBe(false);
    const offer = offerOf(game, liesa);
    expect(offer?.phyrexianLifeAtLeast).toBe(1);
    expect(offer?.phyrexianPips).toBe(1);
    const action = { type: "cast-spell", player: A, card: liesa, targets: [] } as const;
    expect(game.canDispatch(action)).not.toBeNull();
    expect(game.canDispatch({ ...action, phyrexianLife: 1 })).toBeNull();
  });

  it("is offered above 20 life, when the tax takes the rest", () => {
    const { game, liesa } = board(24, 11);
    expect(offerOf(game, liesa)?.phyrexianLifeAtLeast).toBe(1);
  });

  it("offers nothing where the tax leaves no life for the pip", () => {
    const { game, liesa } = board(2, 1);
    expect(offerOf(game, liesa)).toBeUndefined();
  });
});
