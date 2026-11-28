/**
 * Discarding cards by the names in a hand: `CardFilter.sameNameAsSplicedOnto`
 * (the cards spliced onto a target spell, 702.47 — Minamo's Meddling) and
 * `sameNameAsAnotherInZone` (another card in the same hand, 201.2a — Hint of
 * Insanity), both read by `discard-hand` over the whole hand at once.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, C, cast, graveyard, hand, lands, nextTurn, ref, table, toHand } from "./harness.js";

describe("Minamo's Meddling: discard each card named like one spliced onto the countered spell", () => {
  /** On Bob's turn he casts Desperate Ritual, spliced with Spiritual Visit
   * when `splice`, and Alice gets priority with it on the stack. */
  const bobCasts = (game: Game, splice: boolean): { ritual: ObjectId; visit: ObjectId } => {
    lands(game, "Mountain", 2, B);
    lands(game, "Plains", 1, B);
    const ritual = toHand(game, "Desperate Ritual", B);
    const visit = toHand(game, "Spiritual Visit", B);
    game.advanceUntil((s) => s.priority.holder === B || s.result.over);
    game.dispatch({ type: "cast-spell", player: B, card: ritual, targets: [], ...(splice ? { splice: [visit] } : {}) });
    game.advanceUntil((s) => (s.priority.holder === A && s.zones.shared.stack.length > 0) || s.result.over);
    return { ritual, visit };
  };

  it("counters it; the spliced card and its namesake go, the rest of the hand stays, revealed to all", () => {
    const { game } = table({ players: 3, openingHandSize: 0 });
    nextTurn(game);
    const bears = toHand(game, "Grizzly Bears", B);
    const second = toHand(game, "Spiritual Visit", B);
    // Not yet revealed: Carol can't see Bob's hand.
    expect(game.viewFor(C).objects[bears]?.cardName).toBeUndefined();
    const { ritual, visit } = bobCasts(game, true);
    const drawn = hand(game, B).filter((id) => id !== bears && id !== second && id !== visit);
    lands(game, "Island", 4);
    cast(game, toHand(game, "Minamo's Meddling"), { targets: [ref(ritual)] });
    expect(graveyard(game, B)).toEqual(expect.arrayContaining([ritual, visit, second]));
    expect([...hand(game, B)].sort()).toEqual([bears, ...drawn].sort());
    // The whole hand was revealed (701.20a): Carol has seen Bob's Bears.
    expect(game.viewFor(C).objects[bears]?.cardName).toBe("Grizzly Bears");
  });

  it("nothing spliced: the spell is countered and nothing is discarded", () => {
    const { game } = table({ openingHandSize: 0 });
    nextTurn(game);
    const { ritual, visit } = bobCasts(game, false);
    const before = [...hand(game, B)];
    expect(before).toContain(visit);
    lands(game, "Island", 4);
    cast(game, toHand(game, "Minamo's Meddling"), { targets: [ref(ritual)] });
    expect(graveyard(game, B)).toContain(ritual);
    expect(hand(game, B)).toEqual(before);
  });
});

describe("Hint of Insanity: discard all nonland cards sharing a name with another card in hand", () => {
  it("both copies go, a lone card and duplicate lands stay", () => {
    const { game } = table({ players: 3, openingHandSize: 0 });
    const bears = [toHand(game, "Grizzly Bears", B), toHand(game, "Grizzly Bears", B)];
    const elves = toHand(game, "Llanowar Elves", B);
    const forests = [toHand(game, "Forest", B), toHand(game, "Forest", B)];
    expect(game.viewFor(C).objects[elves]?.cardName).toBeUndefined();
    lands(game, "Swamp", 3);
    cast(game, toHand(game, "Hint of Insanity"), { targets: [ref(B)] });
    expect(graveyard(game, B)).toEqual(expect.arrayContaining(bears));
    expect([...hand(game, B)].sort()).toEqual([elves, ...forests].sort());
    expect(game.viewFor(C).objects[elves]?.cardName).toBe("Llanowar Elves");
  });

  it("no two cards share a name: nothing is discarded", () => {
    const { game } = table({ openingHandSize: 0 });
    const kept = [toHand(game, "Grizzly Bears", B), toHand(game, "Llanowar Elves", B)];
    lands(game, "Swamp", 3);
    cast(game, toHand(game, "Hint of Insanity"), { targets: [ref(B)] });
    expect(hand(game, B)).toEqual(kept);
  });
});
