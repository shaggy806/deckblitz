import { defineCard } from "../define.js";

// Prophecy (PCY). EDHREC rank 28729.

const TEXT = "At the beginning of your end step, if you control no untapped lands, you gain 2 life.";

export default defineCard({
  name: "Well of Life",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "not", of: { kind: "controls", filter: { type: "land", tapped: false }, atLeast: 1 } },
      targets: [],
      effect: { kind: "gain-life", amount: 2 },
      resolve: null,
      text: TEXT,
    },
  ],
});
