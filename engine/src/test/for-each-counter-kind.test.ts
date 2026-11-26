/**
 * `for-each-counter-kind`: an effect once for each kind of counter (rule
 * 122.1) on the permanents matching `among`, `CHOSEN_COUNTER` standing for the
 * kind. Bribe Taker: "for each kind of counter on permanents you control, you
 * may put your choice of a +1/+1 counter or a counter of that kind on this
 * creature".
 */
import { describe, expect, it } from "vitest";

import { invalidateComputedCache } from "../characteristics.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import { B, counters, enter, spawn, table } from "./harness.js";

function put(game: Game, id: ObjectId, kind: string, n = 1): void {
  game.state.objects[id].counters = { ...game.state.objects[id].counters, [kind]: n };
  invalidateComputedCache();
}

describe("Bribe Taker", () => {
  it("offers each kind among your permanents once, the second mode naming that kind", () => {
    const { game, a } = table();
    // Two kinds: shield (two of them, still one kind — the ruling) and +1/+1.
    put(game, spawn(game, "Grizzly Bears"), "shield", 2);
    put(game, spawn(game, "Grizzly Bears"), "+1/+1");
    // An opponent's counter isn't among them.
    put(game, spawn(game, "Grizzly Bears", B), "-1/-1");
    const offers: string[][] = [];
    a.chooseModesFn = (view) => {
      const awaiting = view.state.awaiting;
      offers.push(awaiting?.kind === "choose-modes" ? awaiting.modes.map((m) => m.text ?? "") : []);
      // The +1/+1 counter for the first kind, that kind for the second.
      return [offers.length === 1 ? 0 : 1];
    };
    const taker = enter(game, "Bribe Taker");
    // In name order: "+1/+1", then "shield".
    expect(offers).toEqual([
      ["A +1/+1 counter", "A +1/+1 counter"],
      ["A +1/+1 counter", "A shield counter"],
    ]);
    expect(counters(game, taker, "+1/+1")).toBe(1);
    expect(counters(game, taker, "shield")).toBe(1);
  });

  it("puts nothing for a kind its controller declines", () => {
    const { game, a } = table();
    put(game, spawn(game, "Grizzly Bears"), "shield");
    a.chooseModesFn = () => [];
    const taker = enter(game, "Bribe Taker");
    expect(counters(game, taker, "shield")).toBe(0);
    expect(counters(game, taker, "+1/+1")).toBe(0);
  });

  it("asks nothing with no counters on your permanents", () => {
    const { game, a } = table();
    put(game, spawn(game, "Grizzly Bears", B), "+1/+1");
    let asked = 0;
    a.chooseModesFn = () => {
      asked += 1;
      return [0];
    };
    const taker = enter(game, "Bribe Taker");
    expect(asked).toBe(0);
    expect(counters(game, taker, "+1/+1")).toBe(0);
  });
});
