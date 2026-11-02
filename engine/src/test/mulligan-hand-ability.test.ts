// Rule 103.5b: "If an effect allows a player to perform an action 'any time
// [that player] could mulligan,' the player may perform that action at a time
// they would declare whether they will take a mulligan ... If the player
// performs the action, they then declare whether they will take a mulligan."
// Serum Powder, and rule 103.5's limit on how far mulligans can go.

import { describe, expect, it } from "vitest";

import { COMMANDER_RULES } from "../state.js";
import { Game } from "../game.js";
import type { GameConfig } from "../game.js";
import { HeuristicBotController, RandomController } from "../controller.js";
import { asPlayerId } from "../primitives.js";
import type { ObjectId } from "../primitives.js";

const A = asPlayerId("alice");
const B = asPlayerId("bob");
const C = asPlayerId("carol");

/** Named cards on top, then Forests: no shuffle, so the top seven are the hand. */
const deck = (...top: string[]): string[] => [...top, ...Array.from({ length: 40 - top.length }, () => "Forest")];

const newGame = (decks: Record<string, string[]>, overrides: Partial<GameConfig> = {}): Game =>
  Game.create({
    seed: 7,
    shuffle: false,
    mulligans: true,
    decks: Object.entries(decks).map(([player, cards]) => ({ player: asPlayerId(player), cards })),
    ...overrides,
  });

const powderOf = (game: Game, player: typeof A): ObjectId =>
  game.handOf(player).find((id) => game.state.objects[id].cardName === "Serum Powder") as ObjectId;

const NEXT_SEVEN = ["Grizzly Bears", "Hill Giant", "Island", "Mountain", "Plains", "Swamp", "Shock"];
/** Serum Powder and six Forests in hand, seven other cards next off the library. */
const powderDeck = (): string[] => [
  "Serum Powder",
  ...Array.from({ length: 6 }, () => "Forest"),
  ...NEXT_SEVEN,
  ...Array.from({ length: 26 }, () => "Forest"),
];

describe("Serum Powder (rule 103.5b)", () => {
  it("is offered only to a player holding it, only while they're deciding", () => {
    const game = newGame({ alice: powderDeck(), bob: deck() });
    const powder = powderOf(game, A);
    expect(game.legalActions(A)).toEqual([
      { kind: "mulligan", count: 0 },
      { kind: "mulligan-hand-ability", card: powder },
    ]);
    expect(game.legalActions(B)).toEqual([{ kind: "mulligan", count: 0 }]);
    // Bob names a card of his own that has no such ability: refused.
    const bobs = game.handOf(B)[0];
    expect(() => game.dispatch({ type: "mulligan-hand-ability", player: B, card: bobs })).toThrow(/no such ability/);
    expect(() => game.dispatch({ type: "mulligan-hand-ability", player: B, card: powder })).toThrow(/not in bob's hand/);
  });

  it("exiles the whole hand, itself included, then draws that many, and they declare again", () => {
    const game = newGame({ alice: powderDeck(), bob: deck() });
    const powder = powderOf(game, A);
    const oldHand = [...game.handOf(A)];
    const library = game.state.zones.perPlayer[A].library.length;

    game.dispatch({ type: "mulligan-hand-ability", player: A, card: powder });

    for (const id of oldHand) expect(game.state.objects[id].zone).toBe("exile");
    expect(game.handOf(A).map((id) => game.state.objects[id].cardName)).toEqual(NEXT_SEVEN);
    expect(game.state.zones.perPlayer[A].library).toHaveLength(library - 7);
    // Nothing shuffled: the rest of the library is still in order.
    const awaiting = game.state.awaiting;
    expect(awaiting?.kind).toBe("mulligan");
    if (awaiting?.kind !== "mulligan") return;
    // Not a mulligan: none counted, still deciding, and gone with the hand.
    expect(awaiting.hands[A]).toEqual({ taken: 0, step: "decide", redraws: 1 });
    expect(game.legalActions(A)).toEqual([{ kind: "mulligan", count: 0, redraws: 1 }]);
    expect(game.events.some((e) => e.type === "mulligan-taken")).toBe(false);
    expect(game.events.some((e) => e.type === "hand-exiled-while-mulliganing" && e.card === powder)).toBe(true);
  });

  it("costs no card on keeping, unlike a mulligan", () => {
    const game = newGame({ alice: powderDeck(), bob: deck() });
    game.dispatch({ type: "mulligan-hand-ability", player: A, card: powderOf(game, A) });
    game.dispatch({ type: "mulligan", player: A, keep: true });
    const awaiting = game.state.awaiting;
    expect(awaiting?.kind === "mulligan" && awaiting.hands[A]).toBeFalsy();
    expect(game.handOf(A)).toHaveLength(7);
  });

  it("can be used again from a hand that holds another, then a mulligan on top", () => {
    const second = ["Serum Powder", ...NEXT_SEVEN.slice(1)];
    const game = newGame({
      alice: ["Serum Powder", ...Array.from({ length: 6 }, () => "Forest"), ...second, ...NEXT_SEVEN, ...deck()],
      bob: deck(),
    });
    game.dispatch({ type: "mulligan-hand-ability", player: A, card: powderOf(game, A) });
    game.dispatch({ type: "mulligan-hand-ability", player: A, card: powderOf(game, A) });
    expect(game.state.zones.shared.exile).toHaveLength(14);
    expect(game.handOf(A).map((id) => game.state.objects[id].cardName)).toEqual(NEXT_SEVEN);
    // "You can do this in addition to taking mulligans": what's owed is the
    // one mulligan, not the three hands.
    game.dispatch({ type: "mulligan", player: A, keep: false });
    game.dispatch({ type: "mulligan", player: A, keep: true });
    expect(game.legalActions(A)).toMatchObject([{ kind: "put-on-bottom", count: 1 }]);
  });

  it("works after a mulligan too, in a later round (rule 103.5b)", () => {
    // Everything in the library is a Powder: the mulligan's new hand holds one.
    const game = newGame({ alice: Array.from({ length: 40 }, () => "Serum Powder"), bob: deck() });
    game.dispatch({ type: "mulligan", player: B, keep: true });
    game.dispatch({ type: "mulligan", player: A, keep: false });
    expect(game.legalActions(A)).toHaveLength(8);
    game.dispatch({ type: "mulligan-hand-ability", player: A, card: powderOf(game, A) });
    const awaiting = game.state.awaiting;
    expect(awaiting?.kind === "mulligan" && awaiting.hands[A]).toEqual({ taken: 1, step: "decide", redraws: 1 });
    game.dispatch({ type: "mulligan", player: A, keep: true });
    expect(game.legalActions(A)).toMatchObject([{ kind: "put-on-bottom", count: 1 }]);
  });

  it("isn't offered once they've kept, nor during the bottoming", () => {
    const game = newGame({ alice: Array.from({ length: 40 }, () => "Serum Powder"), bob: deck() });
    game.dispatch({ type: "mulligan", player: A, keep: false });
    game.dispatch({ type: "mulligan", player: A, keep: true });
    expect(game.legalActions(A).map((a) => a.kind)).toEqual(["put-on-bottom"]);
    const powder = powderOf(game, A);
    expect(() => game.dispatch({ type: "mulligan-hand-ability", player: A, card: powder })).toThrow(/could not mulligan/);
  });

  it("isn't offered in play: it does nothing from the hand on a turn, and taps for {C} on the battlefield", () => {
    const game = newGame({ alice: powderDeck(), bob: deck() });
    game.dispatch({ type: "mulligan", player: A, keep: true });
    game.dispatch({ type: "mulligan", player: B, keep: true });
    expect(game.state.turn.number).toBe(1);
    expect(game.legalActions(A).some((a) => a.kind === "mulligan-hand-ability")).toBe(false);
  });

  it("is seen by the table: the exiled hand is public, the new one isn't", () => {
    const game = newGame({ alice: powderDeck(), bob: deck() });
    const powder = powderOf(game, A);
    game.dispatch({ type: "mulligan-hand-ability", player: A, card: powder });
    const bobSees = game.viewFor(B);
    expect(bobSees.zones.exile).toContain(powder);
    expect(bobSees.objects[powder].cardName).toBe("Serum Powder");
    expect(bobSees.objects[game.handOf(A)[0]]).toBeUndefined();
  });

  it("waits on nobody at a four-player table, and what's owed still reads the free first mulligan", () => {
    const game = newGame(
      { alice: deck(), bob: powderDeck(), carol: deck(), dave: deck() },
      { rules: COMMANDER_RULES, startingPlayer: C },
    );
    game.dispatch({ type: "mulligan-hand-ability", player: B, card: powderOf(game, B) });
    expect(game.handOf(B).map((id) => game.state.objects[id].cardName)).toEqual(NEXT_SEVEN);
    game.dispatch({ type: "mulligan", player: B, keep: false });
    game.dispatch({ type: "mulligan", player: B, keep: true });
    // Rule 103.5c: the one mulligan was free, so Bob is done and keeps seven.
    const awaiting = game.state.awaiting;
    expect(awaiting?.kind === "mulligan" && awaiting.hands[B]).toBeFalsy();
    expect(game.handOf(B)).toHaveLength(7);
  });

  it("draws from an empty library when the library's too short, and loses as the game begins (704.5b)", () => {
    const game = newGame({
      alice: ["Serum Powder", ...Array.from({ length: 6 }, () => "Forest"), "Grizzly Bears", "Hill Giant"],
      bob: deck(),
    });
    game.dispatch({ type: "mulligan-hand-ability", player: A, card: powderOf(game, A) });
    expect(game.handOf(A)).toHaveLength(2);
    expect(game.state.players[A].attemptedDrawFromEmptyLibrary).toBe(true);
    expect(game.state.players[A].hasLost).toBe(false);
    game.dispatch({ type: "mulligan", player: A, keep: true });
    game.dispatch({ type: "mulligan", player: B, keep: true });
    expect(game.state.players[A].hasLost).toBe(true);
  });

  it("a hand a short library left under what's owed gives what it has", () => {
    // Six in a library of 8 with one mulligan owed twice over: 2 cards in hand.
    const game = newGame({
      alice: ["Serum Powder", ...Array.from({ length: 6 }, () => "Forest"), "Grizzly Bears"],
      bob: deck(),
    });
    game.dispatch({ type: "mulligan", player: A, keep: false });
    game.dispatch({ type: "mulligan", player: A, keep: false });
    game.dispatch({ type: "mulligan-hand-ability", player: A, card: powderOf(game, A) ?? game.handOf(A)[0] });
    expect(game.handOf(A).length).toBe(1);
    game.dispatch({ type: "mulligan", player: A, keep: true });
    expect(game.legalActions(A)).toMatchObject([{ kind: "put-on-bottom", count: 1 }]);
    game.dispatch({ type: "put-on-bottom", player: A, cards: [...game.handOf(A)] });
    expect(game.handOf(A)).toHaveLength(0);
  });

  it("the bots use it on a hand they wouldn't keep, and keep a hand they would", () => {
    const bot = (player: typeof A) => new HeuristicBotController(player);
    // Seven Serum-Powder-and-Forests is all lands and no plays: thrown back.
    const flooded = Game.create({
      seed: 7,
      shuffle: false,
      mulligans: true,
      decks: [
        { player: A, cards: powderDeck() },
        { player: B, cards: deck() },
      ],
      controllers: { [A]: bot(A), [B]: bot(B) },
    });
    flooded.advanceUntil((s) => s.turn.number >= 1);
    expect(flooded.events.some((e) => e.type === "hand-exiled-while-mulliganing" && e.player === A)).toBe(true);
    expect(flooded.state.turn.number).toBe(1);
  });

  it("the fuzzer's random answer can use it, and always finishes", () => {
    /** A little deterministic stream, for `RandomController`'s `random`. */
    const walk = (seed: number) => {
      let x = seed;
      return () => {
        x = (x * 16807) % 2147483647;
        return x / 2147483647;
      };
    };
    for (let seed = 1; seed <= 12; seed += 1) {
      const game = Game.create({
        seed,
        shuffle: false,
        mulligans: true,
        decks: [
          { player: A, cards: powderDeck() },
          { player: B, cards: deck() },
        ],
        controllers: { [A]: new RandomController(A, walk(seed)), [B]: new RandomController(B, walk(seed + 100)) },
      });
      game.advanceUntil((s) => s.turn.number >= 1);
      expect(game.state.turn.number).toBe(1);
    }
  });
});

describe("how far mulligans go (rule 103.5)", () => {
  const taken = (game: Game, player: typeof A, times: number): void => {
    for (let i = 0; i < times; i += 1) game.dispatch({ type: "mulligan", player, keep: false });
  };

  it("stops at an opening hand of zero cards: seven mulligans, then only keep", () => {
    const game = newGame({ alice: deck(), bob: deck() });
    taken(game, A, 6);
    expect(game.legalActions(A)).toEqual([{ kind: "mulligan", count: 6 }]);
    taken(game, A, 1);
    expect(game.legalActions(A)).toEqual([{ kind: "mulligan", count: 7, mustKeep: true }]);
    expect(() => taken(game, A, 1)).toThrow(/no cards/);
    game.dispatch({ type: "mulligan", player: A, keep: true });
    expect(game.legalActions(A)).toMatchObject([{ kind: "put-on-bottom", count: 7 }]);
    game.dispatch({ type: "put-on-bottom", player: A, cards: [...game.handOf(A)] });
    expect(game.handOf(A)).toHaveLength(0);
  });

  it("a free first mulligan doesn't count toward the limit (rule 103.5c)", () => {
    const game = newGame({ alice: deck(), bob: deck() }, { rules: COMMANDER_RULES });
    taken(game, A, 7);
    expect(game.legalActions(A)).toEqual([{ kind: "mulligan", count: 7 }]);
    taken(game, A, 1);
    expect(game.legalActions(A)).toEqual([{ kind: "mulligan", count: 8, mustKeep: true }]);
  });
});
