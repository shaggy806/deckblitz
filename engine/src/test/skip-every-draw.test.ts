/**
 * "If a player would draw a card, that player skips that draw instead"
 * (Possessed Portal): a `would-draw` replacement of `who: "any-player"` whose
 * effect is nothing (rule 614.1a). No card is drawn — not in the draw step,
 * not by an effect — and from an empty library nobody loses (614.11). Its end
 * step trigger is `each-player-may`: each player discards a card or
 * sacrifices a permanent.
 */
import { describe, expect, it } from "vitest";

import { A, B, cast, hand, lands, nextTurn, pickModes, settle, spawn, table, toHand, toStep, zone } from "./harness.js";

const librarySize = (game: import("../game.js").Game, player: typeof A): number => game.state.zones.perPlayer[player].library.length;

describe("Possessed Portal", () => {
  it("every draw is skipped: the draw step's and an effect's", () => {
    const { game, a, b } = table();
    spawn(game, "Possessed Portal", A);
    pickModes(a, 0);
    pickModes(b, 0);
    const handBefore = hand(game, A).length;
    const libraryBefore = librarySize(game, A);
    lands(game, "Island", 3);
    cast(game, toHand(game, "Divination"));
    expect(hand(game, A).length).toBe(handBefore);
    expect(librarySize(game, A)).toBe(libraryBefore);
    // Bob's draw step.
    const bobHand = hand(game, B).length;
    const bobLibrary = librarySize(game, B);
    nextTurn(game);
    expect(game.state.turn.number).toBe(2);
    expect(librarySize(game, B)).toBe(bobLibrary);
    // Bob discarded at alice's end step, and drew nothing.
    expect(hand(game, B).length).toBe(bobHand - 1);
  });

  it("drawing from an empty library is skipped too, so nobody loses", () => {
    const { game, a, b } = table();
    spawn(game, "Possessed Portal", A);
    pickModes(a, 0);
    pickModes(b, 0);
    game.state.zones.perPlayer[B].library = [];
    nextTurn(game);
    expect(game.state.turn.number).toBe(2);
    expect(game.state.players[B].hasLost).not.toBe(true);
  });

  it("at each end step, each player discards a card or sacrifices a permanent", () => {
    const { game, a, b } = table();
    const portal = spawn(game, "Possessed Portal", A);
    const bears = spawn(game, "Grizzly Bears", B);
    pickModes(a, 0);
    pickModes(b);
    const aliceHand = hand(game, A).length;
    const bobHand = hand(game, B).length;
    toStep(game, "end");
    settle(game);
    expect(game.state.turn.number).toBe(1);
    // Alice discarded; bob declined and sacrificed his only permanent.
    expect(hand(game, A).length).toBe(aliceHand - 1);
    expect(zone(game, portal)).toBe("battlefield");
    expect(hand(game, B).length).toBe(bobHand);
    expect(zone(game, bears)).toBe("graveyard");
  });
});
