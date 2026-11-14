/**
 * Cumulative upkeep whose cost is an act (rule 702.24a — `cumulativeUpkeep({
 * doing, text })`): the act done once per age counter as a `repeat`, each
 * pass with its own choices ("each choice is made separately for each age
 * counter"). Wall of Shards' "An opponent gains 1 life", an opponent chosen
 * for each counter.
 */
import { describe, expect, it } from "vitest";
import { A, B, C, counters, life, nextTurn, pickModes, spawn, table, zone } from "./harness.js";

describe("cumulative upkeep paid by an act", () => {
  it("Wall of Shards: the opponent gains 1 life per age counter, or the Wall is sacrificed", () => {
    const { game, a } = table();
    const wall = spawn(game, "Wall of Shards");
    pickModes(a, 0);
    nextTurn(game);
    nextTurn(game);
    expect(counters(game, wall, "age")).toBe(1);
    expect(life(game, B)).toBe(21);
    nextTurn(game);
    nextTurn(game);
    expect(counters(game, wall, "age")).toBe(2);
    expect(life(game, B)).toBe(23);
    expect(life(game, A)).toBe(20);
    pickModes(a);
    nextTurn(game);
    nextTurn(game);
    expect(zone(game, wall)).toBe("graveyard");
    expect(life(game, B)).toBe(23);
  });

  it("Wall of Shards: with two opponents, one is chosen for each age counter", () => {
    const { game, a } = table({ players: 3 });
    const wall = spawn(game, "Wall of Shards");
    // Three turns pass (bob's, carol's, then alice's upkeep with one counter):
    // pay, and give the life to carol.
    const asked: string[][] = [];
    a.chooseModesFn = (_view, _min, _max, texts) => {
      asked.push([...texts]);
      // The unless question offers the cost; the opponent question names players.
      const pick = texts.findIndex((t) => t.includes(C) || /carol/i.test(t));
      return [pick >= 0 ? pick : 0];
    };
    nextTurn(game);
    nextTurn(game);
    nextTurn(game);
    expect(counters(game, wall, "age")).toBe(1);
    expect(life(game, C)).toBe(21);
    expect(life(game, B)).toBe(20);
    // Next upkeep, two counters: carol first, then bob.
    const order = [C, B];
    let opponentQuestions = 0;
    a.chooseModesFn = (_view, _min, _max, texts) => {
      const who = order[opponentQuestions];
      const pick = texts.findIndex((t) => t.includes(who) || t.toLowerCase().includes(who === C ? "carol" : "bob"));
      if (pick < 0) return [0];
      opponentQuestions++;
      return [pick];
    };
    nextTurn(game);
    nextTurn(game);
    nextTurn(game);
    expect(counters(game, wall, "age")).toBe(2);
    expect(opponentQuestions).toBe(2);
    expect(life(game, C)).toBe(22);
    expect(life(game, B)).toBe(21);
    expect(asked.length).toBeGreaterThan(0);
  });
});
