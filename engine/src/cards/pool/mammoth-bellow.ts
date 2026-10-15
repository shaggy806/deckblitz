import { defineCard } from "../define.js";

// EDHREC rank 23236.
//
// Rulings:
//   [2025-04-04] A spell cast using harmonize will always be exiled afterward, whether it
//     resolves, is countered, or leaves the stack in some other way.
//   [2025-04-04] Tapping a creature won’t reduce colored mana components of harmonize costs.

const HARMONIZE_TEXT =
  "Harmonize {5}{G}{U}{R} (You may cast this card from your graveyard for its harmonize cost. You may tap a creature you control to reduce that cost by {X}, where X is its power. Then exile this spell.)";

export default defineCard({
  name: "Mammoth Bellow",
  manaCost: "{2}{G}{U}{R}",
  colors: ["U", "R", "G"],
  types: ["sorcery"],
  text: `Create a 5/5 green Elephant creature token.\n${HARMONIZE_TEXT}`,
  effect: { kind: "create-token", token: "5/5 Elephant Token", count: 1 },
  harmonize: { cost: "{5}{G}{U}{R}" },
});
