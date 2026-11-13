/**
 * An impulse exile's permission given to only some of the cards it exiled,
 * judged once they're all exiled (`impulse-exile`'s `grantIf`, the need key
 * `zone:impulse-free-lesser-mana-value-than-own`) — Triple Triad: "each player
 * exiles the top card of their library. Until end of turn, you may play the
 * card you own exiled this way and each other card exiled this way with lesser
 * mana value than it without paying their mana costs."
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, C, settle, spawn, table, toLibrary, toStep } from "./harness.js";

const castVariants = (game: Game, card: ObjectId): string[] =>
  game
    .legalActions(A)
    .filter((a) => a.kind === "cast-spell" && a.card === card)
    .map((a) => (a.kind === "cast-spell" && a.free === true ? "free" : "paid"));
const landPlays = (game: Game, card: ObjectId): number =>
  game.legalActions(A).filter((a) => a.kind === "play-land" && a.card === card).length;

/** Triple Triad on alice's side at three players; each player's top card
 * set just before her next upkeep, which then resolves. */
const upkeepWith = (tops: Partial<Record<PlayerId, string>>): { game: Game; top: Partial<Record<PlayerId, ObjectId>> } => {
  const { game } = table({ players: 3 });
  spawn(game, "Triple Triad");
  // Carol's turn 3 is the last before alice's: everyone has drawn by its end.
  toStep(game, "end", C);
  const top: Partial<Record<PlayerId, ObjectId>> = {};
  for (const [player, name] of Object.entries(tops) as [PlayerId, string][]) top[player] = toLibrary(game, name, player);
  toStep(game, "upkeep", A);
  settle(game);
  game.advanceUntil((s) => s.turn.step === "precombat-main" && s.priority.holder === A);
  return { game, top };
};

describe("Triple Triad", () => {
  it("your card free, and each other card of lesser mana value; equal or greater gets nothing", () => {
    const { game, top } = upkeepWith({ [A]: "Divination", [B]: "Grizzly Bears", [C]: "Cancel" });
    for (const id of Object.values(top)) expect(game.state.objects[id!].zone).toBe("exile");
    // Divination (3): hers, free only.
    expect(castVariants(game, top[A]!)).toEqual(["free"]);
    // Grizzly Bears (2 < 3): free.
    expect(castVariants(game, top[B]!)).toEqual(["free"]);
    // Cancel (3, not less): none.
    expect(castVariants(game, top[C]!)).toEqual([]);
    expect(game.state.objects[top[C]!].playPermission).toBeUndefined();
    // Cast the bears free: alice controls them (rule 608.3a).
    game.dispatch({ type: "cast-spell", player: A, card: top[B]!, via: "impulse", free: true, targets: [] });
    settle(game);
    expect(game.state.objects[top[B]!].zone).toBe("battlefield");
    expect(game.state.objects[top[B]!].controller).toBe(A);
  });

  it("your own land (mana value 0) may be played, and leaves nothing lesser", () => {
    const { game, top } = upkeepWith({ [A]: "Mountain", [B]: "Forest", [C]: "Grizzly Bears" });
    expect(landPlays(game, top[A]!)).toBe(1);
    expect(landPlays(game, top[B]!)).toBe(0);
    expect(castVariants(game, top[C]!)).toEqual([]);
  });

  it("another player's land is played when your card's mana value is greater", () => {
    const { game, top } = upkeepWith({ [A]: "Grizzly Bears", [B]: "Forest" });
    expect(landPlays(game, top[B]!)).toBe(1);
    game.dispatch({ type: "play-land", player: A, card: top[B]! });
    expect(game.state.objects[top[B]!].zone).toBe("battlefield");
    expect(game.state.objects[top[B]!].controller).toBe(A);
  });

  it("lapses at end of turn", () => {
    const { game, top } = upkeepWith({ [A]: "Divination", [B]: "Grizzly Bears" });
    toStep(game, "upkeep", B);
    expect(game.state.objects[top[B]!].zone).toBe("exile");
    expect(game.state.objects[top[B]!].playPermission).toBeUndefined();
  });
});
