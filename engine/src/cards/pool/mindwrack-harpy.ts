import { defineCard } from "../define.js";

// EDHREC rank 7495.

export default defineCard({
  name: "Mindwrack Harpy",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["enchantment", "creature"],
  subtypes: ["Harpy"],
  power: 3,
  toughness: 2,
  keywords: ["flying"],
  text: "Flying\nAt the beginning of combat on your turn, each player mills three cards.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [],
      effect: { kind: "mill", target: "each-player", amount: 3 },
      resolve: null,
      text: "At the beginning of combat on your turn, each player mills three cards.",
    },
  ],
});
