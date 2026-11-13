/**
 * Playing from the top of another player's library (a `player-effect`'s
 * `mayPlay` from `"library-top"` with `whose`), and looking at it any time
 * (`looksAtLibraryTopOf`) — the need key `zone:play-from-opponent-library-top`.
 * Xanathar, Guild Kingpin: "At the beginning of your upkeep, choose target
 * opponent. Until end of turn, that player can't cast spells, you may look at
 * the top card of their library any time, you may play the top card of their
 * library, and you may spend mana as though it were mana of any color to cast
 * spells this way."
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, cast, lands, pickTargets, settle, spawn, table, toHand, toLibrary, toStep, zone } from "./harness.js";

const castable = (game: Game, player: PlayerId, card: ObjectId): boolean =>
  game.legalActions(player).some((a) => a.kind === "cast-spell" && a.card === card);
const landPlayable = (game: Game, player: PlayerId, card: ObjectId): boolean =>
  game.legalActions(player).some((a) => a.kind === "play-land" && a.card === card);

/** Xanathar on alice's side; bob's library topped with `tops` (last on top)
 * at the end of his turn; alice's upkeep trigger resolved, then her main. */
const xanatharTurn = (tops: readonly string[]) => {
  const { game, a } = table();
  pickTargets(a, B);
  spawn(game, "Xanathar, Guild Kingpin");
  lands(game, "Island", 2);
  toStep(game, "end", B);
  const ids = tops.map((name) => toLibrary(game, name, B));
  toStep(game, "upkeep", A);
  settle(game);
  game.advanceUntil((s) => s.turn.step === "precombat-main" && s.priority.holder === A);
  return { game, ids };
};

describe("Xanathar, Guild Kingpin", () => {
  it("alice looks at and casts bob's top card, mana as any color; then plays the land under it", () => {
    const { game, ids } = xanatharTurn(["Forest", "Grizzly Bears"]);
    const [forest, bears] = ids;
    // Only she sees it.
    expect(game.viewFor(A).revealedLibraryTop[B]).toBe(bears);
    expect(game.viewFor(B).revealedLibraryTop[B]).toBeNull();
    // Grizzly Bears ({1}{G}) with two Islands.
    expect(castable(game, A, bears)).toBe(true);
    cast(game, bears, { via: "library-top" });
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[bears].controller).toBe(A);
    // The Forest is on top now: a land, with her land drop.
    expect(game.viewFor(A).revealedLibraryTop[B]).toBe(forest);
    expect(landPlayable(game, A, forest)).toBe(true);
    game.dispatch({ type: "play-land", player: A, card: forest });
    expect(zone(game, forest)).toBe("battlefield");
    expect(game.state.objects[forest].controller).toBe(A);
  });

  it("bob can't cast spells this turn, and the permission is alice's alone", () => {
    const { game, ids } = xanatharTurn(["Grizzly Bears"]);
    lands(game, "Mountain", 1, B);
    const bolt = toHand(game, "Lightning Bolt", B);
    expect(castable(game, B, bolt)).toBe(false);
    expect(castable(game, B, ids[0])).toBe(false);
  });

  it("ends with the turn: next turn neither the look nor the play", () => {
    const { game, ids } = xanatharTurn(["Grizzly Bears"]);
    toStep(game, "precombat-main", B);
    expect(game.viewFor(A).revealedLibraryTop[B]).toBeNull();
    expect(castable(game, A, ids[0])).toBe(false);
  });

  it("her own library top isn't reached by it", () => {
    const { game } = xanatharTurn(["Grizzly Bears"]);
    const own = game.state.zones.perPlayer[A].library[0];
    expect(castable(game, A, own)).toBe(false);
    expect(landPlayable(game, A, own)).toBe(false);
  });
});
