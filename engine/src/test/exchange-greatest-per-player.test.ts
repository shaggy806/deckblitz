/**
 * "You and target player exchange control of the creature you each control
 * with the greatest mana value. Then exchange control of artifacts the same
 * way" (Juxtapose): each player's own pick among a tie, made as it resolves
 * (not targeted), each exchange all or nothing (rule 701.12a), the second
 * still made when the first has nothing to exchange.
 */
import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";
import { A, B, cast, controller, lands, pickPermanents, ref, spawn, table, toHand } from "./harness.js";

describe("Juxtapose", () => {
  it("exchanges the greatest creature, then the greatest artifact, each side's tie its own controller's pick", () => {
    const { game, a, b } = table();
    lands(game, "Island", 4);
    const bears = spawn(game, "Grizzly Bears", A);
    const giant = spawn(game, "Hill Giant", A);
    const ring = spawn(game, "Sol Ring", A);
    const stone = spawn(game, "Mind Stone", A);
    const theirGiant = spawn(game, "Hill Giant", B);
    const theirOther = spawn(game, "Hill Giant", B);
    const theirBears = spawn(game, "Grizzly Bears", B);
    const theirStone = spawn(game, "Mind Stone", B);
    const mine: { offered: readonly ObjectId[] }[] = [];
    const theirs: { offered: readonly ObjectId[] }[] = [];
    // Alice's pick: her Hill Giant, then her Mind Stone (the greatest, 2).
    let aPicks = 0;
    a.choosePermanentsFn = (_view, eligible) => {
      mine.push({ offered: eligible });
      aPicks += 1;
      return aPicks === 1 ? [giant] : [stone];
    };
    let bPicks = 0;
    b.choosePermanentsFn = (_view, eligible) => {
      theirs.push({ offered: eligible });
      bPicks += 1;
      return bPicks === 1 ? [theirOther] : [theirStone];
    };
    cast(game, toHand(game, "Juxtapose"), { targets: [ref(B)] });
    expect(mine[0].offered).toEqual([giant]);
    expect([...theirs[0].offered].sort()).toEqual([theirGiant, theirOther].sort());
    expect(mine[1].offered).toEqual([stone]);
    expect(controller(game, giant)).toBe(B);
    expect(controller(game, theirOther)).toBe(A);
    expect(controller(game, theirGiant)).toBe(B);
    expect(controller(game, stone)).toBe(B);
    expect(controller(game, theirStone)).toBe(A);
    expect(controller(game, bears)).toBe(A);
    expect(controller(game, theirBears)).toBe(B);
    expect(controller(game, ring)).toBe(A);
  });

  it("with no creature on one side, the creatures stay and the artifacts are still exchanged", () => {
    const { game, b } = table();
    lands(game, "Island", 4);
    const giant = spawn(game, "Hill Giant", A);
    const ring = spawn(game, "Sol Ring", A);
    const theirStone = spawn(game, "Mind Stone", B);
    pickPermanents(b, theirStone);
    cast(game, toHand(game, "Juxtapose"), { targets: [ref(B)] });
    expect(controller(game, giant)).toBe(A);
    expect(controller(game, ring)).toBe(B);
    expect(controller(game, theirStone)).toBe(A);
  });

  it("an artifact creature gained in the first exchange can be given back in the second", () => {
    const { game } = table();
    lands(game, "Island", 4);
    const bears = spawn(game, "Grizzly Bears", A);
    const ring = spawn(game, "Sol Ring", A);
    const golem = spawn(game, "Su-Chi", B);
    cast(game, toHand(game, "Juxtapose"), { targets: [ref(B)] });
    // Su-Chi (4) comes over for the Bears; then it is Alice's greatest
    // artifact, and Bob now has none, so the artifacts stay put.
    expect(controller(game, golem)).toBe(A);
    expect(controller(game, bears)).toBe(B);
    expect(controller(game, ring)).toBe(A);
  });
});
