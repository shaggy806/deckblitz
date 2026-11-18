import { describe, expect, it } from "vitest";

import { A, B, C, cast, hand, keywords, lands, life, pt, ref, spawn, subtypes, table, toHand, toLibrary, zone } from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

// Each player reveals the top card of their library (`reveal-top`'s `who`,
// rule 701.20a), then a token copy of each creature card revealed —
// `create-token-copy`'s `ofMatching` over a set of cards (`of: { thisWay:
// "revealed" }`): Haunting Imitation.

const tokensOf = (game: Game, player = A): readonly ObjectId[] =>
  game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].isToken === true && game.state.objects[id].controller === player);

describe("Haunting Imitation", () => {
  it("copies each creature card revealed as a 1/1 flying Spirit for its caster, leaving the cards on top", () => {
    const { game } = table({ players: 3 });
    lands(game, "Island", 3);
    const giant = toLibrary(game, "Hill Giant", A);
    const bears = toLibrary(game, "Grizzly Bears", B);
    // A noncreature permanent card isn't copied.
    const ring = toLibrary(game, "Sol Ring", C);
    const spell = toHand(game, "Haunting Imitation");
    cast(game, spell);
    const tokens = tokensOf(game);
    expect(tokens).toHaveLength(2);
    for (const token of tokens) {
      expect(pt(game, token)).toEqual({ power: 1, toughness: 1 });
      expect(subtypes(game, token)).toContain("Spirit");
      expect(keywords(game, token).has("flying")).toBe(true);
    }
    expect(tokens.map((t) => game.state.objects[t].cardName).sort()).toEqual(["Grizzly Bears", "Hill Giant"]);
    expect(tokensOf(game, B)).toHaveLength(0);
    // The revealed cards stay on top (the ruling); the spell is spent.
    expect(game.state.zones.perPlayer[A].library[0]).toBe(giant);
    expect(game.state.zones.perPlayer[B].library[0]).toBe(bears);
    expect(game.state.zones.perPlayer[C].library[0]).toBe(ring);
    expect(zone(game, spell)).toBe("graveyard");
  });

  it("returns to its owner's hand when no creature card is revealed", () => {
    const { game } = table();
    lands(game, "Island", 3);
    toLibrary(game, "Lightning Bolt", A);
    toLibrary(game, "Lightning Bolt", B);
    const spell = toHand(game, "Haunting Imitation");
    cast(game, spell);
    expect(tokensOf(game)).toHaveLength(0);
    expect(hand(game)).toContain(spell);
  });
});

// "Target opponent reveals the top card of their library" (`reveal-top`'s
// `of`), read back through `{ thisWay: "revealed" }`: Cerebral Eruption.
describe("Cerebral Eruption", () => {
  it("deals the revealed card's mana value to that player and each creature they control", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    const giant = toLibrary(game, "Hill Giant", B);
    const spell = toHand(game, "Cerebral Eruption");
    cast(game, spell, { targets: [ref(B)] });
    expect(life(game, B)).toBe(16);
    expect(life(game, A)).toBe(20);
    expect(zone(game, theirs)).toBe("graveyard");
    expect(zone(game, mine)).toBe("battlefield");
    expect(game.state.zones.perPlayer[B].library[0]).toBe(giant);
    expect(zone(game, spell)).toBe("graveyard");
  });

  it("returns to its owner's hand when a land card is revealed", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    const theirs = spawn(game, "Grizzly Bears", B);
    // Bob's library is all Wastes: a land, mana value 0.
    const spell = toHand(game, "Cerebral Eruption");
    cast(game, spell, { targets: [ref(B)] });
    expect(life(game, B)).toBe(20);
    expect(zone(game, theirs)).toBe("battlefield");
    expect(hand(game)).toContain(spell);
  });
});
