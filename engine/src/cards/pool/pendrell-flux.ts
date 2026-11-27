import { defineCard } from "../define.js";

// Urza's Saga (USG). EDHREC rank 27513.
//
// Essence Leak's granted trigger, always on: "you" is the enchanted
// creature's controller, and "its mana cost" the creature's own as the
// trigger resolves (rule 107.3h); a creature with no mana cost (a token
// without one) can't be paid for (rule 118.6), so it's sacrificed.

const GRANTED = "At the beginning of your upkeep, sacrifice this creature unless you pay its mana cost.";
const STATIC_TEXT = `Enchanted creature has "${GRANTED}"`;

export default defineCard({
  name: "Pendrell Flux",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${STATIC_TEXT}`,
  targets: ["creature"],
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
