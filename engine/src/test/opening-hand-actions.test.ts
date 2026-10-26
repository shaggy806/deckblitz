// Rule 103.6a: "If a card allows a player to begin the game with that card on
// the battlefield, the player taking this action puts that card onto the
// battlefield" — once every hand is kept, the starting player first, then each
// other player in turn order (`Game.beginOpeningHandActions`).

import { describe, expect, it } from "vitest";

import { Game } from "../game.js";
import type { GameConfig } from "../game.js";
import { asPlayerId } from "../primitives.js";
import { destroy, enter, pickModes, spawn, table } from "./harness.js";
import type { ObjectId } from "../primitives.js";

const A = asPlayerId("alice");
const B = asPlayerId("bob");
const C = asPlayerId("carol");

/** Forests and Bears, with `leylines` mixed in: no shuffle, so a 40-card
 * deck of them puts every one in the opening hand. */
const deck = (...leylines: string[]): string[] => [
  ...leylines,
  ...Array.from({ length: 40 - leylines.length }, (_, i) => (i % 2 === 0 ? "Forest" : "Grizzly Bears")),
];

const newGame = (decks: Record<string, string[]>, overrides: Partial<GameConfig> = {}): Game =>
  Game.create({
    seed: 7,
    shuffle: false,
    decks: Object.entries(decks).map(([player, cards]) => ({ player: asPlayerId(player), cards })),
    ...overrides,
  });

const inHand = (game: Game, player: typeof A, name: string): ObjectId[] =>
  game.handOf(player).filter((id) => game.state.objects[id].cardName === name);

const onBattlefield = (game: Game, name: string): boolean =>
  game.state.zones.shared.battlefield.some((id) => game.state.objects[id].cardName === name);

describe("opening-hand actions (rule 103.6a)", () => {
  it("asks only a player holding such a card, for any number of them, before turn 1", () => {
    const game = newGame({
      alice: deck(),
      bob: deck("Leyline of Sanctity", "Leyline of the Void", "Leyline of Vitality"),
    });
    expect(game.state.turn.number).toBe(0);
    const awaiting = game.state.awaiting;
    expect(awaiting?.kind).toBe("choose-from-zone");
    if (awaiting?.kind !== "choose-from-zone") return;
    expect(awaiting.player).toBe(B);
    expect(awaiting.min).toBe(0);
    expect(awaiting.max).toBe(3);
    expect(game.legalActions(B)).toMatchObject([{ kind: "choose-from-zone", openingHand: true, destination: "battlefield" }]);
    // Which Leylines bob holds is his hand's business.
    const aliceSees = game.viewFor(A).awaiting;
    expect(aliceSees?.kind === "choose-from-zone" ? aliceSees.ids : null).toEqual([]);

    const chosen = [...inHand(game, B, "Leyline of Sanctity"), ...inHand(game, B, "Leyline of the Void")];
    game.dispatch({ type: "choose-from-zone", player: B, chosen });
    expect(onBattlefield(game, "Leyline of Sanctity")).toBe(true);
    expect(onBattlefield(game, "Leyline of the Void")).toBe(true);
    // The one he kept back stays in his hand.
    expect(inHand(game, B, "Leyline of Vitality")).toHaveLength(1);
    expect(game.handOf(B)).toHaveLength(5);
    expect(game.state.awaiting).toBeNull();
    expect(game.state.turn.number).toBe(1);
  });

  it("asks the starting player first, then the others in turn order", () => {
    const game = newGame(
      {
        alice: deck("Leyline of Anticipation"),
        bob: deck("Leyline of Sanctity"),
        carol: deck("Leyline of the Void"),
      },
      { startingPlayer: B },
    );
    const asked: string[] = [];
    while (game.state.awaiting?.kind === "choose-from-zone") {
      const { player, eligible } = game.state.awaiting;
      asked.push(player);
      game.dispatch({ type: "choose-from-zone", player, chosen: [...eligible] });
    }
    expect(asked).toEqual([B, C, A]);
    expect(game.state.turn.number).toBe(1);
    expect(game.activePlayer).toBe(B);
  });

  it("comes after the mulligans, over the hand that was kept", () => {
    const game = newGame({ alice: deck("Leyline of the Void"), bob: deck() }, { mulligans: true });
    expect(game.state.awaiting?.kind).toBe("mulligan");
    game.dispatch({ type: "mulligan", player: A, keep: true });
    game.dispatch({ type: "mulligan", player: B, keep: true });
    const awaiting = game.state.awaiting;
    expect(awaiting?.kind === "choose-from-zone" && awaiting.player).toBe(A);
    game.dispatch({ type: "choose-from-zone", player: A, chosen: [] });
    expect(onBattlefield(game, "Leyline of the Void")).toBe(false);
    expect(inHand(game, A, "Leyline of the Void")).toHaveLength(1);
    expect(game.state.turn.number).toBe(1);
  });

  it("puts a creature in under its owner's control (Quicksilver, Brash Blur)", () => {
    const game = newGame({ alice: deck("Quicksilver, Brash Blur"), bob: deck() });
    const [quicksilver] = inHand(game, A, "Quicksilver, Brash Blur");
    game.dispatch({ type: "choose-from-zone", player: A, chosen: [quicksilver] });
    expect(game.state.objects[quicksilver].zone).toBe("battlefield");
    expect(game.state.objects[quicksilver].controller).toBe(A);
  });
});

describe("the cards that begin on the battlefield", () => {
  it("Leyline of the Void exiles an opponent's card bound for their graveyard, not its controller's", () => {
    const { game } = table();
    spawn(game, "Leyline of the Void", A);
    const theirs = spawn(game, "Grizzly Bears", B);
    const mine = spawn(game, "Grizzly Bears", A);
    destroy(game, theirs);
    destroy(game, mine);
    expect(game.state.zones.shared.exile).toContain(theirs);
    expect(game.state.zones.perPlayer[A].graveyard).toContain(mine);
  });

  it("Leyline of Vitality gives your creatures +0/+1 and may gain a life as one enters", () => {
    const { game, a } = table();
    spawn(game, "Leyline of Vitality", A);
    pickModes(a, 0);
    const bears = enter(game, "Grizzly Bears", A);
    expect(game.viewFor(A).objects[bears].toughness).toBe(3);
    expect(game.state.players[A].life).toBe(21);
  });
});
