/**
 * Recheck batch 88, part b (2026-10-16): top-5000 cards whose blockers have been built since triage.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  cast,
  counters,
  enter,
  hand,
  keywords,
  lands,
  named,
  pickModes,
  pt,
  settle,
  spawn,
  subtypes,
  table,
  toHand,
  toStep,
  types,
  watchTargets,
  zone,
} from "./harness.js";

const plusOne = (game: Game, id: ObjectId, amount = 1, counter = "+1/+1"): void =>
  game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter, amount }, [{ kind: "object", object: id }]);

/** Through alice's end step, its triggers resolved. */
const throughEndStep = (game: Game): void => {
  toStep(game, "end");
  settle(game);
};

describe("High Score", () => {
  it("puts one more +1/+1 counter on a creature you control, not on a noncreature or an opponent's", () => {
    const { game } = table();
    spawn(game, "High Score");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    const forest = spawn(game, "Forest");
    plusOne(game, bears, 2);
    expect(counters(game, bears)).toBe(3);
    plusOne(game, theirs);
    expect(counters(game, theirs)).toBe(1);
    plusOne(game, forest);
    expect(counters(game, forest)).toBe(1);
    // Other kinds aren't touched.
    plusOne(game, bears, 1, "-1/-1");
    expect(counters(game, bears, "-1/-1")).toBe(1);
  });

  it("a creature entering with +1/+1 counters enters with one more (the ruling)", () => {
    const { game } = table();
    spawn(game, "High Score");
    lands(game, "Wastes", 2);
    const ballista = toHand(game, "Walking Ballista");
    cast(game, ballista, { x: 1 });
    expect(counters(game, ballista)).toBe(2);
  });

  it("draws at your end step when you control the greatest power", () => {
    const { game } = table();
    spawn(game, "High Score");
    spawn(game, "Hill Giant");
    spawn(game, "Grizzly Bears", B);
    const before = hand(game).length;
    throughEndStep(game);
    expect(hand(game).length).toBe(before + 1);
  });

  it("draws when tied for the greatest power", () => {
    const { game } = table();
    spawn(game, "High Score");
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears", B);
    const before = hand(game).length;
    throughEndStep(game);
    expect(hand(game).length).toBe(before + 1);
  });

  it("doesn't draw when an opponent's creature is bigger, or you control none", () => {
    const { game } = table();
    spawn(game, "High Score");
    spawn(game, "Grizzly Bears");
    spawn(game, "Hill Giant", B);
    const before = hand(game).length;
    throughEndStep(game);
    expect(hand(game).length).toBe(before);
  });
});

describe("Solid Ground", () => {
  it("earthbends 3 as it enters, and its own replacement makes that four counters", () => {
    const { game } = table();
    const forest = spawn(game, "Forest");
    enter(game, "Solid Ground");
    expect(types(game, forest)).toContain("creature");
    expect(types(game, forest)).toContain("land");
    expect(counters(game, forest)).toBe(4);
    expect(pt(game, forest)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, forest).has("haste")).toBe(true);
  });

  it("adds one to +1/+1 counters on any permanent you control, not an opponent's, nor other kinds", () => {
    const { game } = table();
    spawn(game, "Solid Ground");
    const forest = spawn(game, "Forest");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    plusOne(game, forest);
    expect(counters(game, forest)).toBe(2);
    plusOne(game, bears, 2);
    expect(counters(game, bears)).toBe(3);
    plusOne(game, theirs);
    expect(counters(game, theirs)).toBe(1);
    plusOne(game, bears, 1, "-1/-1");
    expect(counters(game, bears, "-1/-1")).toBe(1);
  });
});

describe("Bolg of the North", () => {
  /** Alice says yes to the sacrifice, sacrifices `victim`, and targets `target`. */
  const answer = (t: ReturnType<typeof table>, victim: ObjectId, target: ObjectId) => {
    pickModes(t.a, 0);
    t.a.chooseSacrificesFn = () => [victim];
    return watchTargets(t.a, () => [target]);
  };

  it("deals the sacrificed creature's power to another creature and amasses Goblins equal to the excess", () => {
    const t = table();
    const { game } = t;
    const wurm = spawn(game, "Craw Wurm");
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    const seen = answer(t, wurm, bears);
    const bolg = enter(game, "Bolg of the North");
    expect(zone(game, wurm)).toBe("graveyard");
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, giant)).toBe("battlefield");
    // "Another target creature", chosen after the sacrifice: never Bolg,
    // nor the creature already sacrificed.
    expect(seen.asked).toBe(1);
    expect(seen.offered[0]).toEqual(expect.arrayContaining([bears, giant]));
    expect(seen.offered[0]).not.toContain(bolg);
    expect(seen.offered[0]).not.toContain(wurm);
    // 6 damage to a 2/2: 4 excess.
    const armies = named(game, "Army Token", A);
    expect(armies.length).toBe(1);
    expect(counters(game, armies[0])).toBe(4);
    expect(subtypes(game, armies[0])).toContain("Goblin");
  });

  it("counts damage already marked toward lethal (the ruling)", () => {
    const t = table();
    const { game } = t;
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    game.debugApplyEffect(A, { kind: "damage", target: 0, amount: 2 }, [{ kind: "object", object: giant }]);
    answer(t, bears, giant);
    enter(game, "Bolg of the North");
    expect(zone(game, giant)).toBe("graveyard");
    // Lethal was 1 more; 2 dealt is 1 excess.
    const armies = named(game, "Army Token", A);
    expect(armies.length).toBe(1);
    expect(counters(game, armies[0])).toBe(1);
  });

  it("no excess, no amass: an Army you control isn't made a Goblin", () => {
    const t = table();
    const { game } = t;
    game.debugApplyEffect(A, { kind: "amass", amount: 1, creatureType: "Orc" });
    const army = named(game, "Army Token", A)[0];
    const giant = spawn(game, "Hill Giant");
    const theirs = spawn(game, "Hill Giant", B);
    answer(t, giant, theirs);
    enter(game, "Bolg of the North");
    // Exactly lethal: 3 to a 3/3.
    expect(zone(game, theirs)).toBe("graveyard");
    expect(counters(game, army)).toBe(1);
    expect(subtypes(game, army)).not.toContain("Goblin");
    expect(named(game, "Army Token", A)).toEqual([army]);
  });

  it("declining the sacrifice deals no damage", () => {
    const t = table();
    const { game } = t;
    const wurm = spawn(game, "Craw Wurm");
    const bears = spawn(game, "Grizzly Bears", B);
    pickModes(t.a);
    const seen = watchTargets(t.a, () => [bears]);
    enter(game, "Bolg of the North");
    expect(zone(game, wurm)).toBe("battlefield");
    expect(zone(game, bears)).toBe("battlefield");
    expect(seen.asked).toBe(0);
    expect(named(game, "Army Token", A)).toEqual([]);
  });

  it("Bolg itself can't be the creature sacrificed", () => {
    const t = table();
    const { game } = t;
    spawn(game, "Grizzly Bears", B);
    let asked = 0;
    t.a.chooseModesFn = (_view, minModes) => {
      asked += 1;
      return Array.from({ length: Math.max(minModes, 1) }, (_, i) => i);
    };
    const bolg = enter(game, "Bolg of the North");
    // No other creature of yours: nothing to sacrifice, nothing asked.
    expect(asked).toBe(0);
    expect(zone(game, bolg)).toBe("battlefield");
  });
});
