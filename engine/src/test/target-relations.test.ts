/**
 * The `sameController` target relation: "up to three target cards from a single graveyard"
 * (Decompose), "two target cards from an opponent's graveyard" (one opponent's), "target player
 * shuffles up to four target cards from their graveyard" (Witness the Future), "another target
 * creature that player controls" (Mutiny) — offered narrowed, refused when broken, and judged again
 * as it resolves (rule 608.2b).
 */
import { describe, expect, it } from "vitest";

import { invalidTargetReason, stateTargetFacts } from "../targeting.js";
import { concreteTargetSpecs, slotOptions } from "../target.js";
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
