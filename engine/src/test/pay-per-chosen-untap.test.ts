/**
 * "That player may choose any number of tapped nongreen creatures they control and pay {2} for
 * each creature chosen this way. If the player does, untap those creatures" (Dream Tides,
 * Mudslide, Thelon's Curse, Magnetic Mountain): a `choose-permanents` with `payEach`. The choice
 * comes first, capped at what the chooser could pay for (rule 118.3); the whole price is paid as
 * it's answered, and the chosen creatures untap together. Choosing none is declining.
 */
import { describe, expect, it } from "vitest";

import type { ScriptedController } from "../controller.js";
import type { ObjectId } from "../primitives.js";

import { A, B, lands, spawn, table, toStep } from "./harness.js";

/** The seat chooses `pick(eligible)` and records the bounds it was offered. */
function chooseUntaps(
  seat: ScriptedController,
  pick: (eligible: readonly ObjectId[]) => readonly ObjectId[],
): { asked: number; eligible: readonly ObjectId[]; max: number } {
  const seen = { asked: 0, eligible: [] as readonly ObjectId[], max: -1 };
  seat.choosePermanentsFn = (_view, eligible, _min, max) => {
    seen.asked += 1;
    seen.eligible = eligible;
    seen.max = max;
    return pick(eligible);
  };
  return seen;
}

const tapped = (game: ReturnType<typeof table>["game"], id: ObjectId): boolean => game.state.objects[id].tapped === true;

describe("Dream Tides", () => {
  it("keeps creatures tapped through the untap step, and the upkeep player pays {2} each to untap the ones they choose", () => {
    const { game, a } = table();
    spawn(game, "Dream Tides");
    const giant = spawn(game, "Hill Giant", A, { tapped: true });
    const other = spawn(game, "Hill Giant", A, { tapped: true });
    const elves = spawn(game, "Llanowar Elves", A, { tapped: true });
    const mountains = lands(game, "Mountain", 4);
    const seen = chooseUntaps(a, () => [giant]);
    toStep(game, "precombat-main", A);
    expect(seen.asked).toBe(1);
    // Green creatures aren't offered; four lands pay for two.
    expect([...seen.eligible].sort()).toEqual([giant, other].sort());
    expect(seen.max).toBe(2);
    expect(tapped(game, giant)).toBe(false);
    expect(tapped(game, other)).toBe(true);
    expect(tapped(game, elves)).toBe(true);
    expect(mountains.filter((id) => tapped(game, id))).toHaveLength(2);
  });

  it("offers no more than could be paid for", () => {
    const { game, a } = table();
    spawn(game, "Dream Tides");
    const giants = [0, 1, 2].map(() => spawn(game, "Hill Giant", A, { tapped: true }));
    lands(game, "Mountain", 3);
    const seen = chooseUntaps(a, (eligible) => eligible.slice(0, 1));
    toStep(game, "precombat-main", A);
    expect(seen.max).toBe(1);
    expect(giants.filter((id) => !tapped(game, id))).toHaveLength(1);
  });

  it("choosing none pays nothing and untaps nothing", () => {
    const { game, a } = table();
    spawn(game, "Dream Tides");
    const giant = spawn(game, "Hill Giant", A, { tapped: true });
    const mountains = lands(game, "Mountain", 2);
    const seen = chooseUntaps(a, () => []);
    toStep(game, "precombat-main", A);
    expect(seen.asked).toBe(1);
    expect(tapped(game, giant)).toBe(true);
    expect(mountains.filter((id) => tapped(game, id))).toHaveLength(0);
  });

  it("asks each player in their own upkeep about their own creatures only", () => {
    const { game, b } = table();
    spawn(game, "Dream Tides");
    const mine = spawn(game, "Hill Giant", A, { tapped: true });
    const theirs = spawn(game, "Hill Giant", B, { tapped: true });
    lands(game, "Mountain", 2, B);
    const seen = chooseUntaps(b, () => [theirs]);
    toStep(game, "precombat-main", B);
    expect(seen.eligible).toEqual([theirs]);
    expect(tapped(game, theirs)).toBe(false);
    expect(tapped(game, mine)).toBe(true);
  });
});

describe("Mudslide and Thelon's Curse", () => {
  it("Mudslide: a flier untaps as usual, and one without flying is paid for", () => {
    const { game, a } = table();
    spawn(game, "Mudslide");
    const flier = spawn(game, "Wind Drake", A, { tapped: true });
    const giant = spawn(game, "Hill Giant", A, { tapped: true });
    lands(game, "Mountain", 2);
    const seen = chooseUntaps(a, () => [giant]);
    toStep(game, "precombat-main", A);
    expect(seen.eligible).toEqual([giant]);
    expect(tapped(game, flier)).toBe(false);
    expect(tapped(game, giant)).toBe(false);
  });

  it("Thelon's Curse: {U} each, so only blue mana counts toward how many", () => {
    const { game, a } = table();
    spawn(game, "Thelon's Curse");
    const drakes = [0, 1, 2].map(() => spawn(game, "Wind Drake", A, { tapped: true }));
    const giant = spawn(game, "Hill Giant", A, { tapped: true });
    lands(game, "Island", 2);
    lands(game, "Mountain", 3);
    const seen = chooseUntaps(a, (eligible) => eligible.slice(0, 2));
    toStep(game, "precombat-main", A);
    expect(seen.eligible).toHaveLength(3);
    expect(seen.max).toBe(2);
    expect(drakes.filter((id) => !tapped(game, id))).toHaveLength(2);
    // Not blue: it untapped in the untap step.
    expect(tapped(game, giant)).toBe(false);
  });
});
