/**
 * The largest `{X}` on a wide board, and a large generic cost paid from it.
 *
 * `legalActions` sized an `{X}` by planning a payment for every X from 1 up
 * until one failed, and each plan re-ranked every source for every unit of
 * generic: with an {X} spell in hand on a board of 370 mana sources one call
 * took 21 seconds (`engine/data/bot-positions/seed-50-t40-b73.json`). The X
 * is found by halving now (`Game.largestPayable`), and a plan keeps its
 * ranking while the colours the hand wants are as plentiful as they were
 * (`mana-payment.ts`'s `byKeep`). These check the answers are the same ones:
 * every X up to the largest offered is paid, the next is refused, and the
 * colour the hand needs is the last to go.
 */

import { describe, expect, it } from "vitest";

import { createDefaultRegistry } from "../cards/registry.js";
import { ScriptedController } from "../controller.js";
import { Game } from "../game.js";
import { asPlayerId } from "../primitives.js";
import type { ObjectId } from "../primitives.js";

const A = asPlayerId("alice");
const B = asPlayerId("bob");
const registry = createDefaultRegistry();

/** Alice's first main phase, her hand empty and her own lands tapped. */
const setUp = (): Game => {
  const game = Game.create({
    seed: 1,
    shuffle: false,
    registry,
    rules: { skipFirstDraw: false, maxLandsPerTurn: 99, maxHandSize: 99 },
    controllers: { [A]: new ScriptedController(A), [B]: new ScriptedController(B) },
    decks: [
      { player: A, cards: Array<string>(40).fill("Forest") },
      { player: B, cards: Array<string>(40).fill("Forest") },
    ],
  });
  game.advanceUntil((s) => s.turn.number === 1 && s.turn.step === "precombat-main");
  game.state.zones.perPlayer[A].hand = [];
  for (const id of game.battlefield) if (game.state.objects[id].controller === A) game.state.objects[id].tapped = true;
  return game;
};

const untapped = (game: Game, name: string, count: number): ObjectId[] =>
  Array.from({ length: count }, () => {
    const id = game.debugSpawn(name, A, "battlefield", { summoningSick: false });
    game.state.objects[id].tapped = false;
    return id;
  });

const blazeOffer = (game: Game, blaze: ObjectId) =>
  game.legalActions(A).find((a) => a.kind === "cast-spell" && a.card === blaze);

describe("the largest {X} on a wide board", () => {
  it("is every source left once the coloured pip is paid", () => {
    const game = setUp();
    untapped(game, "Mountain", 60);
    const blaze = game.debugSpawn("Blaze", A, "hand");
    const offer = blazeOffer(game, blaze);
    expect(offer?.kind === "cast-spell" ? offer.xCost?.maxX : undefined).toBe(59);
  });

  it("counts a land that can't make the coloured pip toward X, not toward the pip", () => {
    const game = setUp();
    untapped(game, "Forest", 40);
    untapped(game, "Mountain", 1);
    const blaze = game.debugSpawn("Blaze", A, "hand");
    const offer = blazeOffer(game, blaze);
    expect(offer?.kind === "cast-spell" ? offer.xCost?.maxX : undefined).toBe(40);
  });

  it("is 0 with only the coloured pip's mana, and no offer without it", () => {
    const one = setUp();
    untapped(one, "Mountain", 1);
    const blaze = one.debugSpawn("Blaze", A, "hand");
    const offer = blazeOffer(one, blaze);
    expect(offer?.kind === "cast-spell" ? offer.xCost?.maxX : undefined).toBe(0);

    const none = setUp();
    untapped(none, "Forest", 30);
    expect(blazeOffer(none, none.debugSpawn("Blaze", A, "hand"))).toBeUndefined();
  });

  it.each([1, 17, 31, 32, 33, 58, 59])("pays X = %i of a largest 59", (x) => {
    const game = setUp();
    const mountains = untapped(game, "Mountain", 60);
    const blaze = game.debugSpawn("Blaze", A, "hand");
    game.dispatch({ type: "cast-spell", player: A, card: blaze, targets: [{ kind: "player", player: B }], xValue: x });
    expect(mountains.filter((id) => game.state.objects[id].tapped)).toHaveLength(x + 1);
  });

  it("refuses the X one past the largest", () => {
    const game = setUp();
    untapped(game, "Mountain", 60);
    const blaze = game.debugSpawn("Blaze", A, "hand");
    expect(() =>
      game.dispatch({ type: "cast-spell", player: A, card: blaze, targets: [{ kind: "player", player: B }], xValue: 60 }),
    ).toThrow();
  });
});

describe("a large generic cost on a wide board", () => {
  it("leaves the colour the hand wants for last, however many units it pays", () => {
    // Forty Mountains and three Islands, Blaze for 38 and a Counterspell
    // ({U}{U}) in hand: 39 mana of 43, and the two Islands the Counterspell
    // needs are among the four left. The ranking that keeps them is read
    // once and reused for all 38 units: no Island is tapped along the way,
    // so the supply of blue never moves.
    const game = setUp();
    untapped(game, "Mountain", 40);
    const islands = untapped(game, "Island", 3);
    const blaze = game.debugSpawn("Blaze", A, "hand");
    game.debugSpawn("Counterspell", A, "hand");
    game.dispatch({ type: "cast-spell", player: A, card: blaze, targets: [{ kind: "player", player: B }], xValue: 38 });
    expect(islands.filter((id) => !game.state.objects[id].tapped).length).toBeGreaterThanOrEqual(2);
  });

  it("re-ranks when the wanted colour runs short", () => {
    // Three Islands and four Forests, Gilded Lotus's {5} to pay, Counterspell
    // ({U}{U}) and Giant Growth ({G}) in hand. Blue is wanted twice from
    // three Islands (0.67 each), green once from four Forests (0.25), so
    // Forests go first — and with each one gone green is scarcer: after
    // three, the last Forest is worth 1 and an Island goes instead, twice.
    // One of each is left. A ranking never read again would have taken all
    // four Forests and left two Islands.
    const game = setUp();
    const islands = untapped(game, "Island", 3);
    const forests = untapped(game, "Forest", 4);
    const rock = game.debugSpawn("Gilded Lotus", A, "hand");
    game.debugSpawn("Counterspell", A, "hand");
    game.debugSpawn("Giant Growth", A, "hand");
    game.dispatch({ type: "cast-spell", player: A, card: rock, targets: [] });
    const left = (ids: readonly ObjectId[]): number => ids.filter((id) => !game.state.objects[id].tapped).length;
    expect({ islands: left(islands), forests: left(forests) }).toEqual({ islands: 1, forests: 1 });
  });
});
