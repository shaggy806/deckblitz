/**
 * "For each kind of counter among creatures you control, put a counter of
 * that kind on either of those tokens" (Exotic Pets): `keyword-counters` with
 * `keywords: "every-kind"` — each kind of counter (rule 122.1) some creature
 * you control has, read once the tokens are made, each put on one of the
 * created tokens chosen for it (not a target).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, cast, counters, lands, named, spawn, table, toHand } from "./harness.js";

const FISH = "Fish Token (Expendable Lackey)";

const putCounter = (game: Game, id: ObjectId, counter: string, player: PlayerId = A): void => {
  game.debugApplyEffect(player, { kind: "add-counter", target: 0, counter, amount: 1 }, [{ kind: "object", object: id }]);
};

const pets = (game: Game): void => {
  lands(game, "Plains", 2);
  lands(game, "Island", 1);
  cast(game, toHand(game, "Exotic Pets"));
};

/** The Fish, with the counters on each. */
const fishCounters = (game: Game): Record<string, number>[] =>
  named(game, FISH, A).flatMap((id) => Array<Record<string, number>>(game.state.objects[id].stackCount ?? 1).fill({ ...game.state.objects[id].counters } as Record<string, number>));

describe("Exotic Pets", () => {
  it("one counter of each kind among your creatures, each on a Fish you choose", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", A);
    const giant = spawn(game, "Hill Giant", A);
    putCounter(game, bears, "+1/+1");
    putCounter(game, bears, "+1/+1");
    putCounter(game, giant, "+1/+1");
    putCounter(game, giant, "flying");
    // Bob's -1/-1 counter isn't among creatures alice controls.
    putCounter(game, spawn(game, "Grizzly Bears", B), "-1/-1", B);
    const prompts: string[] = [];
    let call = 0;
    a.choosePermanentsFn = (_view, eligible) => {
      prompts.push(JSON.stringify(game.state.awaiting));
      expect(eligible.every((id) => game.state.objects[id].cardName === FISH)).toBe(true);
      // The first kind on one Fish, the next on the other.
      call += 1;
      return [call === 1 ? eligible[0] : eligible[eligible.length - 1]];
    };
    pets(game);
    expect(call).toBe(2);
    expect(prompts.join(" ")).toMatch(/\+1\/\+1/);
    expect(prompts.join(" ")).toMatch(/flying/);
    const fish = fishCounters(game);
    expect(fish).toHaveLength(2);
    // One +1/+1 counter however many there were, one flying counter.
    const total = (kind: string): number => fish.reduce((n, c) => n + (c[kind] ?? 0), 0);
    expect(total("+1/+1")).toBe(1);
    expect(total("flying")).toBe(1);
    expect(total("-1/-1")).toBe(0);
    expect(fish.some((c) => (c["+1/+1"] ?? 0) === 1 && (c.flying ?? 0) === 0)).toBe(true);
    expect(counters(game, bears)).toBe(2);
  });

  it("both on the same Fish, if that's the choice", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", A);
    putCounter(game, bears, "+1/+1");
    putCounter(game, bears, "lifelink");
    const chosen: ObjectId[] = [];
    a.choosePermanentsFn = (_view, eligible) => {
      const pick = chosen[0] !== undefined && eligible.includes(chosen[0]) ? chosen[0] : eligible[0];
      chosen.push(pick);
      return [pick];
    };
    pets(game);
    const fish = fishCounters(game);
    expect(fish.filter((c) => (c["+1/+1"] ?? 0) === 1 && (c.lifelink ?? 0) === 1)).toHaveLength(1);
    expect(fish.filter((c) => Object.keys(c).length === 0)).toHaveLength(1);
  });

  it("no counters among your creatures: just the two Fish, no question", () => {
    const { game, a } = table();
    spawn(game, "Grizzly Bears", A);
    let asked = 0;
    a.choosePermanentsFn = (_view, eligible) => {
      asked += 1;
      return [eligible[0]];
    };
    pets(game);
    expect(asked).toBe(0);
    expect(fishCounters(game)).toHaveLength(2);
  });
});
