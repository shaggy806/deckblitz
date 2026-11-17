/**
 * "Each creature that entered the battlefield under your control this turn"
 * (Shaile, Dean of Radiance): `journaled: { what: "entered", by: "you" }` —
 * the journal's `entered` entries in your own record, each its controller as
 * it entered, for the object in the stint it's in now (rule 400.7). Whoever
 * controls it now (the ruling), so no `controlledBy`. And the back face,
 * Embrose, Dean of Shadow.
 */
import { describe, expect, it } from "vitest";

import { A, B, activate, cast, counters, enter, hand, lands, ref, spawn, table, toHand, toStep, zone } from "./harness.js";

describe("Shaile, Dean of Radiance: a counter on each creature that entered under your control this turn", () => {
  it("this turn's arrivals under alice, whoever controls them now — not last turn's, nor bob's", () => {
    const { game } = table();
    const shaile = spawn(game, "Shaile, Dean of Radiance");
    const lastTurn = enter(game, "Grizzly Bears");
    toStep(game, "precombat-main"); // alice's next turn
    const fresh = enter(game, "Grizzly Bears");
    const given = enter(game, "Grizzly Bears");
    const theirs = enter(game, "Grizzly Bears", B);
    const taken = enter(game, "Grizzly Bears", B);
    // Bob takes one that entered under alice's control; alice takes one of bob's.
    game.debugApplyEffect(B, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [ref(given)]);
    game.debugApplyEffect(A, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [ref(taken)]);
    expect(game.state.objects[given].controller).toBe(B);
    expect(game.state.objects[taken].controller).toBe(A);

    activate(game, shaile, 0);
    expect(counters(game, fresh)).toBe(1);
    expect(counters(game, given)).toBe(1); // the ruling: it still gets one
    expect(counters(game, theirs)).toBe(0);
    expect(counters(game, taken)).toBe(0); // it entered under bob's control
    expect(counters(game, lastTurn)).toBe(0);
    expect(counters(game, shaile)).toBe(0);
  });
});

describe("Embrose, Dean of Shadow", () => {
  it("a counter, then 2 damage, on another target creature; one of yours dying with a counter draws a card", () => {
    const { game } = table();
    const embrose = toHand(game, "Shaile, Dean of Radiance");
    lands(game, "Swamp", 4);
    cast(game, embrose, { face: 1 }); // the back face, Embrose
    const elves = spawn(game, "Llanowar Elves"); // 1/1: 2/2 with the counter, then dead to the 2
    const bears = spawn(game, "Grizzly Bears", B); // 2/2: 3/3, survives
    toStep(game, "precombat-main"); // alice's next turn: Embrose can tap
    const cards = hand(game).length;

    activate(game, embrose, 0, { targets: [ref(bears)] });
    expect(counters(game, bears)).toBe(1);
    expect(zone(game, bears)).toBe("battlefield");
    expect(hand(game).length).toBe(cards);

    toStep(game, "precombat-main"); // untapped, alice's next turn (her draw step drew one)
    const before = hand(game).length;
    activate(game, embrose, 0, { targets: [ref(elves)] });
    expect(zone(game, elves)).toBe("graveyard");
    expect(hand(game).length).toBe(before + 1);
  });
});
