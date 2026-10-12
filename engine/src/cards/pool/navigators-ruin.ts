import { defineCard } from "../define.js";

export default defineCard({
  name: "Navigator's Ruin",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: "Raid — At the beginning of your end step, if you attacked this turn, target opponent mills four cards.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: ["opponent"],
      effect: { kind: "mill", target: 0, amount: 4 },
      resolve: null,
      text: "Raid — At the beginning of your end step, if you attacked this turn, target opponent mills four cards.",
      condition: { kind: "turn-stat", stat: "attacked", who: "you", atLeast: 1 },
    },
  ],
});
