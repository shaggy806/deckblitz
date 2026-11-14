/**
 * An entering replacement whose "enters tapped" reads the X the permanent was
 * cast with (rule 107.3m): Slumbering Trudge's "This creature enters with a
 * number of stun counters on it equal to three minus X. If X is 2 or less, it
 * enters tapped." — `tappedUnless` an `x` condition, given that X (0 when it
 * wasn't cast, the ruling).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { cast, counters, lands, named, table, toHand } from "./harness.js";

function trudgeFor(game: Game, x: number): ObjectId {
  lands(game, "Forest", x + 1);
  cast(game, toHand(game, "Slumbering Trudge"), { x });
  const [trudge] = named(game, "Slumbering Trudge");
  if (trudge === undefined) throw new Error("no Trudge");
  return trudge;
}

describe("Slumbering Trudge", () => {
  it.each([
    [0, 3, true],
    [2, 1, true],
    [3, 0, false],
    [5, 0, false],
  ] as const)("cast for X=%i: %i stun counters, tapped %s", (x, stun, tapped) => {
    const { game } = table();
    const trudge = trudgeFor(game, x);
    expect(counters(game, trudge, "stun")).toBe(stun);
    expect(game.state.objects[trudge].tapped).toBe(tapped);
  });

  it("put onto the battlefield without being cast, X is 0: three stun counters, tapped", () => {
    const { game } = table();
    const card = toHand(game, "Slumbering Trudge");
    game.debugMove(card, "battlefield");
    const [trudge] = named(game, "Slumbering Trudge");
    expect(counters(game, trudge, "stun")).toBe(3);
    expect(game.state.objects[trudge].tapped).toBe(true);
  });
});
