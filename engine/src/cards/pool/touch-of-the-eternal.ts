import { defineCard } from "../define.js";

// Rulings:
//   [2012-07-01] This change of life total counts as life gain or life loss, as appropriate.

const TEXT =
  "At the beginning of your upkeep, count the number of permanents you control. Your life total becomes that number.";

export default defineCard({
  name: "Touch of the Eternal",
  manaCost: "{5}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "set-life-total", who: "you", amount: { countOf: { controlledBy: "you" } } },
      resolve: null,
      text: TEXT,
    },
  ],
});
