/**
 * Cumulative upkeep paid by putting a counter on a permanent the payer
 * chooses (rule 702.24a — `cumulativeUpkeep({ putCounter, on, text })`, the
 * `putCounter` unless option with `times`): Sheltering Ancient's "Put a +1/+1
 * counter on a creature an opponent controls", once per age counter, each
 * counter chosen on its own — the same creature again or another, any
 * opponent's, hexproof or not (none is targeted) — and with no opponent's
 * creature it can't be paid, so it's sacrificed.
 */
import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";
import { B, C, counters, grant, nextTurn, pickModes, spawn, table, zone } from "./harness.js";

/** Through to alice's next upkeep, its trigger resolved. */
const toAlicesNextTurn = (game: Parameters<typeof nextTurn>[0], players = 2): void => {
  for (let i = 0; i < players; i += 1) nextTurn(game);
};

describe("Sheltering Ancient", () => {
  it("one +1/+1 counter on an opponent's creature per age counter, or it's sacrificed", () => {
    const { game, a } = table();
    const ancient = spawn(game, "Sheltering Ancient");
    const bears = spawn(game, "Grizzly Bears", B);
    pickModes(a, 0);
    a.choosePermanentsFn = (_view, eligible) => {
      expect(eligible).toEqual([bears]);
      return [bears];
    };
    toAlicesNextTurn(game);
    expect(counters(game, ancient, "age")).toBe(1);
    expect(counters(game, bears)).toBe(1);
    toAlicesNextTurn(game);
    expect(counters(game, ancient, "age")).toBe(2);
    expect(counters(game, bears)).toBe(3);
    expect(zone(game, ancient)).toBe("battlefield");
    // Declined: sacrificed, and no counters.
    pickModes(a);
    toAlicesNextTurn(game);
    expect(zone(game, ancient)).toBe("graveyard");
    expect(counters(game, bears)).toBe(3);
  });

  it("can't be paid with no creature an opponent controls: sacrificed, its own creatures untouched", () => {
    const { game, a } = table();
    const ancient = spawn(game, "Sheltering Ancient");
    const mine = spawn(game, "Grizzly Bears");
    const offered: string[][] = [];
    a.chooseModesFn = (_view, _min, _max, texts) => {
      offered.push([...texts]);
      return [0];
    };
    toAlicesNextTurn(game);
    expect(zone(game, ancient)).toBe("graveyard");
    expect(counters(game, mine)).toBe(0);
    expect(offered.flat().some((t) => /\+1\/\+1 counter/.test(t))).toBe(false);
  });

  it("each counter chosen on its own, among every opponent's creatures, hexproof ones too", () => {
    const { game, a } = table({ players: 3 });
    const ancient = spawn(game, "Sheltering Ancient");
    const bobs = spawn(game, "Grizzly Bears", B);
    const carols = spawn(game, "Grizzly Bears", C);
    grant(game, carols, "hexproof");
    pickModes(a, 0);
    const picks: ObjectId[] = [carols, carols, bobs];
    let asked = 0;
    a.choosePermanentsFn = (_view, eligible) => {
      expect([...eligible].sort()).toEqual([bobs, carols].sort());
      return [picks[asked++ % picks.length]];
    };
    // First upkeep: one counter (carol's).
    toAlicesNextTurn(game, 3);
    expect(counters(game, carols)).toBe(1);
    asked = 1;
    // Second: two counters — carol's again, then bob's.
    toAlicesNextTurn(game, 3);
    expect(counters(game, ancient, "age")).toBe(2);
    expect(counters(game, carols)).toBe(2);
    expect(counters(game, bobs)).toBe(1);
    expect(zone(game, ancient)).toBe("battlefield");
  });
});
