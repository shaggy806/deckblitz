import { defineCard } from "../define.js";

// Checked as it resolves, one card however many are tied (the rulings).
const TEXT =
  "At the beginning of your upkeep, draw a card if you control the creature with the greatest toughness or tied for the greatest toughness.";

export default defineCard({
  name: "Abzan Beastmaster",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Dog", "Shaman"],
  power: 2,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "controls-greatest", of: "toughness", filter: { type: "creature" } },
        then: { kind: "draw", amount: 1 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
