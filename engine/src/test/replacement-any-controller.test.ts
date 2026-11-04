/**
 * Token and counter multipliers that reach every player's (`anyController`):
 * Primal Vigor, ruling by ruling.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, cast, counters, lands, named, ref, settle, spawn, table, toHand, tokensNamed } from "./harness.js";

const make = (game: Game, token: string, player = A): void => {
  game.debugApplyEffect(player, { kind: "create-token", token, count: 1 });
  settle(game);
};

const putCounters = (game: Game, on: ObjectId, amount: number, by = A): void => {
  game.debugApplyEffect(by, { kind: "add-counter", target: 0, counter: "+1/+1", amount }, [ref(on)]);
  settle(game);
};

describe("Primal Vigor", () => {
  it("doubles tokens whoever controls them", () => {
    const { game } = table();
    spawn(game, "Primal Vigor");
    make(game, "Goblin Token");
    make(game, "Treasure Token", B);
    expect(tokensNamed(game, "Goblin Token", A)).toBe(2);
    expect(tokensNamed(game, "Treasure Token", B)).toBe(2);
  });

  it("its controller's opponent's Primal Vigor doubles yours too", () => {
    const { game } = table();
    spawn(game, "Primal Vigor", B);
    make(game, "Goblin Token");
    expect(tokensNamed(game, "Goblin Token", A)).toBe(2);
  });

  it("two of them are four times, each player's", () => {
    const { game } = table();
    spawn(game, "Primal Vigor");
    spawn(game, "Primal Vigor", B);
    make(game, "Goblin Token");
    expect(tokensNamed(game, "Goblin Token", A)).toBe(4);
  });

  it("with Anointed Procession, only for its controller's tokens", () => {
    const { game } = table();
    spawn(game, "Primal Vigor");
    spawn(game, "Anointed Procession");
    make(game, "Goblin Token");
    make(game, "Goblin Token", B);
    expect(tokensNamed(game, "Goblin Token", A)).toBe(4);
    expect(tokensNamed(game, "Goblin Token", B)).toBe(2);
  });

  it("doubles +1/+1 counters on anyone's creature, and no other counter", () => {
    const { game } = table();
    spawn(game, "Primal Vigor");
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    putCounters(game, mine, 1);
    putCounters(game, theirs, 2, B);
    expect(counters(game, mine)).toBe(2);
    expect(counters(game, theirs)).toBe(4);
    const baloth = spawn(game, "Rumbling Baloth", B);
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "-1/-1", amount: 1 }, [ref(baloth)]);
    settle(game);
    expect(counters(game, baloth, "-1/-1")).toBe(1);
  });

  it("only on a creature", () => {
    const { game } = table();
    spawn(game, "Primal Vigor");
    const land = spawn(game, "Wastes");
    putCounters(game, land, 1);
    expect(counters(game, land)).toBe(1);
  });

  it("a creature entering with counters (ruling), an opponent's Primal Vigor or not", () => {
    const { game } = table();
    spawn(game, "Primal Vigor", B);
    lands(game, "Forest", 3);
    cast(game, toHand(game, "Spike Feeder"));
    expect(counters(game, named(game, "Spike Feeder", A)[0])).toBe(4);
  });
});
