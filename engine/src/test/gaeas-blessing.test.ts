/**
 * Gaea's Blessing, on existing machinery: Witness the Future's spell (the
 * target player's own cards, up to three) and Narcomoeba's mill trigger, which
 * works from the graveyard the card was put into.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

import { A, B, cast, graveyard, hand, lands, ref, settle, table, toGraveyard, toHand, toLibrary, zone } from "./harness.js";

const library = (game: Game, p: PlayerId = A): readonly ObjectId[] => game.state.zones.perPlayer[p].library;

describe("Gaea's Blessing", () => {
  it("the target player shuffles up to three of their graveyard's cards into their library, and you draw", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const blessing = toHand(game, "Gaea's Blessing");
    const bears = toGraveyard(game, "Grizzly Bears", B);
    const giant = toGraveyard(game, "Hill Giant", B);
    const stays = toGraveyard(game, "Shock", B);
    const held = hand(game).length;
    const before = library(game, B).length;
    cast(game, blessing, { targets: [ref(B), ref(bears), ref(giant)] });
    expect(zone(game, bears)).toBe("library");
    expect(zone(game, giant)).toBe("library");
    expect(zone(game, stays)).toBe("graveyard");
    expect(library(game, B).length).toBe(before + 2);
    // The spell left the hand, a card came.
    expect(hand(game).length).toBe(held);
    expect(zone(game, blessing)).toBe("graveyard");
  });

  it("with no cards chosen it still resolves: you draw", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const blessing = toHand(game, "Gaea's Blessing");
    const held = hand(game).length;
    const before = library(game).length;
    cast(game, blessing, { targets: [ref(A)] });
    expect(hand(game).length).toBe(held);
    expect(library(game).length).toBe(before - 1);
  });

  it("takes cards only from the target player's graveyard, and at most three", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const blessing = toHand(game, "Gaea's Blessing");
    const mine = toGraveyard(game, "Grizzly Bears", A);
    const theirs = [1, 2, 3, 4].map(() => toGraveyard(game, "Hill Giant", B));
    expect(() => cast(game, blessing, { targets: [ref(B), ref(mine)] })).toThrow();
    expect(() => cast(game, blessing, { targets: [ref(B), ...theirs.map(ref)] })).toThrow();
  });

  it("milled, shuffles its owner's whole graveyard (itself too) into their library", () => {
    const { game } = table();
    const bears = toGraveyard(game, "Grizzly Bears");
    const giant = toGraveyard(game, "Hill Giant");
    const theirs = toGraveyard(game, "Shock", B);
    toLibrary(game, "Shock");
    const blessing = toLibrary(game, "Gaea's Blessing");
    const before = library(game).length;
    // Two at once: the other milled card is there to be shuffled back too.
    game.debugApplyEffect(A, { kind: "mill", target: 0, amount: 2 }, [ref(A)]);
    settle(game);
    expect(graveyard(game)).toHaveLength(0);
    expect(library(game).length).toBe(before + 2);
    expect(zone(game, blessing)).toBe("library");
    expect(zone(game, bears)).toBe("library");
    expect(zone(game, giant)).toBe("library");
    expect(zone(game, theirs)).toBe("graveyard");
  });

  it("an opponent's mill triggers it for its owner", () => {
    const { game } = table();
    const bears = toGraveyard(game, "Grizzly Bears", B);
    const mine = toGraveyard(game, "Hill Giant", A);
    toLibrary(game, "Gaea's Blessing", B);
    game.debugApplyEffect(A, { kind: "mill", target: 0, amount: 1 }, [ref(B)]);
    settle(game);
    expect(graveyard(game, B)).toHaveLength(0);
    expect(zone(game, bears)).toBe("library");
    expect(zone(game, mine)).toBe("graveyard");
  });

  it("doesn't trigger from anywhere but the library", () => {
    const { game } = table();
    const bears = toGraveyard(game, "Grizzly Bears");
    lands(game, "Forest", 2);
    const blessing = toHand(game, "Gaea's Blessing");
    // Resolved, it goes to the graveyard from the stack.
    cast(game, blessing, { targets: [ref(B)] });
    expect(zone(game, blessing)).toBe("graveyard");
    expect(zone(game, bears)).toBe("graveyard");
  });
});
