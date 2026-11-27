/**
 * "Another creature" / "other creatures" on an Aura: other than the enchanted
 * creature — Vampirism's statics (`hostOfSource: false`), Unnatural Hunger's
 * sacrifice (`notObject: "attached"`).
 */

import { describe, expect, it } from "vitest";

import { A, B, cast, nextTurn, pt, ref, spawn, table, toHand } from "./harness.js";
import type { ScriptedController } from "../controller.js";

/** Takes the first offer, and keeps what was offered. */
const answer = (seat: ScriptedController): string[][] => {
  const offered: string[][] = [];
  seat.chooseModesFn = (_view, _min, _max, modes) => {
    offered.push([...modes]);
    return [0];
  };
  return offered;
};

describe("other than the enchanted creature", () => {
  it("Vampirism: +1/+1 for each other creature you control, and they get -1/-1", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant", A);
    const bears = spawn(game, "Grizzly Bears", A);
    const elves = spawn(game, "Llanowar Elves", A);
    const theirs = spawn(game, "Grizzly Bears", B);
    spawn(game, "Swamp", A);
    spawn(game, "Swamp", A);
    cast(game, toHand(game, "Vampirism"), { targets: [ref(giant)] });
    expect(pt(game, giant)).toEqual({ power: 4, toughness: 4 });
    expect(pt(game, bears)).toEqual({ power: 1, toughness: 1 });
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
    // The elves died to -1/-1 (0 toughness): one other creature left.
    expect(game.state.objects[elves].zone).toBe("graveyard");
  });

  it("Unnatural Hunger: the enchanted creature isn't another creature to sacrifice", () => {
    const { game, b } = table();
    const offered = answer(b);
    const giant = spawn(game, "Hill Giant", B);
    for (let i = 0; i < 5; i++) spawn(game, "Swamp", A);
    cast(game, toHand(game, "Unnatural Hunger"), { targets: [ref(giant)] });
    // Bob's upkeep, with nothing else to sacrifice: 3 damage.
    nextTurn(game, "draw");
    expect(offered).toEqual([]);
    expect(game.state.objects[giant].zone).toBe("battlefield");
    expect(game.state.players[B].life).toBe(17);
  });

  it("Unnatural Hunger: another creature can be sacrificed instead", () => {
    const { game, b } = table();
    const offered = answer(b);
    const giant = spawn(game, "Hill Giant", B);
    const bears = spawn(game, "Grizzly Bears", B);
    for (let i = 0; i < 5; i++) spawn(game, "Swamp", A);
    cast(game, toHand(game, "Unnatural Hunger"), { targets: [ref(giant)] });
    nextTurn(game, "draw");
    expect(offered).toEqual([["Sacrifice another creature"]]);
    expect(game.state.objects[bears].zone).toBe("graveyard");
    expect(game.state.objects[giant].zone).toBe("battlefield");
    expect(game.state.players[B].life).toBe(20);
  });
});
