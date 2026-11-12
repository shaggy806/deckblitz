/**
 * The filter's `ownedByRef` — owned by the player a ref names, whoever
 * chooses — in a `for-each-vote`: Expropriate's "for each money vote, choose
 * a permanent owned by the voter and gain control of it", the caster
 * choosing; and an extra turn for each time vote.
 */
import { describe, expect, it } from "vitest";

import { A, B, C, cast, controller, lands, pickModes, spawn, table, toHand, zone } from "./harness.js";
import type { ObjectId } from "../primitives.js";

describe("Expropriate", () => {
  it("a permanent each money voter owns, chosen by the caster; a turn per time vote", () => {
    const { game, a, b, c } = table({ players: 3 });
    lands(game, "Island", 9);
    const bobBears = spawn(game, "Grizzly Bears", B);
    const bobGiant = spawn(game, "Hill Giant", B);
    // Owned by Carol, controlled by Alice: still Carol's to lose.
    const carols = spawn(game, "Serra Angel", C);
    game.state.objects[carols].controller = A;
    const mine = spawn(game, "Grizzly Bears", A);
    pickModes(a, 0);
    pickModes(b, 1);
    pickModes(c, 1);
    const offered: ObjectId[][] = [];
    a.choosePermanentsFn = (_view, eligible) => {
      offered.push([...eligible]);
      return [eligible.includes(bobGiant) ? bobGiant : eligible[0]!];
    };
    const extra = game.state.extraTurns.length;
    const spell = toHand(game, "Expropriate");
    cast(game, spell);
    expect(offered).toHaveLength(2);
    expect(new Set(offered[0])).toEqual(new Set([bobBears, bobGiant]));
    expect(offered[0]).not.toContain(mine);
    expect(offered[1]).toContain(carols);
    expect(offered[1]!.every((id) => game.state.objects[id].owner === C)).toBe(true);
    expect(controller(game, bobGiant)).toBe(A);
    expect(controller(game, bobBears)).toBe(B);
    expect(game.state.extraTurns.length).toBe(extra + 1);
    expect(zone(game, spell)).toBe("exile");
  });
});
