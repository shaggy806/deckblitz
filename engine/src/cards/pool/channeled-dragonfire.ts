import { defineCard } from "../define.js";

// EDHREC rank 16037.
//
// Rulings:
//   [2025-04-04] A spell cast using harmonize will always be exiled afterward, whether it
//     resolves, is countered, or leaves the stack in some other way.
//   [2025-04-04] Tapping a creature won't reduce colored mana components of harmonize costs.

const HARMONIZE_TEXT =
  "Harmonize {5}{R}{R} (You may cast this card from your graveyard for its harmonize cost. You may tap a creature you control to reduce that cost by {X}, where X is its power. Then exile this spell.)";

export default defineCard({
  name: "Channeled Dragonfire",
  manaCost: "{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: `Channeled Dragonfire deals 2 damage to any target.\n${HARMONIZE_TEXT}`,
  targets: ["any-target"],
  effect: { kind: "damage", amount: 2, target: 0 },
  harmonize: { cost: "{5}{R}{R}" },
});
