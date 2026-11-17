/**
 * `hasKeyword: "unearth"` as a target condition: Meticulous Excavation's "if
 * it has unearth, instead exile it, then return that card to its owner's
 * hand" — exiling an unearthed permanent gets past unearth's "exile it
 * instead" (rule 702.84a; the card's ruling), and the card goes on to its
 * owner's hand.
 */

import { describe, expect, it } from "vitest";

import { activate, hand, lands, nextTurn, ref, spawn, table, toGraveyard, zone } from "./harness.js";

describe("Meticulous Excavation", () => {
  it("returns a permanent without unearth to its owner's hand", () => {
    const { game } = table();
    const excavation = spawn(game, "Meticulous Excavation");
    lands(game, "Plains", 3);
    const bears = spawn(game, "Grizzly Bears");
    activate(game, excavation, 0, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("hand");
  });

  it("an unearthed creature is exiled, then goes to its owner's hand", () => {
    const { game } = table();
    const excavation = spawn(game, "Meticulous Excavation");
    lands(game, "Plains", 3);
    lands(game, "Swamp", 1);
    const zombie = toGraveyard(game, "Dregscape Zombie");
    activate(game, zombie, 0);
    expect(zone(game, zombie)).toBe("battlefield");
    activate(game, excavation, 0, { targets: [ref(zombie)] });
    expect(zone(game, zombie)).toBe("hand");
    expect(hand(game)).toContain(zombie);
  });

  it("a creature with unearth that was cast goes to hand by way of exile", () => {
    const { game } = table();
    const excavation = spawn(game, "Meticulous Excavation");
    lands(game, "Plains", 3);
    const zombie = spawn(game, "Dregscape Zombie");
    activate(game, excavation, 0, { targets: [ref(zombie)] });
    expect(zone(game, zombie)).toBe("hand");
  });

  it("only during your turn", () => {
    const { game } = table();
    const excavation = spawn(game, "Meticulous Excavation");
    lands(game, "Plains", 3);
    const bears = spawn(game, "Grizzly Bears");
    nextTurn(game);
    expect(() => activate(game, excavation, 0, { targets: [ref(bears)] })).toThrow();
  });
});
