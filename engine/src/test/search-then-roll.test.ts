/**
 * A search whose finds wait for a die roll to say where they go —
 * `search-library` with `destination: "stay"`, `shufflesLater` and
 * `thenAlways`, its `then` a `roll-dice` whose rows move the finds (its
 * targets): Druid of the Emerald Grove's "search your library for up to two
 * basic land cards and reveal them, then roll a d20. 9 or less | Put those
 * cards into your hand, then shuffle. 10—19 | Put one of those cards onto the
 * battlefield tapped and the other into your hand, then shuffle. 20+ | Put
 * those cards onto the battlefield tapped, then shuffle."
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { lastRollIn } from "../random-results.js";
import { A, enter, hand, table } from "./harness.js";

const library = (game: Game): readonly ObjectId[] => game.state.zones.perPlayer[A].library;

/** Druid enters on a table of `seed`, finding a Forest and an Island put on
 * top of the library (`find` of them: both, the Forest alone, or none), and
 * taking the Island where it chooses one of them. */
function druid(seed: number, find: 0 | 1 | 2 = 2) {
  const { game, a } = table({ seed });
  // Only these basics in the library, so what's found is what's chosen.
  for (const id of [...library(game)]) {
    if (game.state.objects[id].cardName === "Forest" || game.state.objects[id].cardName === "Island") game.debugMove(id, "exile");
  }
  const forest = game.debugSpawn("Forest", A, "library");
  const island = game.debugSpawn("Island", A, "library");
  const offers: { eligible: readonly ObjectId[]; max: number; seen: readonly (string | undefined)[] }[] = [];
  a.chooseFromZoneFn = (_view, eligible, _min, max) => {
    // What the chooser's seat is shown of each card offered (a revealed
    // find is known by name, though it's in the library).
    offers.push({ eligible, max, seen: eligible.map((id) => game.viewFor(A).objects[id]?.cardName) });
    if (offers.length === 1) return find === 2 ? [forest, island] : find === 1 ? [forest] : [];
    return eligible.includes(island) ? [island] : eligible.slice(0, 1);
  };
  const since = game.state.eventSeq;
  enter(game, "Druid of the Emerald Grove");
  const roll = lastRollIn(game.state, A);
  const shuffled = game.state.eventLog.filter((e) => e.seq >= since && e.type === "library-shuffled").length;
  return { game, forest, island, total: roll?.total, offers, shuffled };
}

/** The first seed whose roll lands in [lo, hi]. */
function seedRolling(lo: number, hi: number, find: 0 | 1 | 2 = 2): number {
  for (let seed = 1; seed <= 400; seed += 1) {
    const { total } = druid(seed, find);
    if (total !== undefined && total >= lo && total <= hi) return seed;
  }
  throw new Error(`no seed rolled ${lo}-${hi}`);
}

describe("Druid of the Emerald Grove", () => {
  it("9 or less: both basic lands into your hand, then shuffle", () => {
    const { game, forest, island, total, shuffled } = druid(seedRolling(1, 9));
    expect(total).toBeLessThanOrEqual(9);
    expect(hand(game)).toEqual(expect.arrayContaining([forest, island]));
    expect(shuffled).toBeGreaterThanOrEqual(1);
  });

  it("10—19: one of your choice onto the battlefield tapped, the other into your hand", () => {
    const { game, forest, island, total, offers } = druid(seedRolling(10, 19));
    expect(total).toBeGreaterThanOrEqual(10);
    expect(total).toBeLessThanOrEqual(19);
    // The search, then the choice of one between the two finds.
    expect(offers).toHaveLength(2);
    expect([...offers[1].eligible].sort()).toEqual([forest, island].sort());
    expect(offers[1].max).toBe(1);
    expect([...offers[1].seen].sort()).toEqual(["Forest", "Island"]);
    expect(game.state.objects[island].zone).toBe("battlefield");
    expect(game.state.objects[island].tapped).toBe(true);
    expect(game.state.objects[forest].zone).toBe("hand");
  });

  it("10—19 with one land found: it goes onto the battlefield tapped", () => {
    const { game, forest, island, total } = druid(seedRolling(10, 19, 1), 1);
    expect(total).toBeGreaterThanOrEqual(10);
    expect(game.state.objects[forest].zone).toBe("battlefield");
    expect(game.state.objects[forest].tapped).toBe(true);
    expect(game.state.objects[island].zone).toBe("library");
  });

  it("20: both onto the battlefield tapped", () => {
    const { game, forest, island, total } = druid(seedRolling(20, 20));
    expect(total).toBe(20);
    for (const id of [forest, island]) {
      expect(game.state.objects[id].zone).toBe("battlefield");
      expect(game.state.objects[id].tapped).toBe(true);
    }
  });

  it("the d20 is rolled and the library shuffled though nothing is found", () => {
    const { game, forest, island, total, shuffled } = druid(1, 0);
    expect(total).toBeGreaterThanOrEqual(1);
    expect(shuffled).toBeGreaterThanOrEqual(1);
    expect(game.state.objects[forest].zone).toBe("library");
    expect(game.state.objects[island].zone).toBe("library");
  });

  it("the finds stay in the library until the roll moves them, and are revealed", () => {
    const { game, forest, island } = druid(seedRolling(1, 9));
    expect(game.state.eventLog.some((e) => e.type === "cards-revealed" && e.objects.includes(forest) && e.objects.includes(island))).toBe(
      true,
    );
  });
});
