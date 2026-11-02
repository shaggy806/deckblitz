import { defineCard } from "../define.js";

const TEXT =
  "At the beginning of each end step, each opponent loses life equal to the life they lost this turn. (Damage causes loss of life.)";

export default defineCard({
  name: "Wound Reflection",
  manaCost: "{5}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      targets: [],
      effect: { kind: "lose-life", who: "each-opponent", amount: { turnStat: "life-lost", who: "each" } },
      resolve: null,
      text: TEXT,
    },
  ],
});
