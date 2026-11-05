import { defineCard } from "../define.js";

const TEXT =
  "At the beginning of your end step, draw a card if your life total is greater than your starting life total. Otherwise, you gain 2 life.";

export default defineCard({
  name: "Cosmos Elixir",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "life-total", atLeast: { startingPlus: 1 } },
        then: { kind: "draw", amount: 1 },
        else: { kind: "gain-life", amount: 2 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
