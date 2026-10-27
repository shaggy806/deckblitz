import { defineCard } from "../define.js";

// Torment. EDHREC rank 29536. "Enchant green or white creature" is the target
// filter, which the state-based check reads too (704.5m — Controlled
// Instincts). The granted upkeep is Masticore's, on the creature: its
// controller's upkeep, its controller's discard, the creature sacrificed.

const UPKEEP_TEXT = "At the beginning of your upkeep, sacrifice this creature unless you discard a card.";

export default defineCard({
  name: "Coral Net",
  manaCost: "{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant green or white creature\nEnchanted creature has "${UPKEEP_TEXT}"`,
  targets: [{ kind: "permanent", filter: { type: "creature", anyOf: [{ colors: ["G"] }, { colors: ["W"] }] } }],
  static: [
    {
      affects: { scope: "attached" },
      grantsTriggered: [
        {
          trigger: { on: "step-begins", step: "upkeep", who: "you" },
          targets: [],
          effect: {
            kind: "unless",
            chooser: "you",
            options: [{ discard: 1, text: "Discard a card" }],
            otherwise: { kind: "sacrifice-source" },
          },
          resolve: null,
          text: UPKEEP_TEXT,
        },
      ],
      text: `Enchanted creature has "${UPKEEP_TEXT}"`,
    },
  ],
});
