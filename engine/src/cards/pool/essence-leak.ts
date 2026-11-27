import { defineCard } from "../define.js";

// Invasion (INV). EDHREC rank 27072.
//
// A granted upkeep trigger (Pendrell Mists' shape) on the enchanted permanent
// while it's red or green, read as the static applies: "you" is its
// controller, and "its mana cost" is the permanent's own as it resolves
// (rule 107.3h) — one with no mana cost can't be paid for (rule 118.6), so
// it's sacrificed.

const GRANTED = "At the beginning of your upkeep, sacrifice this permanent unless you pay its mana cost.";
const STATIC_TEXT = `As long as enchanted permanent is red or green, it has "${GRANTED}"`;

export default defineCard({
  name: "Essence Leak",
  manaCost: "{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant permanent\n${STATIC_TEXT}`,
  targets: ["permanent"],
  static: [
    {
      affects: { scope: "attached" },
      condition: { kind: "source", filter: { attachedTo: { anyOf: [{ colors: ["R"] }, { colors: ["G"] }] } } },
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
