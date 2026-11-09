/**
 * Ulamog's Despoiler (`AsEntersAction.putFromExile`): an optional non-mana
 * cost paid as a permanent enters (rule 614.12a: chosen before it enters) —
 * two cards or none, and the counters only if done.
 */

import { describe, expect, it } from "vitest";

import { A, B, cast, counters, graveyard, lands, pickFromZone, table, toExile, toHand, zone } from "./harness.js";

function withDespoiler(exiled: readonly [number, number]) {
  const { game, a } = table();
  lands(game, "Wastes", 6);
  const theirs = Array.from({ length: exiled[0] }, () => toExile(game, "Grizzly Bears", B));
  const mine = Array.from({ length: exiled[1] }, () => toExile(game, "Grizzly Bears", A));
  const despoiler = toHand(game, "Ulamog's Despoiler");
  return { game, a, theirs, mine, despoiler };
}

describe("Ulamog's Despoiler: you may put two cards from exile as it enters", () => {
  it("done: both go to their owner's graveyard and it enters with four counters", () => {
    const { game, a, theirs, mine, despoiler } = withDespoiler([3, 1]);
    const seen = pickFromZone(a, theirs[0], theirs[2]);
    cast(game, despoiler);
    expect(seen.offered).toEqual(expect.arrayContaining(theirs));
    expect(seen.offered).not.toContain(mine[0]);
    expect(graveyard(game, B)).toEqual(expect.arrayContaining([theirs[0], theirs[2]]));
    expect(zone(game, theirs[1])).toBe("exile");
    expect(zone(game, despoiler)).toBe("battlefield");
    expect(counters(game, despoiler)).toBe(4);
  });

  it("declined with no cards, or with fewer than two: nothing moves and no counters", () => {
    for (const picks of [0, 1]) {
      const { game, a, theirs, despoiler } = withDespoiler([2, 0]);
      pickFromZone(a, ...theirs.slice(0, picks));
      cast(game, despoiler);
      expect(theirs.map((id) => zone(game, id))).toEqual(["exile", "exile"]);
      expect(zone(game, despoiler)).toBe("battlefield");
      expect(counters(game, despoiler)).toBe(0);
    }
  });

  it("with fewer than two of an opponent's cards in exile, nothing is asked", () => {
    const { game, a, despoiler, theirs } = withDespoiler([1, 3]);
    const seen = pickFromZone(a);
    cast(game, despoiler);
    expect(seen.offered).toEqual([]);
    expect(zone(game, theirs[0])).toBe("exile");
    expect(zone(game, despoiler)).toBe("battlefield");
    expect(counters(game, despoiler)).toBe(0);
  });
});
