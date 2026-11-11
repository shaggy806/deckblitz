/**
 * "It has an odd / even number of counters on it" — the `self-counters`
 * condition's `parity`, on Sab-Sunen, Luxa Embodied: a static restriction's
 * condition, and a resolving ability's "then if".
 */

import { describe, expect, it } from "vitest";

import { defendersForAttacker } from "../combat/eligibility.js";
import { A, B, blockOffer, counters, hand, nextTurn, ref, settle, spawn, table } from "./harness.js";

const SAB = "Sab-Sunen, Luxa Embodied";

describe("Sab-Sunen, Luxa Embodied", () => {
  it("attacks with an even number of counters of any kinds, zero included, and not with an odd one", () => {
    const { game } = table();
    const sab = spawn(game, SAB, A);
    const canAttack = () => defendersForAttacker(game.state, game.registry, A, sab).length > 0;
    expect(canAttack()).toBe(true);

    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 }, [ref(sab)]);
    settle(game);
    expect(canAttack()).toBe(false);

    // One +1/+1 and one charge: two counters.
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "charge", amount: 1 }, [ref(sab)]);
    settle(game);
    expect(canAttack()).toBe(true);

    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 3 }, [ref(sab)]);
    settle(game);
    expect(canAttack()).toBe(false);
  });

  it("blocks only with an even number", () => {
    for (const [n, can] of [
      [1, false],
      [2, true],
    ] as const) {
      const { game, a } = table();
      const sab = spawn(game, SAB, B);
      game.debugApplyEffect(B, { kind: "add-counter", target: 0, counter: "+1/+1", amount: n }, [ref(sab)]);
      settle(game);
      // Another blocker of Bob's, so he's asked to block this turn either way.
      const other = spawn(game, "Grizzly Bears", B);
      const bears = spawn(game, "Grizzly Bears", A);
      const offer = blockOffer(game, a, [bears]);
      expect(game.state.turn.number).toBe(1);
      expect(offer.eligible.find((e) => e.blocker === other)?.canBlock).toEqual([bears]);
      expect(offer.eligible.find((e) => e.blocker === sab)?.canBlock ?? []).toEqual(can ? [bears] : []);
    }
  });

  it("gets a counter in your first main phase, and draws two only when that makes the count odd", () => {
    const { game } = table();
    const sab = spawn(game, SAB, A);

    // Alice's next turn: 0 -> 1 counter, odd. Her draw step's card, and two.
    let before = hand(game, A).length;
    nextTurn(game);
    nextTurn(game);
    settle(game);
    expect(counters(game, sab)).toBe(1);
    expect(hand(game, A).length).toBe(before + 3);
    expect(defendersForAttacker(game.state, game.registry, A, sab)).toEqual([]);

    // The turn after: 1 -> 2, even. Only the draw step's card.
    before = hand(game, A).length;
    nextTurn(game);
    nextTurn(game);
    settle(game);
    expect(counters(game, sab)).toBe(2);
    expect(hand(game, A).length).toBe(before + 1);
    expect(defendersForAttacker(game.state, game.registry, A, sab)).toEqual([B]);
  });

  it("counts every kind for the draw: a counter of another kind already there makes the new total even", () => {
    const { game } = table();
    const sab = spawn(game, SAB, A);
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "charge", amount: 1 }, [ref(sab)]);
    settle(game);
    const before = hand(game, A).length;
    nextTurn(game);
    nextTurn(game);
    settle(game);
    expect(counters(game, sab)).toBe(1);
    expect(hand(game, A).length).toBe(before + 1);
  });
});
