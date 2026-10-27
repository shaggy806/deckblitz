import { defineCard } from "../define.js";

// EDHREC rank 17619.

export default defineCard({
  name: "Clearwater Goblet",
  manaCost: "{5}",
  colors: [],
  types: ["artifact"],
  text: "Sunburst (This artifact enters with a charge counter on it for each color of mana spent to cast it.)\nAt the beginning of your upkeep, you may gain life equal to the number of charge counters on this artifact.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "may", prompt: "Gain life equal to the number of charge counters on Clearwater Goblet?", effect: { kind: "gain-life", amount: { countersOn: "source", counter: "charge" } } },
      resolve: null,
      text: "At the beginning of your upkeep, you may gain life equal to the number of charge counters on this artifact.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", sunburst: true },
      text: "Sunburst (This artifact enters with a charge counter on it for each color of mana spent to cast it.)",
    },
  ],
});
