/**
 * "Whenever a creature you control becomes the target of a backup ability,
 * copy that ability. You may choose new targets for the copy. This ability
 * triggers only once each turn." (Mirror-Shield Hoplite): `becomes-target`'s
 * `abilityKeyword: "backup"` — the backup helper stamps its trigger
 * `keywordOf: "backup"` (rule 702.165a) — with the ability as the trigger
 * object (`objectIsTargeter`), copied by `copy-ability`'s `"trigger-ability"`.
 */
import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";

import { A, B, counters, enter, keywords, ref, spawn, table } from "./harness.js";

describe("Mirror-Shield Hoplite", () => {
  it("copies a backup ability aimed at a creature you control, the copy aimed anew", () => {
    const { game, a } = table();
    const hoplite = spawn(game, "Mirror-Shield Hoplite", A);
    const bears = spawn(game, "Grizzly Bears", A);
    const picks: ObjectId[] = [bears, hoplite];
    a.chooseTargetsFn = () => [ref(picks.shift() ?? hoplite)];
    enter(game, "Boon-Bringer Valkyrie", A);
    expect(counters(game, bears)).toBe(1);
    expect(counters(game, hoplite)).toBe(1);
    // The copy's "if that's another creature" still compares with the Valkyrie.
    expect(keywords(game, hoplite).has("flying")).toBe(true);
    expect(keywords(game, bears).has("flying")).toBe(true);
  });

  it("only once each turn", () => {
    const { game, a } = table();
    const hoplite = spawn(game, "Mirror-Shield Hoplite", A);
    const bears = spawn(game, "Grizzly Bears", A);
    a.chooseTargetsFn = () => [ref(bears)];
    enter(game, "Boon-Bringer Valkyrie", A);
    expect(counters(game, bears)).toBe(2);
    enter(game, "Boon-Bringer Valkyrie", A);
    expect(counters(game, bears)).toBe(3);
    expect(counters(game, hoplite)).toBe(0);
  });

  it("an ability that isn't backup doesn't set it off", () => {
    const { game, a } = table();
    spawn(game, "Mirror-Shield Hoplite", A);
    const bears = spawn(game, "Grizzly Bears", A);
    a.chooseTargetsFn = () => [ref(bears)];
    // "When this creature enters, put a +1/+1 counter on target creature" —
    // the same text as backup 1's, but not a backup ability.
    enter(game, "Bond Beetle", A);
    expect(counters(game, bears)).toBe(1);
  });

  it("an opponent's creature targeted doesn't", () => {
    const { game, a } = table();
    const hoplite = spawn(game, "Mirror-Shield Hoplite", A);
    const theirs = spawn(game, "Grizzly Bears", B);
    a.chooseTargetsFn = () => [ref(theirs)];
    enter(game, "Boon-Bringer Valkyrie", A);
    expect(counters(game, theirs)).toBe(1);
    expect(counters(game, hoplite)).toBe(0);
  });
});
