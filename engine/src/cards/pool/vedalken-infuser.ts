import { defineCard } from "../define.js";

// EDHREC rank 22826.

export default defineCard({
  name: "Vedalken Infuser",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Vedalken", "Wizard"],
  power: 1,
  toughness: 4,
  text: "At the beginning of your upkeep, you may put a charge counter on target artifact.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: ["artifact"],
      effect: {
        kind: "may",
        prompt: "Put a charge counter on target artifact?",
        effect: { kind: "add-counter", target: 0, counter: "charge", amount: 1 },
      },
      resolve: null,
      text: "At the beginning of your upkeep, you may put a charge counter on target artifact.",
    },
  ],
});
