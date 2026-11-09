/**
 * `each-player-may` with `choices` over every player: the spell's controller
 * is a chooser too, and "that player" in their option is them.
 */
import { describe, expect, it } from "vitest";

import { defineCard } from "../cards/define.js";
import { createDefaultRegistry } from "../cards/registry.js";
import { A, B, cast, lands, life, pickModes, table, toHand } from "./harness.js";

// Not a real card: the shape of a "each player chooses" spell.
const probe = defineCard({
  name: "Test Each Player Chooses",
  manaCost: "{1}",
  colors: [],
  types: ["sorcery"],
  text: "Each player chooses to lose 1 life or lose 2 life.",
  effect: {
    kind: "each-player-may",
    who: "each-player",
    choices: [
      { text: "Lose 1 life.", effect: { kind: "lose-life", who: "that-player", amount: 1 } },
      { text: "Lose 2 life.", effect: { kind: "lose-life", who: "that-player", amount: 2 } },
    ],
  },
});

describe("each-player-may with choices", () => {
  it("the controller's own option reaches them as that player", () => {
    const { game, a, b } = table({ registry: createDefaultRegistry().register(probe) });
    lands(game, "Wastes", 1);
    pickModes(a, 1);
    pickModes(b, 0);
    cast(game, toHand(game, "Test Each Player Chooses"));
    expect(life(game, A)).toBe(18);
    expect(life(game, B)).toBe(19);
  });
});
