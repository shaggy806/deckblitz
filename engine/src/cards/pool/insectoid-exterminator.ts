import { defineCard } from "../define.js";

// EDHREC rank 22609.

export default defineCard({
  name: "Insectoid Exterminator",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Insect", "Mutant"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: "Flying\nDisappear — At the beginning of your end step, if a permanent left the battlefield under your control this turn, scry 1. (Look at the top card of your library. You may put that card on the bottom.)",
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: { kind: "scry", amount: 1 },
      resolve: null,
      text: "Disappear — At the beginning of your end step, if a permanent left the battlefield under your control this turn, scry 1.",
      condition: { kind: "turn-history", what: "left" },
    },
  ],
});
