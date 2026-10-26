import { defineCard } from "../define.js";

const TEXT = "At the beginning of your upkeep, each opponent loses 1 life. You gain life equal to the life lost this way.";

export default defineCard({
  name: "Subversion",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: 1, who: "each-opponent" },
          { kind: "gain-life", amount: { lifeLostThisWay: true, who: "each-opponent" } },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
