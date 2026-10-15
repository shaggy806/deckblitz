import { defineCard } from "../define.js";

// EDHREC rank 12515.
//
// Rulings:
//   [2025-04-04] If a copy of a spell is returned to its owner’s hand, it’s moved there, then it
//     will cease to exist as a state-based action. It can’t be recast.
//   [2025-04-04] If a spell is returned to its owner’s hand, it’s removed from the stack and thus
//     will not resolve. The spell isn’t countered; it just no longer exists. This works even
//     against a spell that can’t be countered.
//
// Venser, Shaper Savant's "return target spell or permanent" (each half finds
// only what slot 0 is), then the rest in printed order.

export default defineCard({
  name: "Jeskai Revelation",
  manaCost: "{4}{U}{R}{W}",
  colors: ["W", "U", "R"],
  types: ["instant"],
  text: "Return target spell or permanent to its owner's hand. Jeskai Revelation deals 4 damage to any target. Create two 1/1 white Monk creature tokens with prowess. Draw two cards. You gain 4 life.",
  targets: [{ kind: "spell-or-permanent" }, "any-target"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "return-to-hand", target: 0, from: "stack" },
      { kind: "return-to-hand", target: 0 },
      { kind: "damage", amount: 4, target: 1 },
      { kind: "create-token", token: "Monk Token", count: 2 },
      { kind: "draw", amount: 2 },
      { kind: "gain-life", amount: 4 },
    ],
  },
});
