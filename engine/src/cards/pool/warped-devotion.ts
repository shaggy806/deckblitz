import { defineCard } from "../define.js";

// Ruling: This card can trigger on itself being returned to a player's hand.

const TEXT = "Whenever a permanent is returned to a player's hand, that player discards a card.";

export default defineCard({
  name: "Warped Devotion",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "leaves-battlefield", who: "any", to: ["hand"] },
      targets: [],
      resolve: null,
      effect: { kind: "discard", target: "trigger-owner", amount: 1 },
      text: TEXT,
    },
  ],
});
