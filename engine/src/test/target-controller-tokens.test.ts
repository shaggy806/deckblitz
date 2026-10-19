/**
 * Two amounts read from the wrong side, found while authoring Warhammer 40,000 Commander
 * (2026-10-19):
 * - `create-token`'s `who: "target-controller"` — "target player creates …" — gave the tokens to
 *   the caster when that target had gone illegal; an illegal target names nobody (rule 608.2b),
 *   so nothing is created (Ashling's Command's Treasure mode).
 * - `opponentsControllingFewer` counted every matching permanent for every player unless the
 *   filter said `controlledBy: "you"`, so Voice of Many never drew.
 */
import { describe, expect, it } from "vitest";

import { A, B, C, cast, enter, hand, lands, ref, settle, spawn, table, toHand, toLibrary, tokensNamed } from "./harness.js";

describe("target player creates — an illegal target", () => {
  it("creates nothing, for nobody (Ashling's Command)", () => {
    const { game } = table({ players: 3 });
    lands(game, "Volcanic Island", 5);
    const bobs = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Ashling's Command"), { modes: [2, 3], targets: [ref(B), ref(C)], settle: false });
    // Carol gains hexproof with the spell on the stack: its Treasure target is illegal.
    spawn(game, "Shalai, Voice of Plenty", C);
    settle(game);
    expect(game.state.objects[bobs]?.zone).toBe("graveyard");
    expect(tokensNamed(game, "Treasure Token", C)).toBe(0);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(0);
  });
});

describe("opponents controlling fewer", () => {
  it("compares what each player controls (Voice of Many)", () => {
    const { game } = table({ players: 3 });
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears", B);
    spawn(game, "Grizzly Bears", C);
    spawn(game, "Grizzly Bears", C);
    toLibrary(game, "Island");
    toLibrary(game, "Island");
    const before = hand(game, A).length;
    // With Voice of Many alice has three creatures: Bob (one) has fewer, and Carol (two) too.
    enter(game, "Voice of Many");
    expect(hand(game, A).length).toBe(before + 2);
  });
});
