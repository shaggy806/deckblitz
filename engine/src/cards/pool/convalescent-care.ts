import { defineCard } from "../define.js";

// Onslaught. EDHREC rank 29472. Convalescence's intervening-if.

const TEXT = "At the beginning of your upkeep, if you have 5 or less life, you gain 3 life and draw a card.";

export default defineCard({
  name: "Convalescent Care",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      condition: { kind: "life-total", who: "you", atMost: 5 },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-life", amount: 3 },
          { kind: "draw", amount: 1 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
