/**
 * "You may remove any number of +1/+1 counters from among creatures you
 * control. If you do, put twice that many +1/+1 counters on this creature."
 * (Galloping Lizrog — need key effect:remove-counters-from-among): the
 * `remove-counters` effect's `count: "any"` with `among` over the
 * controller's own creatures, chosen as it resolves (rule 608.2c), then an
 * `add-counter` on the source of twice `thisWay: "counters-removed"`.
 */

import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";
import { A, B, counters, enter, graveyard, named, settle, spawn, table } from "./harness.js";

describe("Galloping Lizrog", () => {
  it("removes counters from among your creatures, its own included, and puts twice as many on itself", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const elves = spawn(game, "Llanowar Elves");
    const theirs = spawn(game, "Grizzly Bears", B);
    game.state.objects[bears].counters["+1/+1"] = 2;
    game.state.objects[elves].counters["+1/+1"] = 1;
    game.state.objects[theirs].counters["+1/+1"] = 3;
    const lizrog = enter(game, "Galloping Lizrog", A, { settle: false });
    // It entered with a counter of its own (the second ruling).
    game.state.objects[lizrog].counters["+1/+1"] = 1;
    let offered: readonly ObjectId[] = [];
    a.chooseCounterRemovalsFn = (_view, offer) => {
      offered = offer.eligible.map((e) => e.object);
      return [
        { object: bears, kind: "+1/+1", count: 2 },
        { object: lizrog, kind: "+1/+1", count: 1 },
      ];
    };
    settle(game);
    // Only the controller's creatures are offered; never an opponent's.
    expect([...offered].sort()).toEqual([bears, elves, lizrog].sort());
    expect(counters(game, bears)).toBe(0);
    expect(counters(game, elves)).toBe(1);
    expect(counters(game, theirs)).toBe(3);
    // Three removed: its own one gone, six put back.
    expect(counters(game, lizrog)).toBe(6);
  });

  it("may remove none, putting none", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    game.state.objects[bears].counters["+1/+1"] = 2;
    a.chooseCounterRemovalsFn = () => [];
    const lizrog = enter(game, "Galloping Lizrog");
    expect(counters(game, bears)).toBe(2);
    expect(counters(game, lizrog)).toBe(0);
  });

  it("still removes the counters once it has left, but puts none on it (the first ruling)", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    game.state.objects[bears].counters["+1/+1"] = 2;
    a.chooseCounterRemovalsFn = () => [{ object: bears, kind: "+1/+1", count: 2 }];
    const lizrog = enter(game, "Galloping Lizrog", A, { settle: false });
    game.debugMove(lizrog, "graveyard");
    settle(game);
    expect(counters(game, bears)).toBe(0);
    const card = graveyard(game).find((id) => game.state.objects[id].cardName === "Galloping Lizrog");
    expect(card).toBeDefined();
    expect(counters(game, card!)).toBe(0);
    expect(named(game, "Galloping Lizrog")).toEqual([]);
  });
});
