/**
 * B338, the costs-mana lane: Avatar of Might's "if an opponent controls at
 * least four more creatures than you" (`opponent-controls-more`'s `by` on a
 * `selfCostReduction`), and Mana Cache's mana ability any player may activate
 * during their own turn.
 */
import { describe, expect, it } from "vitest";

import type { Action } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { activePlayerOf } from "../state.js";

import {
  A,
  B,
  C,
  activate,
  cast,
  counters,
  lands,
  nextTurn,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  zone,
} from "./harness.js";

describe("Avatar of Might", () => {
  it("costs {G}{G} while one opponent controls at least four more creatures than you", () => {
    const { game } = table({ players: 3 });
    for (let i = 0; i < 2; i += 1) spawn(game, "Forest");
    spawn(game, "Grizzly Bears");
    const avatar = toHand(game, "Avatar of Might");
    // Four for B: only three more than A's one.
    for (let i = 0; i < 4; i += 1) spawn(game, "Grizzly Bears", B);
    // Spread across two opponents doesn't count: C's two don't add to B's.
    for (let i = 0; i < 2; i += 1) spawn(game, "Grizzly Bears", C);
    expect(() => cast(game, avatar)).toThrow();
    spawn(game, "Grizzly Bears", B);
    cast(game, avatar);
    expect(zone(game, avatar)).toBe("battlefield");
  });
});

describe("Mana Cache", () => {
  const activation = (cache: ObjectId, player: PlayerId): Action =>
    ({ type: "activate-ability", player, source: cache, abilityIndex: 0, targets: [] }) as Action;
  const pool = (game: Game, player: PlayerId): string[] => game.state.players[player].manaPool.map((unit) => unit.type);

  it("a charge counter for each untapped land the player whose end step it is controls", () => {
    const { game } = table();
    const cache = spawn(game, "Mana Cache");
    lands(game, "Mountain", 3);
    lands(game, "Forest", 2, B);
    spawn(game, "Forest", B, { tapped: true });
    toStep(game, "end");
    settle(game);
    expect(counters(game, cache, "charge")).toBe(3);
    toStep(game, "end", B);
    settle(game);
    // Bob's three: his tapped Forest untapped in his untap step.
    expect(counters(game, cache, "charge")).toBe(6);
  });

  it("any player may remove a counter for {C}, in their own turn before the end step; the mana is theirs", () => {
    const { game } = table();
    const cache = spawn(game, "Mana Cache");
    lands(game, "Mountain", 2);
    toStep(game, "end");
    settle(game);
    expect(counters(game, cache, "charge")).toBe(2);
    // Alice's end step: too late for her.
    expect(game.canDispatch(activation(cache, A))).not.toBeNull();
    nextTurn(game);
    expect(activePlayerOf(game.state)).toBe(B);
    // Bob's turn: Alice can't, Bob can — and the {C} goes to Bob.
    expect(game.canDispatch(activation(cache, A))).not.toBeNull();
    activate(game, cache, 0, { player: B, settle: false });
    expect(pool(game, B)).toEqual(["C"]);
    expect(pool(game, A)).toEqual([]);
    expect(counters(game, cache, "charge")).toBe(1);
    // Bob spends it: a Sol Ring with no land of his own.
    const ring = toHand(game, "Sol Ring", B);
    cast(game, ring, { player: B });
    expect(zone(game, ring)).toBe("battlefield");
    toStep(game, "end", B);
    expect(game.canDispatch(activation(cache, B))).not.toBeNull();
  });
});
