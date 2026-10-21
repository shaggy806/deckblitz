import { defineCard } from "../define.js";

const TEXT =
  "At the beginning of your upkeep, each player draws a card. If you have the city's blessing, instead only you draw a card.";

export default defineCard({
  name: "Kumena's Awakening",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  keywords: ["ascend"],
  text: `Ascend (If you control ten or more permanents, you get the city's blessing for the rest of the game.)\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      // Not an intervening if: the blessing is checked as it resolves.
      effect: {
        kind: "conditional",
        condition: { kind: "citys-blessing" },
        then: { kind: "draw", amount: 1 },
        else: { kind: "draw", amount: 1, who: "each-player" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
