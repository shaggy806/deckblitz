/**
 * An attack tax in Phyrexian mana (rule 508.1h; 107.4f — Norn's Annex's
 * "pays {W/P} for each of those creatures"): each pip paid with {W} or 2
 * life, the attacker choosing for each (its ruling) through the
 * declaration's `phyrexianLife`; omitted, mana pays what it can and life the
 * rest. Two Annexes are two pips a creature (its ruling).
 */

import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import { withinAttackTax } from "../combat/attacking.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, lands, life, spawn, table } from "./harness.js";

type Offer = Extract<LegalAction, { kind: "declare-attackers" }>;

const toAttackers = (game: Game): Offer => {
  game.advanceUntil((s) => s.awaiting?.kind === "attackers" || s.result.over);
  const offer = game.legalActions(A).find((a): a is Offer => a.kind === "declare-attackers");
  if (offer === undefined) throw new Error("alice isn't declaring attackers");
  return offer;
};
const declare = (attackers: readonly ObjectId[], defender: PlayerId | ObjectId, phyrexianLife?: number) => ({
  type: "declare-attackers" as const,
  player: A,
  attackers: attackers.map((attacker) => ({ attacker, defender })),
  ...(phyrexianLife !== undefined ? { phyrexianLife } : {}),
});
const untapped = (game: Game, ids: readonly ObjectId[]): number =>
  ids.filter((id) => !game.state.objects[id].tapped).length;

describe("Norn's Annex: {W/P} for each creature attacking you or your planeswalkers", () => {
  it("offers the pip on its controller and their planeswalkers, with the life budget", () => {
    const { game } = table();
    spawn(game, "Grizzly Bears");
    spawn(game, "Norn's Annex", B);
    const walker = spawn(game, "Ajani, Caller of the Pride", B);
    const offer = toAttackers(game);
    expect(offer.attackTax?.phyrexianPerCreature).toEqual({ [B]: "{W/P}", [walker]: "{W/P}" });
    expect(offer.attackTax?.lifeBudget).toBe(life(game, A));
    expect(offer.mustAttack).toEqual([]);
  });

  it("pays {W} when the attacker names no life and has it", () => {
    const { game } = table();
    const plains = lands(game, "Plains", 1);
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Norn's Annex", B);
    toAttackers(game);
    const before = life(game, A);
    game.dispatch(declare([bears], B));
    expect(game.state.objects[bears].attacking).toBe(B);
    expect(untapped(game, plains)).toBe(0);
    expect(life(game, A)).toBe(before);
  });

  it("pays 2 life instead when the attacker chooses, with {W} to spare", () => {
    const { game } = table();
    const plains = lands(game, "Plains", 1);
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Norn's Annex", B);
    toAttackers(game);
    const before = life(game, A);
    game.dispatch(declare([bears], B, 1));
    expect(untapped(game, plains)).toBe(1);
    expect(life(game, A)).toBe(before - 2);
  });

  it("pays in life what mana can't, each creature's pip on its own (its ruling)", () => {
    const { game } = table();
    const plains = lands(game, "Plains", 1);
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    spawn(game, "Norn's Annex", B);
    toAttackers(game);
    const before = life(game, A);
    game.dispatch(declare([bears, giant], B));
    expect(untapped(game, plains)).toBe(0);
    expect(life(game, A)).toBe(before - 2);
  });

  it("two Annexes are two pips a creature", () => {
    const { game } = table();
    const plains = lands(game, "Plains", 1);
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Norn's Annex", B);
    spawn(game, "Norn's Annex", B);
    expect(toAttackers(game).attackTax?.phyrexianPerCreature?.[B]).toBe("{W/P}{W/P}");
    const before = life(game, A);
    game.dispatch(declare([bears], B, 1));
    expect(untapped(game, plains)).toBe(0);
    expect(life(game, A)).toBe(before - 2);
  });

  it("other mana doesn't pay {W/P}, and at 1 life nor does life (rule 119.4)", () => {
    const { game } = table({ life: 1 });
    lands(game, "Mountain", 2);
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Norn's Annex", B);
    toAttackers(game);
    expect(game.canDispatch(declare([bears], B))).toMatch(/can't pay/);
    expect(game.canDispatch(declare([bears], B, 1))).toMatch(/can't pay/);
  });

  it("refuses more pips in life than the attack has", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Norn's Annex", B);
    toAttackers(game);
    expect(game.canDispatch(declare([bears], B, 2))).toMatch(/Phyrexian/);
  });

  it("a driver that doesn't choose keeps the attack within its life, pips as 2 life each", () => {
    const { game } = table({ life: 3 });
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    spawn(game, "Norn's Annex", B);
    const offer = toAttackers(game);
    const kept = withinAttackTax(
      [bears, giant].map((attacker) => ({ attacker, defender: B })),
      offer,
    );
    expect(kept).toHaveLength(1);
    game.dispatch({ type: "declare-attackers", player: A, attackers: kept });
    expect(life(game, A)).toBe(1);
  });

  it("a creature that must attack isn't obliged to pay (its ruling)", () => {
    const { game } = table();
    spawn(game, "Juggernaut");
    spawn(game, "Norn's Annex", B);
    const offer = toAttackers(game);
    expect(offer.mustAttack).toEqual([]);
    expect(game.canDispatch({ type: "declare-attackers", player: A, attackers: [] })).toBeNull();
  });
});
