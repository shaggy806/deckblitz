import { defineCard } from "../define.js";

// Urza's Saga (USG). EDHREC rank 16604.

export default defineCard({
  name: "Grafted Skullcap",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: "At the beginning of your draw step, draw an additional card.\nAt the beginning of your end step, discard your hand.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "draw", who: "you" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "At the beginning of your draw step, draw an additional card.",
    },
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: { kind: "discard-hand", who: "you" },
      resolve: null,
      text: "At the beginning of your end step, discard your hand.",
    },
  ],
});
