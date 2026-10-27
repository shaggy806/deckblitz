import { defineCard } from "../define.js";

// EDHREC rank 6283. Necrogoyf's trigger, word for word.

const TEXT = "At the beginning of each player's upkeep, that player discards a card.";

export default defineCard({
  name: "Necrogen Mists",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targets: [],
      effect: { kind: "discard", target: "active-player", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
