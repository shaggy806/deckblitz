/**
 * "Any target that was dealt damage this turn" (Needle Drop): a `permanent`
 * slot's `playerWith: { turnStat: "damage-taken" }` is the player's side of
 * what `damagedThisTurnBy: {}` asks of a creature, planeswalker or battle.
 *
 * - nothing dealt damage this turn: no legal target, so it can't be cast;
 * - a player dealt damage is a legal target, one who wasn't isn't;
 * - a creature or planeswalker dealt damage is, an undamaged one isn't;
 * - last turn's damage doesn't count;
 * - it deals 1 damage and its controller draws a card.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import type { TargetRef } from "../target.js";
import { A, B, cast, counters, hand, lands, life, nextTurn, ref, spawn, table, toHand, toLibrary, zone } from "./harness.js";

const player = (id: typeof A | typeof B): TargetRef => ({ kind: "player", player: id });

/** Damage from a creature of Bob's (a damage record names its source). */
const damage = (game: Game, to: TargetRef, amount = 1): void => {
  const source = spawn(game, "Grizzly Bears", B);
  game.debugApplyEffect(B, { kind: "damage", amount, target: 0 }, [to], { source });
};

/** Whether Needle Drop may be cast at `target` now. */
const mayTarget = (game: Game, drop: ObjectId, target: TargetRef): boolean =>
  game.canDispatch({ type: "cast-spell", player: A, card: drop, targets: [target] }) === null;

function setup(): { game: Game; drop: ObjectId } {
  const { game } = table();
  lands(game, "Mountain", 2);
  const drop = toHand(game, "Needle Drop");
  toLibrary(game, "Grizzly Bears");
  return { game, drop };
}

describe("Needle Drop", () => {
  it("has no target while nothing has been dealt damage this turn", () => {
    const { game, drop } = setup();
    const giant = spawn(game, "Hill Giant", B);
    expect(mayTarget(game, drop, player(A))).toBe(false);
    expect(mayTarget(game, drop, player(B))).toBe(false);
    expect(mayTarget(game, drop, ref(giant))).toBe(false);
    expect(game.legalActions(A).some((a) => a.kind === "cast-spell" && a.card === drop)).toBe(false);
  });

  it("targets a player who was dealt damage, and not one who wasn't", () => {
    const { game, drop } = setup();
    damage(game, player(B), 2);
    expect(mayTarget(game, drop, player(A))).toBe(false);
    expect(mayTarget(game, drop, player(B))).toBe(true);
    const before = hand(game).length;
    cast(game, drop, { targets: [player(B)] });
    expect(life(game, B)).toBe(17);
    // Needle Drop left the hand, a card was drawn.
    expect(hand(game).length).toBe(before);
    expect(zone(game, drop)).toBe("graveyard");
  });

  it("targets its own controller, dealt damage this turn", () => {
    const { game, drop } = setup();
    damage(game, player(A));
    expect(mayTarget(game, drop, player(A))).toBe(true);
    expect(mayTarget(game, drop, player(B))).toBe(false);
  });

  it("targets a creature or planeswalker that was dealt damage, not an undamaged one", () => {
    const { game, drop } = setup();
    const giant = spawn(game, "Hill Giant", B);
    const other = spawn(game, "Hill Giant", B);
    const walker = spawn(game, "Chandra, Torch of Defiance", B);
    const loyalty = counters(game, walker, "loyalty");
    damage(game, ref(giant));
    expect(mayTarget(game, drop, ref(giant))).toBe(true);
    expect(mayTarget(game, drop, ref(other))).toBe(false);
    expect(mayTarget(game, drop, ref(walker))).toBe(false);
    // Damage to a permanent isn't damage to its controller.
    expect(mayTarget(game, drop, player(B))).toBe(false);
    damage(game, ref(walker));
    expect(counters(game, walker, "loyalty")).toBe(loyalty - 1);
    expect(mayTarget(game, drop, ref(walker))).toBe(true);
    cast(game, drop, { targets: [ref(walker)] });
    expect(counters(game, walker, "loyalty")).toBe(loyalty - 2);
  });

  it("doesn't count damage dealt on an earlier turn", () => {
    const { game, drop } = setup();
    const giant = spawn(game, "Hill Giant", B);
    damage(game, player(B));
    damage(game, ref(giant));
    nextTurn(game);
    nextTurn(game);
    expect(mayTarget(game, drop, player(B))).toBe(false);
    expect(mayTarget(game, drop, ref(giant))).toBe(false);
  });
});
