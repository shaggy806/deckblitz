import { defineCard } from "../define.js";

// EDHREC rank 17462.

export default defineCard({
  name: "Vrock",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Bird", "Demon"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: "Flying\nToxic Spores — At the beginning of your end step, if a permanent you controlled left the battlefield this turn, each opponent loses 3 life.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: { kind: "lose-life", amount: 3, who: "each-opponent" },
      resolve: null,
      text: "Toxic Spores — At the beginning of your end step, if a permanent you controlled left the battlefield this turn, each opponent loses 3 life.",
      condition: { kind: "turn-history", what: "left" },
    },
  ],
});
