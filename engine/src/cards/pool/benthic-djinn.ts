import { defineCard } from "../define.js";

export default defineCard({
  name: "Benthic Djinn",
  manaCost: "{2}{U}{B}",
  colors: ["U", "B"],
  types: ["creature"],
  subtypes: ["Djinn"],
  power: 5,
  toughness: 3,
  keywords: ["islandwalk"],
  text: "Islandwalk (This creature can't be blocked as long as defending player controls an Island.)\nAt the beginning of your upkeep, you lose 2 life.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "lose-life", amount: 2 },
      resolve: null,
      text: "At the beginning of your upkeep, you lose 2 life.",
    },
  ],
});
