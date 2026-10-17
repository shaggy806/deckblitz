import { defineCard } from "../define.js";
import { vanishing } from "../helpers.js";

export default defineCard({
  name: "Four Knocks",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: "Vanishing 4 (This enchantment enters with four time counters on it. At the beginning of your upkeep, remove a time counter from it. When the last is removed, sacrifice it.)\nAt the beginning of your first main phase, draw a card.",
  static: [...vanishing(4).static],
  triggered: [
    ...vanishing(4).triggered,
    {
      trigger: { on: "step-begins", step: "precombat-main", who: "you" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "At the beginning of your first main phase, draw a card.",
    },
  ],
});
