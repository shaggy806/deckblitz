/**
 * A `look-and-choose` inside a `for-each-player`: its `then` is applied once
 * the choice is answered, a separate resolution context, and "that player"
 * is still the player the loop is about.
 */
import { describe, expect, it } from "vitest";

import { defineCard } from "../cards/define.js";
import { createDefaultRegistry } from "../cards/registry.js";
import { A, B, C, cast, lands, life, table, toHand } from "./harness.js";

// Not a real card: the shape, with a `then` that says "that player".
const probe = defineCard({
  name: "Test Each Opponent Reveals",
  manaCost: "{1}",
  colors: [],
  types: ["sorcery"],
  text: "Each opponent reveals the top card of their library and puts it into their hand. That player loses 1 life.",
  effect: {
    kind: "for-each-player",
    who: "each-opponent",
    effect: {
      kind: "look-and-choose",
      player: "that-player",
      zone: "library",
      count: 1,
      reveal: true,
      min: 1,
      max: 1,
      destination: "hand",
      leftover: "stay",
      then: { kind: "lose-life", who: "that-player", amount: 1 },
    },
  },
});

describe("a look-and-choose's then in a for-each-player", () => {
  it('names the player of the loop as "that player"', () => {
    const { game } = table({ players: 3, registry: createDefaultRegistry().register(probe) });
    lands(game, "Wastes", 1);
    cast(game, toHand(game, "Test Each Opponent Reveals"));
    expect(life(game, A)).toBe(20);
    expect(life(game, B)).toBe(19);
    expect(life(game, C)).toBe(19);
  });
});
