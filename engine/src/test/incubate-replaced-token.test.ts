/**
 * Incubate (rule 701.53a) creates a token that enters with counters. A replacement of the token
 * (Draconic Visitor) changes what's created, not the rest of what the effect says: "Anything else
 * specified in the effect creating the tokens ... still applies" (its ruling, and Chatterfang's).
 */
import { describe, expect, it } from "vitest";

import { A, settle, spawn, table } from "./harness.js";
import type { Game } from "../game.js";

const named = (game: Game, name: string): readonly string[] =>
  game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].cardName === name);
const plusOnes = (game: Game, id: string): number => game.state.objects[id].counters["+1/+1"] ?? 0;
const incubate = (game: Game, amount: number): void => {
  game.debugApplyEffect(A, { kind: "incubate", amount });
  settle(game);
};

describe("incubate under a token replacement", () => {
  it("a plain Incubator has the counters", () => {
    const { game } = table();
    incubate(game, 3);
    expect(plusOnes(game, named(game, "Incubator Token")[0])).toBe(3);
  });

  it("the Dragon made in its place enters with them", () => {
    const { game } = table();
    spawn(game, "Draconic Visitor", A);
    incubate(game, 3);
    expect(named(game, "Incubator Token")).toHaveLength(0);
    expect(plusOnes(game, named(game, "Dragon Token")[0])).toBe(3);
  });

  it("the Squirrel made beside it does too", () => {
    const { game } = table();
    spawn(game, "Chatterfang, Squirrel General", A);
    incubate(game, 2);
    expect(plusOnes(game, named(game, "Incubator Token")[0])).toBe(2);
    expect(plusOnes(game, named(game, "Squirrel Token")[0])).toBe(2);
  });
});
