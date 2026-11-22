/**
 * B338 (author-top-cards overnight), decisions lane: Leshrac's Sigil — a paid
 * look at the hand of the opponent who cast a green spell ("that player", not
 * a target), with no engine code of its own.
 */
import { describe, expect, it } from "vitest";

import { B, activate, cast, graveyard, hand, lands, pickFromZone, pickModes, spawn, table, toHand, toStep, zone } from "./harness.js";

describe("Leshrac's Sigil", () => {
  it("makes the opponent who cast a green spell discard the card its controller chose, when paid", () => {
    const { game, a } = table();
    spawn(game, "Leshrac's Sigil");
    lands(game, "Swamp", 2);
    lands(game, "Forest", 2, B);
    toStep(game, "precombat-main", B);
    const kept = toHand(game, "Grizzly Bears", B);
    const taken = toHand(game, "Llanowar Elves", B);
    pickModes(a, 0);
    const seen = pickFromZone(a, taken);
    cast(game, toHand(game, "Grizzly Bears", B), { player: B });
    expect(seen.offered).toContain(kept);
    expect(graveyard(game, B)).toContain(taken);
    expect(zone(game, kept)).toBe("hand");
  });

  it("does nothing when its controller declines to pay", () => {
    const { game, a } = table();
    spawn(game, "Leshrac's Sigil");
    lands(game, "Swamp", 2);
    lands(game, "Forest", 2, B);
    toStep(game, "precombat-main", B);
    toHand(game, "Llanowar Elves", B);
    pickModes(a);
    const before = hand(game, B).length;
    cast(game, toHand(game, "Grizzly Bears", B), { player: B });
    expect(hand(game, B)).toHaveLength(before);
  });

  it("doesn't trigger on a spell that isn't green", () => {
    const { game, a } = table();
    spawn(game, "Leshrac's Sigil");
    lands(game, "Swamp", 2);
    lands(game, "Swamp", 2, B);
    toStep(game, "precombat-main", B);
    const kept = toHand(game, "Llanowar Elves", B);
    pickModes(a, 0);
    pickFromZone(a, kept);
    cast(game, toHand(game, "Drudge Skeletons", B), { player: B });
    expect(zone(game, kept)).toBe("hand");
  });

  it("returns to its owner's hand for {B}{B}", () => {
    const { game } = table();
    const sigil = spawn(game, "Leshrac's Sigil");
    lands(game, "Swamp", 2);
    activate(game, sigil, 0);
    expect(zone(game, sigil)).toBe("hand");
  });
});
