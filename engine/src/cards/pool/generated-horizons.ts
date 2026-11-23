import { defineCard } from "../define.js";

// Playtest card (Mystery Booster 2).

export default defineCard({
  name: "Generated Horizons",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: "At the beginning of your upkeep, create a Forest land token.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "create-token", token: "Forest Token", count: 1 },
      resolve: null,
      text: "At the beginning of your upkeep, create a Forest land token.",
    },
  ],
});
