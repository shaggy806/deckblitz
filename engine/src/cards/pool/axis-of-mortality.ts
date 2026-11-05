import { defineCard } from "../define.js";

// EDHREC rank 11486.

export default defineCard({
  name: "Axis of Mortality",
  manaCost: "{4}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: "At the beginning of your upkeep, you may have two target players exchange life totals.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: ["player", { kind: "other", of: "player", than: { slots: [0] } }],
      effect: {
        kind: "may",
        prompt: "Have those players exchange life totals?",
        effect: { kind: "exchange-life-totals", first: { target: 0 }, second: { target: 1 } },
      },
      resolve: null,
      text: "At the beginning of your upkeep, you may have two target players exchange life totals.",
    },
  ],
});
