/**
 * "Each kind of counter among permanents you control" as an amount
 * (`amount:counter-kinds-among`): the `distinct` aggregate's `"counter-kind"`
 * over `{ controlledBy: "you" }` — each kind (rule 122.1) on any permanent
 * you control counted once, however many of it and on however many
 * permanents; an opponent's permanents' counters and players' counters
 * aren't among them. Storm of Forms (a cast trigger's copy count) and Perrie,
 * the Pulverizer (an attack trigger's +X/+X).
 */
import { describe, expect, it } from "vitest";

import { invalidateComputedCache } from "../characteristics.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import { A, B, attack, cast, counters, enter, keywords, lands, pickTargets, pt, ref, settle, spawn, table, toHand, zone } from "./harness.js";

function put(game: Game, id: ObjectId, kind: string, n = 1): void {
  game.state.objects[id].counters = { ...game.state.objects[id].counters, [kind]: n };
  invalidateComputedCache();
}

describe("Storm of Forms", () => {
  it("is copied once for each kind of counter among your permanents, each copy free to pick a new target", () => {
    const { game, a } = table();
    lands(game, "Island", 4);
    // Two kinds: +1/+1 (on two creatures, three in all) and shield.
    put(game, spawn(game, "Grizzly Bears"), "+1/+1", 2);
    put(game, spawn(game, "Grizzly Bears"), "+1/+1");
    put(game, spawn(game, "Grizzly Bears"), "shield");
    // Not yours: an opponent's -1/-1 counter, and a player's poison.
    const b1 = spawn(game, "Grizzly Bears", B);
    const b2 = spawn(game, "Grizzly Bears", B);
    const b3 = spawn(game, "Grizzly Bears", B);
    put(game, b3, "-1/-1");
    (game.state.players[A] as { counters: Record<string, number> }).counters = { poison: 1 };
    let asked = 0;
    a.chooseTargetsFn = () => {
      asked += 1;
      return [ref(asked === 1 ? b2 : b3)];
    };
    cast(game, toHand(game, "Storm of Forms"), { targets: [ref(b1)] });
    settle(game);
    expect(asked).toBe(2);
    for (const bear of [b1, b2, b3]) expect(zone(game, bear)).toBe("hand");
  });

  it("isn't copied with no counters on your permanents", () => {
    const { game, a } = table();
    lands(game, "Island", 4);
    const b1 = spawn(game, "Grizzly Bears", B);
    put(game, b1, "+1/+1");
    let asked = 0;
    a.chooseTargetsFn = () => {
      asked += 1;
      return [ref(b1)];
    };
    cast(game, toHand(game, "Storm of Forms"), { targets: [ref(b1)] });
    settle(game);
    expect(asked).toBe(0);
    expect(zone(game, b1)).toBe("hand");
  });
});

describe("Perrie, the Pulverizer", () => {
  it("puts a shield counter on target creature as it enters", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    enter(game, "Perrie, the Pulverizer");
    expect(counters(game, bears, "shield")).toBe(1);
  });

  it("gives the target trample and +X/+X as it attacks, X the kinds of counters among your permanents", () => {
    const { game, a } = table();
    const perrie = spawn(game, "Perrie, the Pulverizer");
    const bears = spawn(game, "Grizzly Bears");
    // Three kinds: shield, +1/+1 (twice over) and a land's charge counter.
    put(game, perrie, "shield");
    put(game, bears, "+1/+1", 2);
    const [island] = lands(game, "Island", 1);
    put(game, island, "charge", 3);
    put(game, spawn(game, "Grizzly Bears", B), "lore");
    pickTargets(a, bears);
    attack(game, a, [perrie]);
    settle(game);
    expect(keywords(game, bears).has("trample")).toBe(true);
    // 2/2 with two +1/+1 counters, then +3/+3.
    expect(pt(game, bears)).toEqual({ power: 7, toughness: 7 });
  });
});
