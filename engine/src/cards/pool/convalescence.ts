import { defineCard } from "../define.js";

// Rulings:
//   [2004-10-04] The life total is checked when it triggers and the ability will be put on the
//     stack only if you have 10 life or less. It checks again on resolution and does nothing if
//     you have more life by then.

const TEXT = "At the beginning of your upkeep, if you have 10 or less life, you gain 1 life.";

export default defineCard({
  name: "Convalescence",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      condition: { kind: "life-total", who: "you", atMost: 10 },
      targets: [],
      effect: { kind: "gain-life", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
