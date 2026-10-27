import { defineCard } from "../define.js";

// EDHREC rank 27392.

export default defineCard({
  name: "Razormane Masticore",
  manaCost: "{5}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Masticore"],
  power: 5,
  toughness: 5,
  keywords: ["first-strike"],
  text: "First strike (This creature deals combat damage before creatures without first strike.)\nAt the beginning of your upkeep, sacrifice this creature unless you discard a card.\nAt the beginning of your draw step, you may have this creature deal 3 damage to target creature.",
  triggered: [
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
      text: "At the beginning of your upkeep, sacrifice this creature unless you discard a card.",
    },
    {
      trigger: { on: "step-begins", step: "draw", who: "you" },
      targets: ["creature"],
      effect: {
        kind: "may",
        prompt: "Have Razormane Masticore deal 3 damage to target creature?",
        effect: { kind: "damage", target: 0, amount: 3 },
      },
      resolve: null,
      text: "At the beginning of your draw step, you may have this creature deal 3 damage to target creature.",
    },
  ],
});
