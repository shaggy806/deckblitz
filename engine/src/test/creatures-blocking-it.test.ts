/** `{ blockersOf }` on the object a trigger names, and `CardFilter.blockerCount`
 * — "for each creature blocking it" and "as long as two or more creatures are
 * blocking it" (rules 509.1g-h, 509.3a, 506.4, 613): Spined Sliver, General
 * Marhault Elsdragon, She-Hulk, Guardian of the Gateless, Rampaging Cyclops,
 * Grizzled Wolverine. */
import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";
import type { BlockerDeclaration } from "../controller.js";
import { creaturesBlocking } from "../filter.js";
import {
  A,
  B,
  C,
  activate,
  counters,
  destroy,
  keywords,
  lands,
  pt,
  spawn,
  table,
} from "./harness.js";

const blocks =
  (...pairs: readonly (readonly [ObjectId, ObjectId])[]): (() => BlockerDeclaration[]) =>
  () =>
    pairs.map(([blocker, attacker]) => ({ blocker, attacker }));

type G = ReturnType<typeof table>["game"];

/** `who` has priority in the declare blockers step, every trigger resolved. */
const toBlocksSettled = (game: G, who = A): void =>
  game.advanceUntil(
    (s) =>
      s.turn.step === "declare-blockers" &&
      s.priority.holder === who &&
      s.awaiting === null &&
      s.zones.shared.stack.length === 0 &&
      s.pendingTriggers.length === 0,
  );

/** The trigger waiting on the stack, in the declare blockers step. */
const toTriggerOnStack = (game: G): void =>
  game.advanceUntil(
    (s) => s.turn.step === "declare-blockers" && s.priority.holder === A && s.awaiting === null && s.zones.shared.stack.length > 0,
  );

describe("for each creature blocking the trigger object", () => {
  it("Spined Sliver pumps another Sliver by its own blockers, not by another attacker's", () => {
    const { game, a, b } = table();
    spawn(game, "Spined Sliver");
    const sliver = spawn(game, "Muscle Sliver");
    const bears = spawn(game, "Grizzly Bears");
    const w1 = spawn(game, "Wall of Wood", B);
    const w2 = spawn(game, "Wall of Wood", B);
    const w3 = spawn(game, "Wall of Wood", B);
    b.declareBlockersFn = blocks([w1, sliver], [w2, sliver], [w3, bears]);
    a.declareAttackersFn = () => [
      { attacker: sliver, defender: B },
      { attacker: bears, defender: B },
    ];
    const before = pt(game, sliver);
    toBlocksSettled(game);
    expect(pt(game, sliver)).toEqual({ power: before.power + 2, toughness: before.toughness + 2 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });

  it("Spined Sliver sees an opponent's Sliver become blocked too, and pumps that one", () => {
    const { game, a, c } = table({ players: 3 });
    spawn(game, "Spined Sliver", C);
    const theirs = spawn(game, "Spined Sliver", A);
    const wall = spawn(game, "Wall of Wood", C);
    c.declareBlockersFn = blocks([wall, theirs]);
    a.declareAttackersFn = () => [{ attacker: theirs, defender: C }];
    toBlocksSettled(game);
    // Two Spined Slivers, each triggering: +1/+1 twice for its one blocker.
    expect(pt(game, theirs)).toEqual({ power: 4, toughness: 4 });
  });

  it("General Marhault Elsdragon: +3/+3 for each, on any creature you control, itself too", () => {
    const { game, a, b } = table();
    const general = spawn(game, "General Marhault Elsdragon");
    const bears = spawn(game, "Grizzly Bears");
    const w1 = spawn(game, "Wall of Wood", B);
    const w2 = spawn(game, "Wall of Wood", B);
    const w3 = spawn(game, "Wall of Wood", B);
    b.declareBlockersFn = blocks([w1, bears], [w2, bears], [w3, general]);
    a.declareAttackersFn = () => [
      { attacker: general, defender: B },
      { attacker: bears, defender: B },
    ];
    toBlocksSettled(game);
    expect(pt(game, bears)).toEqual({ power: 8, toughness: 8 });
    expect(pt(game, general)).toEqual({ power: 7, toughness: 7 });
  });

  it("counts as it resolves: a blocker gone by then doesn't count", () => {
    const { game, a, b } = table();
    spawn(game, "General Marhault Elsdragon");
    const bears = spawn(game, "Grizzly Bears");
    const w1 = spawn(game, "Wall of Wood", B);
    const w2 = spawn(game, "Wall of Wood", B);
    b.declareBlockersFn = blocks([w1, bears], [w2, bears]);
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    toTriggerOnStack(game);
    destroy(game, w1);
    toBlocksSettled(game);
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 5 });
  });

  it("an opponent's creature doesn't fire General Marhault's", () => {
    const { game, a, b } = table();
    spawn(game, "General Marhault Elsdragon", B);
    const bears = spawn(game, "Grizzly Bears");
    const wall = spawn(game, "Wall of Wood", B);
    b.declareBlockersFn = blocks([wall, bears]);
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    game.advanceUntil((s) => s.turn.step === "declare-blockers" && s.priority.holder === A);
    expect(game.state.zones.shared.stack.length).toBe(0);
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });

  it("She-Hulk puts one counter on that Hero for each blocker, and gives other Heroes trample", () => {
    const { game, a, b } = table();
    const hulk = spawn(game, "She-Hulk, Wallbreaker");
    const hero = spawn(game, "Spider-Man, Brooklyn Visionary");
    const bears = spawn(game, "Grizzly Bears");
    const w1 = spawn(game, "Wall of Wood", B);
    const w2 = spawn(game, "Wall of Wood", B);
    const w3 = spawn(game, "Wall of Wood", B);
    const w4 = spawn(game, "Wall of Wood", B);
    expect(keywords(game, hulk).has("trample")).toBe(true);
    expect(keywords(game, hero).has("trample")).toBe(true);
    expect(keywords(game, bears).has("trample")).toBe(false);
    b.declareBlockersFn = blocks([w1, hulk], [w2, hero], [w3, hero], [w4, bears]);
    a.declareAttackersFn = () => [
      { attacker: hulk, defender: B },
      { attacker: hero, defender: B },
      { attacker: bears, defender: B },
    ];
    toBlocksSettled(game);
    expect(counters(game, hulk)).toBe(1);
    expect(counters(game, hero)).toBe(2);
    expect(counters(game, bears)).toBe(0);
  });
});

describe("creaturesBlocking", () => {
  it("creaturesBlocking counts the attacker's blockers and is 0 for one unblocked", () => {
    const { game, a, b } = table();
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    const w1 = spawn(game, "Wall of Wood", B);
    const w2 = spawn(game, "Wall of Wood", B);
    b.declareBlockersFn = blocks([w1, bears], [w2, bears]);
    a.declareAttackersFn = () => [
      { attacker: bears, defender: B },
      { attacker: giant, defender: B },
    ];
    toBlocksSettled(game);
    expect(creaturesBlocking(game.state, bears)).toBe(2);
    expect(creaturesBlocking(game.state, giant)).toBe(0);
    destroy(game, w1);
    toBlocksSettled(game);
    expect(creaturesBlocking(game.state, bears)).toBe(1);
  });
});

describe("for each creature it's blocking (Guardian of the Gateless)", () => {
  it("triggers once, and counts every attacker it blocks", () => {
    const { game, a, b } = table();
    const guardian = spawn(game, "Guardian of the Gateless", B);
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    const elf = spawn(game, "Llanowar Elves");
    b.declareBlockersFn = blocks([guardian, bears], [guardian, giant], [guardian, elf]);
    a.declareAttackersFn = () => [
      { attacker: bears, defender: B },
      { attacker: giant, defender: B },
      { attacker: elf, defender: B },
    ];
    toBlocksSettled(game);
    expect(pt(game, guardian)).toEqual({ power: 6, toughness: 6 });
  });

  it("an attacker that isn't one of its blocks doesn't count", () => {
    const { game, a, b } = table();
    const guardian = spawn(game, "Guardian of the Gateless", B);
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    b.declareBlockersFn = blocks([guardian, bears]);
    a.declareAttackersFn = () => [
      { attacker: bears, defender: B },
      { attacker: giant, defender: B },
    ];
    toBlocksSettled(game);
    expect(pt(game, guardian)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("as long as two or more creatures are blocking it (Rampaging Cyclops)", () => {
  it("is 4/4 with one blocker and 2/4 with two; losing a blocker turns it off again", () => {
    const { game, a, b } = table();
    const cyclops = spawn(game, "Rampaging Cyclops");
    const w1 = spawn(game, "Wall of Wood", B);
    const w2 = spawn(game, "Wall of Wood", B);
    expect(pt(game, cyclops)).toEqual({ power: 4, toughness: 4 });
    b.declareBlockersFn = blocks([w1, cyclops], [w2, cyclops]);
    a.declareAttackersFn = () => [{ attacker: cyclops, defender: B }];
    toBlocksSettled(game);
    expect(pt(game, cyclops)).toEqual({ power: 2, toughness: 4 });
    destroy(game, w1);
    toBlocksSettled(game);
    expect(pt(game, cyclops)).toEqual({ power: 4, toughness: 4 });
  });

  it("one blocker alone leaves it 4/4", () => {
    const { game, a, b } = table();
    const cyclops = spawn(game, "Rampaging Cyclops");
    const wall = spawn(game, "Wall of Wood", B);
    b.declareBlockersFn = blocks([wall, cyclops]);
    a.declareAttackersFn = () => [{ attacker: cyclops, defender: B }];
    toBlocksSettled(game);
    expect(pt(game, cyclops)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("only if at least one creature is blocking this creature (Grizzled Wolverine)", () => {
  it("can't be activated before blocks, or when nothing blocks it", () => {
    const { game, a, b } = table();
    const wolverine = spawn(game, "Grizzled Wolverine");
    lands(game, "Mountain", 2);
    expect(() => activate(game, wolverine)).toThrow();
    b.declareBlockersFn = blocks();
    a.declareAttackersFn = () => [{ attacker: wolverine, defender: B }];
    toBlocksSettled(game);
    expect(() => activate(game, wolverine)).toThrow();
  });

  it("in the declare blockers step, blocked: +2/+0, and only once", () => {
    const { game, a, b } = table();
    const wolverine = spawn(game, "Grizzled Wolverine");
    lands(game, "Mountain", 2);
    const wall = spawn(game, "Wall of Wood", B);
    b.declareBlockersFn = blocks([wall, wolverine]);
    a.declareAttackersFn = () => [{ attacker: wolverine, defender: B }];
    toBlocksSettled(game);
    activate(game, wolverine);
    expect(pt(game, wolverine)).toEqual({ power: 4, toughness: 2 });
    expect(() => activate(game, wolverine)).toThrow();
  });

  it("blocked, its blocker gone: not blocking it any more, so no", () => {
    const { game, a, b } = table();
    const wolverine = spawn(game, "Grizzled Wolverine");
    lands(game, "Mountain", 2);
    const wall = spawn(game, "Wall of Wood", B);
    b.declareBlockersFn = blocks([wall, wolverine]);
    a.declareAttackersFn = () => [{ attacker: wolverine, defender: B }];
    toBlocksSettled(game);
    destroy(game, wall);
    toBlocksSettled(game);
    expect(game.state.objects[wolverine].blocked).toBe(true);
    expect(() => activate(game, wolverine)).toThrow();
  });
});
