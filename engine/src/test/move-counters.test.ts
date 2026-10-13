/**
 * Moving counters (rule 122.5) — the `move-counters` effect — and putting a
 * departed permanent's counters on another (rules 122.8, 122.9) — the
 * `put-counters-of` effect.
 *
 * 122.5: "If an effect says to 'move' a counter, it means to remove that
 * counter from the object it's currently on and put it onto a second object.
 * If either of these actions isn't possible, it's not possible to move a
 * counter, and no counter is removed from or put onto anything." Written on
 * the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { ScriptedController } from "../controller.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  activate,
  counters,
  destroy,
  enter,
  hand,
  lands,
  pickModes,
  pickTargets,
  ref,
  settle,
  spawn,
  table,
  toStep,
  zone,
} from "./harness.js";

const setCounters = (game: Game, id: ObjectId, kinds: Record<string, number>): void => {
  game.state.objects[id].counters = { ...game.state.objects[id].counters, ...kinds };
};

/** Answer each modes question by the text of the mode to take (the first
 * containing `want`, in order), recording every question's texts. */
function pickModeTexts(seat: ScriptedController, ...wants: readonly string[]): { asked: string[][] } {
  const seen = { asked: [] as string[][] };
  const queue = [...wants];
  seat.chooseModesFn = (_view, _min, _max, texts) => {
    seen.asked.push([...texts]);
    const want = queue.shift();
    const i = want === undefined ? -1 : texts.findIndex((t) => t.includes(want));
    return i < 0 ? [] : [i];
  };
  return seen;
}

/** Answer each choose-permanents with the next of `picks` (none once they
 * run out), recording what each offered. */
function pickInTurn(seat: ScriptedController, ...picks: readonly ObjectId[]): { offered: (readonly ObjectId[])[] } {
  const seen = { offered: [] as (readonly ObjectId[])[] };
  const queue = [...picks];
  seat.choosePermanentsFn = (_view, eligible) => {
    seen.offered.push(eligible);
    const next = queue.shift();
    return next === undefined ? [] : [next];
  };
  return seen;
}

const eventsOf = (game: Game, type: string): number => game.state.eventLog.filter((e) => e.type === type).length;

describe("move a counter (Nesting Grounds)", () => {
  it("moves the one kind there without asking: removed from one, put on the other", () => {
    const { game, a } = table();
    const grounds = spawn(game, "Nesting Grounds");
    lands(game, "Wastes", 1);
    const from = spawn(game, "Grizzly Bears");
    const to = spawn(game, "Grizzly Bears", B);
    setCounters(game, from, { "+1/+1": 2 });
    const asked = pickModeTexts(a);
    const removedBefore = eventsOf(game, "counter-removed");
    activate(game, grounds, 1, { targets: [ref(from), ref(to)] });
    expect(counters(game, from)).toBe(1);
    expect(counters(game, to)).toBe(1);
    expect(asked.asked).toEqual([]);
    expect(eventsOf(game, "counter-removed")).toBe(removedBefore + 1);
    const added = game.state.eventLog.filter((e) => e.type === "counter-added").at(-1);
    expect(added).toMatchObject({ object: to, counter: "+1/+1", amount: 1, by: A });
  });

  it("asks which kind as it resolves when there are several", () => {
    const { game, a } = table();
    const grounds = spawn(game, "Nesting Grounds");
    lands(game, "Wastes", 1);
    const from = spawn(game, "Grizzly Bears");
    const to = spawn(game, "Grizzly Bears");
    setCounters(game, from, { "+1/+1": 1, flying: 1 });
    const asked = pickModeTexts(a, "flying");
    activate(game, grounds, 1, { targets: [ref(from), ref(to)] });
    expect(asked.asked).toEqual([["Move a +1/+1 counter", "Move a flying counter"]]);
    expect(counters(game, to, "flying")).toBe(1);
    expect(counters(game, from, "flying")).toBe(0);
    expect(counters(game, from)).toBe(1);
  });

  it("the put is a put: a counter replacement applies to it (Doubling Season)", () => {
    const { game } = table();
    spawn(game, "Doubling Season");
    const grounds = spawn(game, "Nesting Grounds");
    lands(game, "Wastes", 1);
    const from = spawn(game, "Grizzly Bears");
    const to = spawn(game, "Grizzly Bears");
    setCounters(game, from, { "+1/+1": 1 });
    activate(game, grounds, 1, { targets: [ref(from), ref(to)] });
    expect(counters(game, from)).toBe(0);
    expect(counters(game, to)).toBe(2);
  });

  it("moves nothing between a permanent and itself (rule 122.5)", () => {
    const { game } = table();
    const grounds = spawn(game, "Nesting Grounds");
    lands(game, "Wastes", 1);
    const bears = spawn(game, "Grizzly Bears");
    setCounters(game, bears, { "+1/+1": 1 });
    const removedBefore = eventsOf(game, "counter-removed");
    activate(game, grounds, 1, { targets: [ref(bears), ref(bears)] });
    expect(counters(game, bears)).toBe(1);
    expect(eventsOf(game, "counter-removed")).toBe(removedBefore);
  });

  it("removes nothing when the second target has gone (rule 122.5, the ruling)", () => {
    const { game } = table();
    const grounds = spawn(game, "Nesting Grounds");
    lands(game, "Wastes", 1);
    const from = spawn(game, "Grizzly Bears");
    const to = spawn(game, "Grizzly Bears", B);
    setCounters(game, from, { "+1/+1": 1 });
    activate(game, grounds, 1, { targets: [ref(from), ref(to)], settle: false });
    destroy(game, to);
    settle(game);
    expect(zone(game, to)).toBe("graveyard");
    expect(counters(game, from)).toBe(1);
  });
});

describe("move all counters (The Ozolith)", () => {
  it("collects a departed creature's counters, then moves every one onto a target", () => {
    const { game, a } = table({ step: "upkeep" });
    const ozolith = spawn(game, "The Ozolith");
    const bears = spawn(game, "Grizzly Bears");
    setCounters(game, bears, { "+1/+1": 2, flying: 1, "-1/-1": 0 });
    destroy(game, bears);
    expect(counters(game, ozolith)).toBe(2);
    expect(counters(game, ozolith, "flying")).toBe(1);

    const target = spawn(game, "Grizzly Bears");
    pickTargets(a, target);
    pickModes(a, 0);
    toStep(game, "begin-combat");
    settle(game);
    expect(counters(game, target)).toBe(2);
    expect(counters(game, target, "flying")).toBe(1);
    expect(game.state.objects[ozolith].counters).toEqual({});
  });
});

describe("move any number (Resourceful Defense, Goldberry)", () => {
  it("asks how many of each kind, none included", () => {
    const { game, a } = table();
    const defense = spawn(game, "Resourceful Defense");
    lands(game, "Plains", 5);
    const from = spawn(game, "Grizzly Bears");
    const to = spawn(game, "Grizzly Bears");
    setCounters(game, from, { "+1/+1": 3, flying: 1 });
    const asked = pickModeTexts(a, "Move 2 +1/+1", "no flying");
    activate(game, defense, 0, { targets: [ref(from), ref(to)] });
    expect(asked.asked).toEqual([
      ["Move no +1/+1 counters", "Move a +1/+1 counter", "Move 2 +1/+1 counters", "Move 3 +1/+1 counters"],
      ["Move no flying counters", "Move a flying counter"],
    ]);
    expect(counters(game, to)).toBe(2);
    expect(counters(game, from)).toBe(1);
    expect(counters(game, to, "flying")).toBe(0);
  });

  it("'one or more': none isn't offered last, and a card is drawn only if one moved", () => {
    const { game, a } = table();
    const goldberry = spawn(game, "Goldberry, River-Daughter");
    lands(game, "Island", 1);
    const other = spawn(game, "Grizzly Bears");
    setCounters(game, goldberry, { "+1/+1": 1 });
    const asked = pickModeTexts(a, "a +1/+1");
    const before = hand(game).length;
    activate(game, goldberry, 1, { targets: [ref(other)] });
    // One choice only (a single +1/+1 counter, at least one): not asked.
    expect(asked.asked).toEqual([]);
    expect(counters(game, other)).toBe(1);
    expect(hand(game).length).toBe(before + 1);
  });

  it("with nothing on Goldberry, nothing moves and nothing is drawn", () => {
    const { game } = table();
    const goldberry = spawn(game, "Goldberry, River-Daughter");
    lands(game, "Island", 1);
    const other = spawn(game, "Grizzly Bears");
    const before = hand(game).length;
    activate(game, goldberry, 1, { targets: [ref(other)] });
    expect(hand(game).length).toBe(before);
  });

  it("a counter of each kind the target has and Goldberry hasn't", () => {
    const { game } = table();
    const goldberry = spawn(game, "Goldberry, River-Daughter");
    const other = spawn(game, "Grizzly Bears");
    setCounters(game, goldberry, { "+1/+1": 1 });
    setCounters(game, other, { "+1/+1": 2, flying: 2, lifelink: 1 });
    activate(game, goldberry, 0, { targets: [ref(other)] });
    expect(game.state.objects[goldberry].counters).toEqual({ "+1/+1": 1, flying: 1, lifelink: 1 });
    expect(game.state.objects[other].counters).toEqual({ "+1/+1": 2, flying: 1 });
  });
});

describe("move any number with a chosen end", () => {
  it("onto chosen creatures, one at a time and never itself (Forgotten Ancient)", () => {
    const { game, a } = table();
    const ancient = spawn(game, "Forgotten Ancient");
    const x = spawn(game, "Grizzly Bears");
    const y = spawn(game, "Grizzly Bears", B);
    setCounters(game, ancient, { "+1/+1": 3 });
    const picks = pickInTurn(a, x, y);
    const asked = pickModeTexts(a, "Move 2", "a +1/+1");
    toStep(game, "upkeep");
    settle(game);
    expect(counters(game, x)).toBe(2);
    expect(counters(game, y)).toBe(1);
    expect(counters(game, ancient)).toBe(0);
    // Never itself; the second time, not the creature already chosen. With
    // one counter left onto the second, nothing to ask; with none left, no
    // third choice.
    expect(picks.offered.length).toBe(2);
    expect(picks.offered[0]).not.toContain(ancient);
    expect(picks.offered[1]).not.toContain(x);
    expect(asked.asked).toEqual([["Move a +1/+1 counter", "Move 2 +1/+1 counters", "Move 3 +1/+1 counters"]]);
  });

  it("choosing none moves nothing", () => {
    const { game, a } = table();
    const ancient = spawn(game, "Forgotten Ancient");
    spawn(game, "Grizzly Bears");
    setCounters(game, ancient, { "+1/+1": 2 });
    pickInTurn(a);
    toStep(game, "upkeep");
    settle(game);
    expect(counters(game, ancient)).toBe(2);
  });

  it("from among chosen creatures onto the target, never the target itself (Slippery Bogbonder)", () => {
    const { game, a } = table();
    const p = spawn(game, "Grizzly Bears");
    const q = spawn(game, "Grizzly Bears");
    const target = spawn(game, "Grizzly Bears");
    setCounters(game, p, { "+1/+1": 2 });
    setCounters(game, q, { flying: 1 });
    setCounters(game, target, { "+1/+1": 1 });
    pickTargets(a, target);
    const picks = pickInTurn(a, p, q);
    pickModeTexts(a, "Move 2", "a flying");
    enter(game, "Slippery Bogbonder");
    expect(picks.offered[0]).not.toContain(target);
    expect(picks.offered[0]).toEqual(expect.arrayContaining([p, q]));
    expect(picks.offered[1]).not.toContain(p);
    expect(counters(game, target)).toBe(3);
    expect(counters(game, target, "hexproof")).toBe(1);
    expect(counters(game, target, "flying")).toBe(1);
    expect(counters(game, p)).toBe(0);
    expect(counters(game, q, "flying")).toBe(0);
  });
});

describe("put a departed permanent's counters on another (rule 122.8)", () => {
  it("each kind it died with, -1/-1 counters too — and The Ozolith gets the same set", () => {
    const { game, a } = table();
    const ozolith = spawn(game, "The Ozolith");
    const apprentice = spawn(game, "Iron Apprentice");
    const target = spawn(game, "Grizzly Bears");
    setCounters(game, apprentice, { "+1/+1": 3, "-1/-1": 1, flying: 1 });
    pickTargets(a, target);
    destroy(game, apprentice);
    // Not a move: both get the full set (the rulings).
    expect(counters(game, target, "+1/+1") - counters(game, target, "-1/-1")).toBe(2);
    expect(counters(game, target, "flying")).toBe(1);
    expect(counters(game, ozolith, "flying")).toBe(1);
    expect(counters(game, ozolith, "+1/+1") - counters(game, ozolith, "-1/-1")).toBe(2);
  });
});
