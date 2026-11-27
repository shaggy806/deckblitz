/**
 * A choice among one target player's permanents as many as an amount reads
 * (`choose-permanents` with `controlledByPlayer: { target }` and a
 * `difference` of counts from both sides), the chosen phasing out together
 * (rule 702.26b): Equipoise's three passes, lands, then artifacts, then
 * creatures, each counted after the one before (the ruling).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { phasedOutIds } from "../state.js";

import { B, lands, nextTurn, pickTargets, spawn, table } from "./harness.js";

const out = (game: Game, ids: readonly ObjectId[]): boolean[] => ids.map((id) => phasedOutIds(game.state).includes(id));

describe("Equipoise", () => {
  it("phases out the target player's lands, artifacts and creatures in excess of yours, pass by pass", () => {
    const { game, a } = table();
    spawn(game, "Equipoise");
    lands(game, "Plains", 1);
    spawn(game, "Grizzly Bears");
    const theirLands = lands(game, "Forest", 3, B);
    const thopter = spawn(game, "Ornithopter", B);
    const bears = [spawn(game, "Grizzly Bears", B), spawn(game, "Grizzly Bears", B)];
    pickTargets(a, B);
    const offers: (readonly ObjectId[])[] = [];
    const want = [theirLands[0], theirLands[2], thopter, bears[1]];
    a.choosePermanentsFn = (_view, eligible) => {
      offers.push(eligible);
      return want.filter((id) => eligible.includes(id));
    };
    nextTurn(game); // bob's
    nextTurn(game); // alice's: her upkeep
    expect(offers.length).toBe(3);
    expect(offers[0]).toEqual(theirLands);
    // Bob has one artifact to her none: the Ornithopter, which phases out
    // and isn't there for the creatures' pass — two Bears to her one.
    expect(offers[1]).toEqual([thopter]);
    expect(offers[2]).toEqual(bears);
    expect(out(game, theirLands)).toEqual([true, false, true]);
    expect(out(game, [thopter, ...bears])).toEqual([true, false, true]);
  });

  it("a player with no more than you loses nothing, and isn't asked about", () => {
    const { game, a } = table();
    spawn(game, "Equipoise");
    lands(game, "Plains", 2);
    const theirs = lands(game, "Forest", 2, B);
    pickTargets(a, B);
    let asked = 0;
    a.choosePermanentsFn = () => {
      asked += 1;
      return [];
    };
    nextTurn(game);
    nextTurn(game);
    expect(asked).toBe(0);
    expect(out(game, theirs)).toEqual([false, false]);
  });

  it("what phased out phases in during its controller's next untap step", () => {
    const { game, a } = table();
    spawn(game, "Equipoise");
    const theirs = lands(game, "Forest", 1, B);
    pickTargets(a, B);
    a.choosePermanentsFn = (_view, eligible) => eligible;
    nextTurn(game);
    nextTurn(game);
    expect(out(game, theirs)).toEqual([true]);
    nextTurn(game); // bob's untap step
    expect(out(game, theirs)).toEqual([false]);
    expect(game.state.objects[theirs[0]].controller).toBe(B);
  });
});
