/**
 * `discard-chosen`'s `destination`: the card the effect's controller
 * chooses from another player's revealed (or looked-at) hand goes somewhere
 * other than the graveyard — exiled (Thought-Knot Seer), exiled and linked to
 * the permanent for "return the exiled card" (Tidehollow Sculler, rule
 * 607.2a), put on top of the library (Painful Memories) — and the hand can be
 * the one an event names ("that player", Ghastlord of Fugue). None of it is
 * a discard (rule 701.9a), so nothing that looks for one sees it.
 */

import { describe, expect, it } from "vitest";

import { A, B, attack, cast, enter, graveyard, lands, pickFromZone, pickTargets, ref, spawn, table, toHand, zone } from "./harness.js";

describe("a card chosen from another player's hand, not discarded", () => {
  it("Thought-Knot Seer exiles the nonland card its controller picks", () => {
    const { game, a } = table();
    const bolt = toHand(game, "Lightning Bolt", B);
    const land = toHand(game, "Mountain", B);
    pickTargets(a, B);
    const seen = pickFromZone(a, bolt);
    const before = graveyard(game, B).length;
    enter(game, "Thought-Knot Seer", A);
    expect(seen.offered).toContain(bolt);
    expect(seen.offered).not.toContain(land);
    expect(zone(game, bolt)).toBe("exile");
    expect(graveyard(game, B).length).toBe(before);
  });

  it("Tidehollow Sculler returns the card it exiled when it leaves", () => {
    const { game, a } = table();
    const bolt = toHand(game, "Lightning Bolt", B);
    pickTargets(a, B);
    pickFromZone(a, bolt);
    const sculler = enter(game, "Tidehollow Sculler", A);
    expect(zone(game, bolt)).toBe("exile");
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Shock"), { targets: [ref(sculler)] });
    expect(zone(game, sculler)).toBe("graveyard");
    expect(zone(game, bolt)).toBe("hand");
  });

  it("Painful Memories puts the chosen card on top of that player's library", () => {
    const { game, a } = table();
    const bolt = toHand(game, "Lightning Bolt", B);
    pickFromZone(a, bolt);
    lands(game, "Swamp", 2);
    cast(game, toHand(game, "Painful Memories"), { targets: [ref(B)] });
    // A library is drawn from index 0, its top.
    expect(game.state.zones.perPlayer[B].library[0]).toBe(bolt);
  });

  it("Ghastlord of Fugue: the player it hit loses the card its controller picks", () => {
    const { game, a } = table();
    const ghastlord = spawn(game, "Ghastlord of Fugue", A);
    const bolt = toHand(game, "Lightning Bolt", B);
    pickFromZone(a, bolt);
    attack(game, a, [ghastlord]);
    expect(zone(game, bolt)).toBe("exile");
  });
});
