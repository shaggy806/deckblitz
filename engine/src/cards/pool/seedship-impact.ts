import { defineCard } from "../define.js";

// EDHREC rank 9860.
//
// Rulings:
//   [2025-07-25] If a permanent has {X} in its mana cost, X is 0 for the purpose of determining
//     its mana value.

export default defineCard({
  name: "Seedship Impact",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Destroy target artifact or enchantment. If its mana value was 2 or less, create a Lander token. (It's an artifact with \"{2}, {T}, Sacrifice this token: Search your library for a basic land card, put it onto the battlefield tapped, then shuffle.\")",
  targets: ["artifact-or-enchantment"],
  // Tainted Treats' shape: "if its mana value was" doesn't ask whether it was
  // destroyed (an indestructible one still makes the Lander), and the
  // `target` condition reads it as it last existed on the battlefield.
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      {
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { manaValue: { op: "lte", n: 2 } } },
        then: { kind: "create-token", token: "Lander Token", count: 1 },
      },
    ],
  },
});
