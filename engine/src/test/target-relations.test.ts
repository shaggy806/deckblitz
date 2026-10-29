/**
 * The `sameController` target relation: "up to three target cards from a single graveyard"
 * (Decompose), "two target cards from an opponent's graveyard" (one opponent's), "target player
 * shuffles up to four target cards from their graveyard" (Witness the Future), "another target
 * creature that player controls" (Mutiny) — offered narrowed, refused when broken, and judged again
 * as it resolves (rule 608.2b).
 */
import { describe, expect, it } from "vitest";

import { invalidTargetReason, stateTargetFacts } from "../targeting.js";
import { concatModeSpecs, concreteTargetSpecs, slotOptions, targetsFillable } from "../target.js";
import type { TargetRef, TargetSpec } from "../target.js";

import { A, B, C, ref, spawn, table, toGraveyard } from "./harness.js";

const SINGLE_GRAVEYARD: TargetSpec[] = [
  { kind: "any-number", of: { kind: "card-in-graveyard" }, max: 3, sameController: true },
];
const THEIR_GRAVEYARD: TargetSpec[] = [
  "player",
  { kind: "any-number", of: { kind: "card-in-graveyard" }, max: 4, sameController: { slot: 0 } },
];
const THAT_PLAYER: TargetSpec[] = [
  "creature-an-opponent-controls",
  { kind: "other", of: "creature", than: { slot: 0 }, sameController: true },
];

describe("from a single graveyard", () => {
  it("offers only the first card's graveyard once one is picked, and refuses two graveyards", () => {
    const { game } = table({ players: 3 });
    const mine = toGraveyard(game, "Grizzly Bears", A);
    const bobs = toGraveyard(game, "Hill Giant", B);
    const bobs2 = toGraveyard(game, "Savannah Lions", B);
    const carols = toGraveyard(game, "Hill Giant", C);
    const facts = stateTargetFacts(game.state, game.registry);
    const all = [mine, bobs, bobs2, carols].map(ref);
    expect(slotOptions(SINGLE_GRAVEYARD, [all], 1, [ref(bobs)], facts)).toEqual([ref(bobs2)]);
    const why = (chosen: TargetRef[]) =>
      invalidTargetReason(game.state, game.registry, SINGLE_GRAVEYARD, chosen, A, "Decompose");
    expect(why([ref(bobs), ref(bobs2)])).toBeNull();
    expect(why([ref(bobs), ref(carols)])).toMatch(/another/);
    expect(why([ref(mine)])).toBeNull();
  });

  it("each member after the first is tied to the ones before it", () => {
    expect(concreteTargetSpecs(SINGLE_GRAVEYARD, 3)).toEqual([
      { kind: "card-in-graveyard" },
      { kind: "other", of: { kind: "card-in-graveyard" }, than: { slots: [0] }, sameController: true },
      { kind: "other", of: { kind: "card-in-graveyard" }, than: { slots: [0, 1] }, sameController: true },
    ]);
  });
});

describe("from their graveyard", () => {
  it("only the target player's cards", () => {
    const { game } = table();
    const mine = toGraveyard(game, "Grizzly Bears", A);
    const bobs = toGraveyard(game, "Hill Giant", B);
    const facts = stateTargetFacts(game.state, game.registry);
    expect(slotOptions(THEIR_GRAVEYARD, [[ref(A), ref(B)], [ref(mine), ref(bobs)]], 1, [ref(B)], facts)).toEqual([
      ref(bobs),
    ]);
    const why = (chosen: TargetRef[]) =>
      invalidTargetReason(game.state, game.registry, THEIR_GRAVEYARD, chosen, A, "Witness the Future");
    expect(why([ref(B), ref(bobs)])).toBeNull();
    expect(why([ref(B), ref(mine)])).toMatch(/another/);
    expect(why([ref(B)])).toBeNull();
  });
});

describe("that player controls", () => {
  it("the second creature must be the first one's controller's", () => {
    const { game } = table({ players: 3 });
    const bobsBears = spawn(game, "Grizzly Bears", B);
    const bobsGiant = spawn(game, "Hill Giant", B);
    const carolsGiant = spawn(game, "Hill Giant", C);
    const why = (chosen: TargetRef[]) =>
      invalidTargetReason(game.state, game.registry, THAT_PLAYER, chosen, A, "Mutiny");
    expect(why([ref(bobsGiant), ref(bobsBears)])).toBeNull();
    expect(why([ref(bobsGiant), ref(carolsGiant)])).toMatch(/another/);
  });
});

describe("a mode's slot relations are its own", () => {
  it("a second mode's 'other than slot 0' means its own first slot (Amazing Acrobatics, both modes)", () => {
    const counter: TargetSpec[] = ["spell"];
    const tap: TargetSpec[] = ["creature", { kind: "optional", of: { kind: "other", of: "creature", than: { slot: 0 } } }];
    expect(concatModeSpecs([counter, tap])).toEqual([
      "spell",
      "creature",
      { kind: "optional", of: { kind: "other", of: "creature", than: { slot: 1 } } },
    ]);
    // A group tied to its mode's player slot moves with it (Quandrix Command's fourth mode).
    expect(
      concatModeSpecs([["creature"], ["player", { kind: "any-number", of: { kind: "card-in-graveyard" }, max: 3, sameController: { slot: 0 } }]]),
    ).toEqual(["creature", "player", { kind: "any-number", of: { kind: "card-in-graveyard" }, max: 3, sameController: { slot: 1 } }]);
  });

  it("the second mode's two slots must differ, and may share the first mode's target", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    // Two creature-targeting modes back to back: the second's relation is to its own first slot.
    const why = (targets: TargetRef[]) =>
      invalidTargetReason(
        game.state,
        game.registry,
        concatModeSpecs([["creature"], ["creature", { kind: "optional", of: { kind: "other", of: "creature", than: { slot: 0 } } }]]),
        targets,
        A,
        "Amazing Acrobatics",
      );
    expect(why([ref(giant), ref(bears), ref(bears)])).toMatch(/another/);
    expect(why([ref(bears), ref(giant), ref(bears)])).toBeNull();
  });
});

describe("a single-graveyard group with a floor", () => {
  it("is fillable only with that many in one graveyard, and a member from a graveyard too small isn't offered", () => {
    const { game } = table({ players: 3 });
    const bobs = [toGraveyard(game, "Grizzly Bears", B), toGraveyard(game, "Hill Giant", B)];
    const carols = toGraveyard(game, "Hill Giant", C);
    const facts = stateTargetFacts(game.state, game.registry);
    const two: TargetSpec[] = [
      { kind: "any-number", of: { kind: "card-in-graveyard", whose: "opponent" }, min: 2, max: 2, sameController: true },
    ];
    expect(targetsFillable(two, [[ref(bobs[0]), ref(carols)]], [], 0, facts)).toBe(false);
    expect(targetsFillable(two, [[...bobs.map(ref), ref(carols)]], [], 0, facts)).toBe(true);
    // Carol's lone card can't start the pair; Bob's can.
    expect(targetsFillable(two, [[...bobs.map(ref), ref(carols)]], [ref(carols)], 1, facts)).toBe(false);
    expect(targetsFillable(two, [[...bobs.map(ref), ref(carols)]], [ref(bobs[0])], 1, facts)).toBe(true);
  });
});
