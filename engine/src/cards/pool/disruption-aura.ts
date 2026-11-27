import { defineCard } from "../define.js";

// Fifth Dawn (5DN). EDHREC rank 30847.
//
// Pendrell Flux's granted trigger on an artifact: "its mana cost" is the
// artifact's own, coloured symbols included, X as 0 (rule 107.3h and the
// rulings); one with no mana cost can't be paid for (rule 118.6).
//
// Rulings:
//   [2004-12-01] Mana cost includes any requirements for colored mana.
//   [2004-12-01] If the enchanted artifact has X in its mana cost, X is 0.

const GRANTED = "At the beginning of your upkeep, sacrifice this artifact unless you pay its mana cost.";
const STATIC_TEXT = `Enchanted artifact has "${GRANTED}"`;

export default defineCard({
  name: "Disruption Aura",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant artifact\n${STATIC_TEXT}`,
  targets: ["artifact"],
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
            options: [{ payManaCostOf: "source", text: "Pay {X}" }],
            otherwise: { kind: "sacrifice-source" },
          },
          resolve: null,
          text: GRANTED,
        },
      ],
      text: STATIC_TEXT,
    },
  ],
});
