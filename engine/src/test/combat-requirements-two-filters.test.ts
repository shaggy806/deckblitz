/**
 * Rule 509.1c: "must be blocked by [filter] if able" twice over, with two
 * filters, is two requirements, each counted toward the most that can be
 * obeyed: one blocker of either kind obeys only its own.
 */

import { describe, expect, it } from "vitest";

import { blockingViolations, ifAblePlan, obeyingLure } from "../combat/blocking.js";
import type { CardFilter } from "../filter.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, blockOffer, ref, spawn, table } from "./harness.js";

const ELDRAZI: CardFilter = { type: "creature", subtype: "Eldrazi" };
const BEAR: CardFilter = { type: "creature", subtype: "Bear" };
const CREATURE: CardFilter = { type: "creature" };

const attackerUnder = (game: Game, ...filters: readonly CardFilter[]): ObjectId => {
  const attacker = spawn(game, "Grizzly Bears");
  for (const by of filters) {
    game.debugApplyEffect(A, { kind: "restrict", target: 0, restrictions: [{ kind: "must-be-blocked-if-able", by }] }, [ref(attacker)]);
  }
  return attacker;
};

const legal = (game: Game, attacker: ObjectId, ...blockers: readonly ObjectId[]): boolean =>
  game.canDispatch({
    type: "declare-blockers",
    player: B,
    blocks: blockers.map((blocker) => ({ blocker, attacker })),
  }) === null;

describe("two \"must be blocked by\" filters on one attacker", () => {
  it("are each obeyed, by a blocker of each kind", () => {
    const { game, a } = table();
    const attacker = attackerUnder(game, ELDRAZI, BEAR);
    const eldrazi = spawn(game, "Eldrazi Devastator", B);
    const bear = spawn(game, "Grizzly Bears", B);
    const offer = blockOffer(game, a, [attacker]);
    expect(ifAblePlan(offer).required).toBe(2);
    expect(legal(game, attacker, eldrazi)).toBe(false);
    expect(legal(game, attacker, bear)).toBe(false);
    expect(legal(game, attacker, eldrazi, bear)).toBe(true);
  });

  it("only one of them can be obeyed when only one kind can block", () => {
    const { game, a } = table();
    const attacker = attackerUnder(game, ELDRAZI, BEAR);
    const eldrazi = spawn(game, "Eldrazi Devastator", B);
    const giant = spawn(game, "Hill Giant", B);
    blockOffer(game, a, [attacker]);
    expect(legal(game, attacker, eldrazi)).toBe(true);
    expect(legal(game, attacker, giant)).toBe(false);
  });

  it("one creature of both kinds obeys both", () => {
    const { game, a } = table();
    const attacker = attackerUnder(game, ELDRAZI, CREATURE);
    const eldrazi = spawn(game, "Eldrazi Devastator", B);
    const bear = spawn(game, "Grizzly Bears", B);
    blockOffer(game, a, [attacker]);
    expect(legal(game, attacker, eldrazi)).toBe(true);
    expect(legal(game, attacker, bear)).toBe(false);
  });

  it("with room for one blocker, either one obeys as many as can be", () => {
    const { game, a } = table();
    const attacker = attackerUnder(game, ELDRAZI, BEAR);
    game.debugApplyEffect(A, { kind: "restrict", target: 0, restrictions: [{ kind: "cant-be-blocked", byMoreThan: 1 }] }, [ref(attacker)]);
    const eldrazi = spawn(game, "Eldrazi Devastator", B);
    const bear = spawn(game, "Grizzly Bears", B);
    const offer = blockOffer(game, a, [attacker]);
    expect(ifAblePlan(offer).required).toBe(1);
    expect(legal(game, attacker, eldrazi)).toBe(true);
    expect(legal(game, attacker, bear)).toBe(true);
    expect(legal(game, attacker, eldrazi, bear)).toBe(false);
  });

  it("gives a driver a declaration that obeys both", () => {
    const { game, a } = table();
    const attacker = attackerUnder(game, ELDRAZI, BEAR);
    spawn(game, "Eldrazi Devastator", B);
    spawn(game, "Grizzly Bears", B);
    const offer = blockOffer(game, a, [attacker]);
    expect(blockingViolations(obeyingLure([], offer), offer)).toEqual([]);
  });

  it("two copies of one filter ask for one creature of that kind", () => {
    const { game, a } = table();
    const attacker = attackerUnder(game, ELDRAZI, ELDRAZI);
    const eldrazi = spawn(game, "Eldrazi Devastator", B);
    spawn(game, "Eldrazi Devastator", B);
    blockOffer(game, a, [attacker]);
    expect(legal(game, attacker, eldrazi)).toBe(true);
  });
});
