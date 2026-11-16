/**
 * `unknownCards` (`bot/turn-plan.ts`): the cards of its library a bot's turn
 * plan may not use, which is all of them but the top card where the seat can
 * see it (`view.ts`'s `ownLibraryTopSeen`).
 */
import { describe, expect, it } from "vitest";
import { unknownCards } from "../bot/turn-plan.js";
import { ownLibraryTopSeen } from "../view.js";
import { A, B, spawn, table } from "./harness.js";

describe("the cards a turn plan may not use", () => {
  it("is the whole library when the seat can't see its top card", () => {
    const { game } = table();
    const library = game.state.zones.perPlayer[A].library;
    expect(ownLibraryTopSeen(game.state, game.registry, A)).toBeNull();
    expect([...unknownCards(game.state, game.registry, A)].sort()).toEqual([...library].sort());
  });

  it("leaves out the top card the seat can see, and only that one", () => {
    const { game } = table();
    spawn(game, "Future Sight");
    const [top, second] = game.state.zones.perPlayer[A].library;
    expect(ownLibraryTopSeen(game.state, game.registry, A)).toBe(top);
    const unknown = unknownCards(game.state, game.registry, A);
    expect(unknown.has(top)).toBe(false);
    // The card under it is turned up only by playing the first: not known yet.
    expect(unknown.has(second)).toBe(true);
    expect(unknown.size).toBe(game.state.zones.perPlayer[A].library.length - 1);
  });

  it("is the seat's own sight: an opponent's Future Sight shows the opponent's library", () => {
    const { game } = table();
    spawn(game, "Future Sight", B);
    expect(ownLibraryTopSeen(game.state, game.registry, A)).toBeNull();
    expect(ownLibraryTopSeen(game.state, game.registry, B)).toBe(game.state.zones.perPlayer[B].library[0]);
    expect(unknownCards(game.state, game.registry, A).size).toBe(game.state.zones.perPlayer[A].library.length);
  });

  it("matches what the seat's view shows it", () => {
    const { game } = table();
    spawn(game, "Oracle of Mul Daya");
    expect(ownLibraryTopSeen(game.state, game.registry, A)).toBe(game.viewFor(A).revealedLibraryTop[A]);
    expect(game.viewFor(A).revealedLibraryTop[A]).not.toBeNull();
  });
});
