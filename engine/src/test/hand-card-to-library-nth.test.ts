/**
 * "Target player reveals their hand. You choose a nonland card from it. That
 * player puts that card into their library third from the top" (Lost Hours):
 * `discard-chosen`'s `libraryFromTop`. Written from the Oracle text and
 * rulings.
 */
import { describe, expect, it } from "vitest";

import { A, B, cast, hand, lands, nextTurn, pickFromZone, ref, table, toHand, zone } from "./harness.js";

const library = (game: ReturnType<typeof table>["game"], player = B) => game.state.zones.perPlayer[player].library;

describe("Lost Hours", () => {
  it("puts the nonland card you choose third from the top of that player's library, and it's hidden there", () => {
    const { game, a } = table({ openingHandSize: 0 });
    lands(game, "Swamp", 2);
    const bolt = toHand(game, "Lightning Bolt", B);
    const land = toHand(game, "Mountain", B);
    const { offered } = pickFromZone(a, bolt);
    cast(game, toHand(game, "Lost Hours"), { targets: [ref(B)] });
    expect(offered).not.toContain(land);
    expect(zone(game, bolt)).toBe("library");
    expect(library(game).indexOf(bolt)).toBe(2);
    expect(hand(game, B)).toEqual([land]);
    // Revealed as it was chosen, so known to everyone this turn (rule
    // 701.20a); a hidden library card again once the turn is over.
    nextTurn(game);
    expect(zone(game, bolt)).toBe("library");
    expect(game.viewFor(A).objects[bolt]).toBeUndefined();
  });

  it("with one card or none left in the library, it goes on the bottom (the ruling)", () => {
    const { game, a } = table({ openingHandSize: 0 });
    // Bob's 40-card library drawn down to one card.
    game.debugApplyEffect(B, { kind: "draw", amount: 39 });
    const [last] = library(game);
    lands(game, "Swamp", 2);
    const bolt = toHand(game, "Lightning Bolt", B);
    pickFromZone(a, bolt);
    cast(game, toHand(game, "Lost Hours"), { targets: [ref(B)] });
    expect(library(game)).toEqual([last, bolt]);
  });

  it("you may target yourself, and nothing is chosen from a hand of lands", () => {
    const { game } = table({ openingHandSize: 0 });
    lands(game, "Swamp", 2);
    const forest = toHand(game, "Forest");
    cast(game, toHand(game, "Lost Hours"), { targets: [ref(A)] });
    expect(zone(game, forest)).toBe("hand");
  });
});
