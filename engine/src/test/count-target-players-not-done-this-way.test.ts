/**
 * "Any number of target opponents each discard a card. For each of those
 * opponents who didn't discard a card with mana value 4 or greater, draw a
 * card." (Hollow Marauder — need key
 * effect:count-target-players-not-done-this-way): the discards at once
 * (`for-each-target`'s `simultaneous`, its ruling), then each target asked
 * in turn what they discarded this way (`for-each-target` over a `this-way`
 * condition whose `who` is the member, `atMost: 0`) — an empty hand counts
 * as not having discarded one.
 */

import { describe, expect, it } from "vitest";

import { B, C, cast, graveyard, hand, lands, pickTargets, spawn, table, toGraveyard, toHand, zone } from "./harness.js";

describe("Hollow Marauder", () => {
  it("draws a card for each target opponent who didn't discard a card of mana value 4 or greater", () => {
    const { game, a, b, c } = table({ players: 3 });
    lands(game, "Swamp", 7);
    const giant = toHand(game, "Hill Giant", B); // mana value 4
    const bears = toHand(game, "Grizzly Bears", C); // mana value 2
    b.chooseDiscardsFn = () => [giant];
    c.chooseDiscardsFn = () => [bears];
    pickTargets(a, B, C);
    const marauder = toHand(game, "Hollow Marauder");
    const before = hand(game).length - 1;
    cast(game, marauder);
    expect(graveyard(game, B)).toContain(giant);
    expect(graveyard(game, C)).toContain(bears);
    // Only carol's discard was under 4: one card.
    expect(hand(game).length).toBe(before + 1);
  });

  it("counts a target opponent with no cards to discard, and leaves out an opponent not targeted", () => {
    const { game, a, b } = table({ players: 3 });
    lands(game, "Swamp", 7);
    for (const id of [...hand(game, B)]) game.debugMove(id, "exile");
    const giant = toHand(game, "Hill Giant", C);
    b.chooseDiscardsFn = () => [];
    pickTargets(a, B);
    const marauder = toHand(game, "Hollow Marauder");
    const before = hand(game).length - 1;
    cast(game, marauder);
    // Bob discarded nothing: a card. Carol wasn't targeted: she keeps her hand.
    expect(hand(game).length).toBe(before + 1);
    expect(hand(game, C)).toContain(giant);
  });

  it("draws nothing when every target discarded a card of mana value 4 or greater", () => {
    const { game, a, b, c } = table({ players: 3 });
    lands(game, "Swamp", 7);
    const giant = toHand(game, "Hill Giant", B);
    const marauderC = toHand(game, "Hollow Marauder", C); // mana value 7, whatever it costs
    b.chooseDiscardsFn = () => [giant];
    c.chooseDiscardsFn = () => [marauderC];
    pickTargets(a, B, C);
    const marauder = toHand(game, "Hollow Marauder");
    const before = hand(game).length - 1;
    cast(game, marauder);
    expect(hand(game).length).toBe(before);
  });

  it("costs {1} less for each creature card in your graveyard", () => {
    const { game, a } = table({ players: 3 });
    lands(game, "Swamp", 4);
    for (let i = 0; i < 3; i += 1) toGraveyard(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears"); // on the battlefield: not counted
    pickTargets(a);
    const marauder = toHand(game, "Hollow Marauder");
    cast(game, marauder);
    expect(zone(game, marauder)).toBe("battlefield");
  });
});
