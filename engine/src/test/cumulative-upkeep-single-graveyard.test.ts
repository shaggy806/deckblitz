/**
 * Cumulative upkeep paid by putting cards from a single graveyard on the
 * bottom of their owner's library (rule 702.24a — a `look-and-choose` over
 * `zone: "graveyards"` with `together: { singleGraveyard: true }`, repeated
 * for each age counter): Jötun Grunt. Each counter's two cards are chosen on
 * their own, each pair from whichever graveyard (its ruling), and it's all or
 * none — with fewer pairs to be had than age counters it isn't offered, and
 * the Grunt is sacrificed.
 */
import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";
import { A, B, counters, nextTurn, pickModes, spawn, table, toGraveyard, zone } from "./harness.js";

const toAlicesNextTurn = (game: Parameters<typeof nextTurn>[0]): void => {
  nextTurn(game);
  nextTurn(game);
};

describe("Jötun Grunt", () => {
  it("puts two cards from one graveyard on the bottom of their owner's library", () => {
    const { game, a } = table();
    const grunt = spawn(game, "Jötun Grunt");
    const mine = toGraveyard(game, "Grizzly Bears", A);
    const bobs = [toGraveyard(game, "Shock", B), toGraveyard(game, "Forest", B), toGraveyard(game, "Island", B)];
    pickModes(a, 0);
    const asked: { eligible: readonly ObjectId[]; min: number; max: number }[] = [];
    a.chooseFromZoneFn = (_view, eligible, min, max) => {
      asked.push({ eligible: [...eligible], min, max });
      return [bobs[0], bobs[2]];
    };
    toAlicesNextTurn(game);
    expect(counters(game, grunt, "age")).toBe(1);
    expect(asked[0]).toMatchObject({ min: 2, max: 2 });
    expect(asked[0].eligible).toEqual(expect.arrayContaining([mine, ...bobs]));
    expect(zone(game, bobs[0])).toBe("library");
    expect(zone(game, bobs[2])).toBe("library");
    expect(game.state.zones.perPlayer[B].library).toEqual(expect.arrayContaining([bobs[0], bobs[2]]));
    expect(zone(game, bobs[1])).toBe("graveyard");
    expect(zone(game, mine)).toBe("graveyard");
    expect(zone(game, grunt)).toBe("battlefield");
  });

  it("never takes the pair from two graveyards", () => {
    const { game, a } = table();
    spawn(game, "Jötun Grunt");
    const mine = toGraveyard(game, "Grizzly Bears", A);
    const bobs = [toGraveyard(game, "Shock", B), toGraveyard(game, "Forest", B)];
    pickModes(a, 0);
    a.chooseFromZoneFn = () => [mine, bobs[0]];
    toAlicesNextTurn(game);
    // Alice's one card can't be half of a pair: Bob's two go.
    expect(zone(game, mine)).toBe("graveyard");
    expect(bobs.map((id) => zone(game, id))).toEqual(["library", "library"]);
  });

  it("one pair left for two age counters: sacrificed, nothing more moved", () => {
    const { game, a } = table();
    const grunt = spawn(game, "Jötun Grunt");
    const mine = [toGraveyard(game, "Grizzly Bears", A), toGraveyard(game, "Shock", A), toGraveyard(game, "Forest", A)];
    const bobs = [toGraveyard(game, "Shock", B), toGraveyard(game, "Forest", B)];
    pickModes(a, 0);
    a.chooseFromZoneFn = (_view, eligible) => eligible.slice(0, 2);
    toAlicesNextTurn(game);
    // The first counter: two of alice's.
    expect(mine.filter((id) => zone(game, id) === "library")).toHaveLength(2);
    toAlicesNextTurn(game);
    // Two counters: alice's last card can't make a pair, so there's only
    // bob's — one pair in all, and no partial payment: sacrificed.
    expect(zone(game, grunt)).toBe("graveyard");
    expect(bobs.map((id) => zone(game, id))).toEqual(["graveyard", "graveyard"]);
  });

  it("two counters, a pair in each of two graveyards: both paid, one from each", () => {
    const { game, a } = table();
    const grunt = spawn(game, "Jötun Grunt");
    game.state.objects[grunt].counters.age = 1;
    const mine = [toGraveyard(game, "Grizzly Bears", A), toGraveyard(game, "Shock", A)];
    const bobs = [toGraveyard(game, "Shock", B), toGraveyard(game, "Forest", B)];
    pickModes(a, 0);
    const plan = [mine, bobs];
    let pass = 0;
    a.chooseFromZoneFn = () => plan[pass++];
    toAlicesNextTurn(game);
    expect(counters(game, grunt, "age")).toBe(2);
    expect([...mine, ...bobs].map((id) => zone(game, id))).toEqual(["library", "library", "library", "library"]);
    expect(zone(game, grunt)).toBe("battlefield");
  });

  it("with fewer pairs than age counters it isn't offered, and is sacrificed with nothing moved", () => {
    const { game, a } = table();
    const grunt = spawn(game, "Jötun Grunt");
    game.state.objects[grunt].counters.age = 1;
    const mine = [toGraveyard(game, "Grizzly Bears", A), toGraveyard(game, "Shock", A), toGraveyard(game, "Forest", A)];
    const offered: string[][] = [];
    a.chooseModesFn = (_view, _min, _max, texts) => {
      offered.push([...texts]);
      return [0];
    };
    toAlicesNextTurn(game);
    expect(offered.flat().some((t) => /single graveyard/.test(t))).toBe(false);
    expect(zone(game, grunt)).toBe("graveyard");
    expect(mine.map((id) => zone(game, id))).toEqual(["graveyard", "graveyard", "graveyard"]);
  });
});
