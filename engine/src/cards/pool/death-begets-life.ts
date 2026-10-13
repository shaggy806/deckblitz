import { defineCard } from "../define.js";

// EDHREC rank 7748.
//
// Rulings:
//   [2025-04-04] If a permanent destroyed this way goes to a zone other than a graveyard (for
//     example, if it has a finality counter on it), it still counts as being destroyed and you'll
//     still draw a card.
//   [2025-04-04] Permanents with indestructible aren't destroyed this way.

export default defineCard({
  name: "Death Begets Life",
  manaCost: "{5}{B}{G}{U}",
  colors: ["U", "B", "G"],
  types: ["sorcery"],
  text: "Destroy all creatures and enchantments. Draw a card for each permanent destroyed this way.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy-all", filter: { typesAnyOf: ["creature", "enchantment"] } },
      { kind: "draw", amount: { thisWay: "destroyed" } },
    ],
  },
});
