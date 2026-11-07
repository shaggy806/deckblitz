/**
 * "Choose a player … Choose a second player … Then choose a third player"
 * (the need key `decision:choose-different-players`): `choose-opponent`'s
 * `thenAnother` makes each later choice among the players not chosen before
 * it in the chain — Gluntch, the Bestower's ruling: "All three players must
 * be different players, although any one of them can be you. If there are
 * only two players in the game, you won't choose a third player."
 */
import { describe, expect, it } from "vitest";

import type { PlayerId } from "../primitives.js";
import type { Table } from "./harness.js";
import { A, B, C, D, counters, hand, pickPermanents, settle, spawn, table, toStep, tokensNamed } from "./harness.js";

/** Alice's answers to the choices in order, by player; records each offer's
 * texts. */
function choose(t: Table, ...picks: readonly PlayerId[]): string[][] {
  const offers: string[][] = [];
  t.a.chooseModesFn = (_view, _min, _max, texts) => {
    offers.push([...texts]);
    const want = picks[offers.length - 1];
    const i = texts.findIndex((text) => text.includes(want));
    if (i < 0) throw new Error(`${want} not offered: ${texts.join(" / ")}`);
    return [i];
  };
  return offers;
}

const endStep = (t: Table): void => {
  toStep(t.game, "end", A);
  settle(t.game);
};

describe("choose different players in turn", () => {
  it("Gluntch at four players: three different players, each offered only those not yet chosen", () => {
    const t = table({ players: 4 });
    spawn(t.game, "Gluntch, the Bestower");
    spawn(t.game, "Grizzly Bears", C);
    const carols = spawn(t.game, "Grizzly Bears", C);
    const picked = pickPermanents(t.c, carols);
    const offers = choose(t, C, A, D);
    const aliceHand = hand(t.game, A).length;
    endStep(t);
    expect(offers).toHaveLength(3);
    expect(offers[0]).toHaveLength(4);
    expect(offers[0].find((s) => s.includes(C))).toBe(
      `Choose ${C} to put two +1/+1 counters on a creature they control`,
    );
    // Carol, chosen first, isn't offered again; then neither is alice.
    expect(offers[1].some((s) => s.includes(C))).toBe(false);
    expect(offers[1]).toHaveLength(3);
    expect(offers[2].map((s) => [A, B, C, D].find((p) => s.includes(p)))).toEqual([B, D]);
    // Carol chose her own creature for the counters.
    expect(picked.offered).toHaveLength(2);
    expect(counters(t.game, carols)).toBe(2);
    expect(hand(t.game, A).length).toBe(aliceHand + 1);
    expect(tokensNamed(t.game, "Treasure Token", D)).toBe(2);
    expect(tokensNamed(t.game, "Treasure Token", A) + tokensNamed(t.game, "Treasure Token", B)).toBe(0);
  });

  it("at three players the third player is the one left, without asking", () => {
    const t = table({ players: 3 });
    spawn(t.game, "Gluntch, the Bestower");
    const offers = choose(t, B, C);
    const carolsHand = hand(t.game, C).length;
    endStep(t);
    expect(offers).toHaveLength(2);
    expect(hand(t.game, C).length).toBe(carolsHand + 1);
    expect(tokensNamed(t.game, "Treasure Token", A)).toBe(2);
  });

  it("at two players the second is the other one and nobody creates Treasure; a first player without creatures may be chosen", () => {
    const t = table({ players: 2 });
    spawn(t.game, "Gluntch, the Bestower");
    const offers = choose(t, B);
    const aliceHand = hand(t.game, A).length;
    endStep(t);
    expect(offers).toHaveLength(1);
    expect(hand(t.game, A).length).toBe(aliceHand + 1);
    expect(tokensNamed(t.game, "Treasure Token", A) + tokensNamed(t.game, "Treasure Token", B)).toBe(0);
  });

  it("you may be the first player and put the counters on Gluntch itself", () => {
    const t = table({ players: 2 });
    const gluntch = spawn(t.game, "Gluntch, the Bestower");
    pickPermanents(t.a, gluntch);
    const offers = choose(t, A);
    const bobsHand = hand(t.game, B).length;
    endStep(t);
    expect(offers).toHaveLength(1);
    expect(counters(t.game, gluntch)).toBe(2);
    expect(hand(t.game, B).length).toBe(bobsHand + 1);
  });
});
