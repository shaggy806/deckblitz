/**
 * `others-enter-battlefield`'s `enterAs` — Master Biomancer: "each other
 * creature you control enters with a number of additional +1/+1 counters on
 * it equal to this creature's power and as a Mutant in addition to its other
 * types".
 */
import { describe, expect, it } from "vitest";

import { B, cast, counters, destroy, enter, lands, named, spawn, subtypes, table, toHand } from "./harness.js";

describe("Master Biomancer", () => {
  it("another creature enters with counters equal to its power, and as a Mutant", () => {
    const { game } = table();
    spawn(game, "Master Biomancer");
    const bears = enter(game, "Grizzly Bears");
    expect(counters(game, bears)).toBe(2);
    expect(subtypes(game, bears)).toContain("Mutant");
    expect(subtypes(game, bears)).toContain("Bear");
  });

  it("stays a Mutant after the Biomancer leaves; an opponent's creature isn't touched", () => {
    const { game } = table();
    const biomancer = spawn(game, "Master Biomancer");
    const bears = enter(game, "Grizzly Bears");
    const theirs = enter(game, "Grizzly Bears", B);
    destroy(game, biomancer);
    expect(subtypes(game, bears)).toContain("Mutant");
    expect(subtypes(game, theirs)).not.toContain("Mutant");
    expect(counters(game, theirs)).toBe(0);
  });

  it("a second Biomancer enters bigger itself, and creature tokens are Mutants as they're made", () => {
    const { game } = table();
    spawn(game, "Master Biomancer");
    const second = spawn(game, "Master Biomancer");
    // The first one's replacement grew the second: 2 counters, power 4.
    expect(counters(game, second)).toBe(2);
    lands(game, "Plains", 2);
    cast(game, toHand(game, "Raise the Alarm"));
    const soldiers = named(game, "Soldier Token");
    expect(soldiers.length).toBeGreaterThan(0);
    for (const id of soldiers) {
      expect(counters(game, id)).toBe(6);
      expect(subtypes(game, id)).toContain("Mutant");
    }
  });
});
