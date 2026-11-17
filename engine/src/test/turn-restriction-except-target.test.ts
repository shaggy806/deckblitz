/**
 * Intimidation Bolt: "deals 3 damage to target creature. Other creatures
 * can't attack this turn." — `restrict` over every creature for the turn
 * (rule 611.2c: a creature that enters later is bound too), leaving the target
 * out as the object it is now (`exceptTarget`, rule 400.7). The card's
 * rulings: a surviving target may attack alone; a destroyed one leaves no
 * creature free to attack; an illegal target means nothing happens (608.2b).
 */
import { describe, expect, it } from "vitest";

import { whyCannotAttack } from "../combat/eligibility.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, cast, destroy, lands, nextTurn, ref, registryOf, spawn, table, toHand, toStep, zone } from "./harness.js";

const mayAttack = (game: Game, attacker: ObjectId, player: PlayerId = A, defender: PlayerId = B): boolean =>
  whyCannotAttack(game.state, registryOf(game), player, attacker, defender) === null;

function boltReady(game: Game): ObjectId {
  lands(game, "Mountain", 2);
  lands(game, "Plains", 1);
  return toHand(game, "Intimidation Bolt");
}

describe("Intimidation Bolt: 3 damage to a creature, and other creatures can't attack this turn", () => {
  it("a surviving target may attack; every other creature, either side's or one arriving later, can't", () => {
    const { game } = table();
    const dragon = spawn(game, "Shivan Dragon");
    const bears = spawn(game, "Grizzly Bears");
    const bolt = boltReady(game);
    expect(mayAttack(game, bears)).toBe(true);
    cast(game, bolt, { targets: [ref(dragon)] });
    expect(game.state.objects[dragon].damageMarked).toBe(3);
    expect(mayAttack(game, dragon)).toBe(true);
    expect(mayAttack(game, bears)).toBe(false);
    const later = spawn(game, "Grizzly Bears");
    expect(mayAttack(game, later)).toBe(false);

    // Bob's next turn: the rule is gone.
    const bobs = spawn(game, "Grizzly Bears", B);
    nextTurn(game);
    toStep(game, "precombat-main", B);
    expect(mayAttack(game, bobs, B, A)).toBe(true);
  });

  it("a target the damage destroys leaves no creature free to attack", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant");
    const bears = spawn(game, "Grizzly Bears");
    cast(game, boltReady(game), { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("graveyard");
    expect(mayAttack(game, bears)).toBe(false);
  });

  it("with its target gone as it resolves, nothing happens: creatures may still attack", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant");
    const bears = spawn(game, "Grizzly Bears");
    cast(game, boltReady(game), { targets: [ref(giant)], settle: false });
    destroy(game, giant);
    expect(mayAttack(game, bears)).toBe(true);
  });
});
