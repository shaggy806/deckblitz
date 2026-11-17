/**
 * Cumulative upkeep paid by an act on a different permanent for each age
 * counter (rule 702.24a — `cumulativeUpkeep({ choose, then, text })`, a
 * `doing` of a `choose-permanents` of that many): Herald of Leshrac's "Gain
 * control of a land you don't control", the lands chosen as it resolves (none
 * targeted), a different one for each counter, kept for good — and with fewer
 * lands it doesn't control than age counters it can't be paid at all, so it's
 * sacrificed (no partial payments). Its +1/+1 per land it controls but doesn't
 * own, and its leaves-the-battlefield trigger handing every such land back to
 * its owner, however it was taken.
 */
import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";
import { A, B, C, controller, counters, destroy, lands, nextTurn, pickModes, pt, spawn, table, zone } from "./harness.js";

/** Through to alice's next upkeep, its trigger resolved. */
const toAlicesNextTurn = (game: Parameters<typeof nextTurn>[0], players = 2): void => {
  for (let i = 0; i < players; i += 1) nextTurn(game);
};

describe("Herald of Leshrac", () => {
  it("gains control of a different land it doesn't control per age counter, and grows with them", () => {
    const { game, a } = table();
    const herald = spawn(game, "Herald of Leshrac");
    const bobs = lands(game, "Swamp", 4, B);
    const mine = lands(game, "Swamp", 1);
    expect(pt(game, herald)).toEqual({ power: 2, toughness: 4 });
    pickModes(a, 0);
    const asked: { eligible: readonly ObjectId[]; min: number; max: number }[] = [];
    const picks = [[bobs[0]], [bobs[1], bobs[2]]];
    a.choosePermanentsFn = (_view, eligible, min, max) => {
      asked.push({ eligible: [...eligible], min, max });
      return picks[asked.length - 1];
    };
    toAlicesNextTurn(game);
    expect(counters(game, herald, "age")).toBe(1);
    expect(controller(game, bobs[0])).toBe(A);
    expect(pt(game, herald)).toEqual({ power: 3, toughness: 5 });
    // Its own land isn't one it doesn't control.
    expect(asked[0].eligible).not.toContain(mine[0]);
    toAlicesNextTurn(game);
    expect(counters(game, herald, "age")).toBe(2);
    // Two at once, among the three it doesn't control yet.
    expect(asked[1]).toMatchObject({ min: 2, max: 2 });
    expect([...asked[1].eligible].sort()).toEqual([bobs[1], bobs[2], bobs[3]].sort());
    expect([bobs[0], bobs[1], bobs[2]].map((id) => controller(game, id))).toEqual([A, A, A]);
    expect(controller(game, bobs[3])).toBe(B);
    expect(pt(game, herald)).toEqual({ power: 5, toughness: 7 });
    expect(zone(game, herald)).toBe("battlefield");
  });

  it("can't be paid with fewer lands it doesn't control than age counters: sacrificed, and the lands go home", () => {
    const { game, a } = table();
    const herald = spawn(game, "Herald of Leshrac");
    const bobs = lands(game, "Swamp", 2, B);
    a.choosePermanentsFn = () => [bobs[0]];
    const offered: string[][] = [];
    a.chooseModesFn = (_view, _min, _max, texts) => {
      offered.push([...texts]);
      return [0];
    };
    toAlicesNextTurn(game);
    expect(controller(game, bobs[0])).toBe(A);
    expect(offered[0].some((t) => /Gain control of a land/.test(t))).toBe(true);
    // Two age counters, one land it doesn't control: no partial payment, so
    // nothing to choose — not even asked.
    toAlicesNextTurn(game);
    expect(offered.slice(1).flat().some((t) => /Gain control of a land/.test(t))).toBe(false);
    expect(zone(game, herald)).toBe("graveyard");
    expect(controller(game, bobs[1])).toBe(B);
    // It left: bob gains control of his land again.
    expect(controller(game, bobs[0])).toBe(B);
  });

  it("leaving hands back every land its controller has but doesn't own, to each owner, however it was taken", () => {
    const { game } = table({ players: 3 });
    const herald = spawn(game, "Herald of Leshrac");
    const bobs = lands(game, "Swamp", 1, B);
    const carols = lands(game, "Swamp", 1, C);
    const mine = lands(game, "Swamp", 1);
    // Taken some other way: a lasting control change of alice's.
    for (const land of [bobs[0], carols[0]]) {
      game.debugApplyEffect(A, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [{ kind: "object", object: land }]);
    }
    expect(pt(game, herald)).toEqual({ power: 4, toughness: 6 });
    destroy(game, herald);
    expect(zone(game, herald)).toBe("graveyard");
    expect(controller(game, bobs[0])).toBe(B);
    expect(controller(game, carols[0])).toBe(C);
    expect(controller(game, mine[0])).toBe(A);
  });
});
