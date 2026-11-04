/**
 * Contagion Engine: a -1/-1 counter on each creature of the player its enters
 * trigger targets, and "proliferate twice" as two whole proliferate actions,
 * each with its own choice (the card's 2011 rulings; rule 701.34a).
 */

import { describe, expect, it } from "vitest";

import { A, B, C, activate, counters, enter, lands, pickTargets, ref, settle, spawn, table, zone } from "./harness.js";

describe("Contagion Engine", () => {
  it("counts only the creatures of the player it targets, as it resolves", () => {
    const { game, a } = table({ players: 3 });
    const bobs = spawn(game, "Grizzly Bears", B);
    const bobsSmall = spawn(game, "Llanowar Elves", B);
    const carols = spawn(game, "Grizzly Bears", C);
    const mine = spawn(game, "Grizzly Bears", A);
    pickTargets(a, B);
    enter(game, "Contagion Engine", A);
    expect(counters(game, bobs, "-1/-1")).toBe(1);
    expect(zone(game, bobsSmall)).toBe("graveyard");
    expect(counters(game, carols, "-1/-1")).toBe(0);
    expect(counters(game, mine, "-1/-1")).toBe(0);
  });

  it("proliferates twice, a choice each time", () => {
    const { game, a } = table();
    const engine = spawn(game, "Contagion Engine", A);
    lands(game, "Wastes", 4);
    const first = spawn(game, "Grizzly Bears", A);
    const second = spawn(game, "Grizzly Bears", A);
    game.state.objects[first].counters = { "+1/+1": 1 };
    game.state.objects[second].counters = { "+1/+1": 1 };
    const asked: number[] = [];
    // The first action takes the first bear, the second the second: two
    // choices, not one choice applied twice.
    a.chooseProliferateFn = (_view, eligible) => {
      asked.push(eligible.length);
      return [ref(asked.length === 1 ? first : second)];
    };
    activate(game, engine, 0);
    settle(game);
    expect(asked).toEqual([2, 2]);
    expect(counters(game, first)).toBe(2);
    expect(counters(game, second)).toBe(2);
    expect(game.state.objects[engine].tapped).toBe(true);
  });
});
