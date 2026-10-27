import { defineCard } from "../define.js";

// EDHREC rank 3872. Devoid: no colours.

export default defineCard({
  name: "Smothering Abomination",
  manaCost: "{2}{B}{B}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi"],
  power: 4,
  toughness: 3,
  keywords: ["flying"],
  text: "Devoid (This card has no color.)\nFlying\nAt the beginning of your upkeep, sacrifice a creature.\nWhenever you sacrifice a creature, draw a card.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "sacrifice", who: "you", filter: { type: "creature" }, count: 1 },
      resolve: null,
      text: "At the beginning of your upkeep, sacrifice a creature.",
    },
    {
      trigger: { on: "sacrifice", who: "you", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "Whenever you sacrifice a creature, draw a card.",
    },
  ],
});
