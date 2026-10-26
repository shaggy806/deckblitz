import { defineCard } from "../define.js";

// EDHREC rank 17921.

export default defineCard({
  name: "Peace of Mind",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: "{W}, Discard a card: You gain 3 life.",
  activated: [
    {
      cost: { mana: "{W}", tap: false, discard: { count: 1 } },
      targets: [],
      effect: { kind: "gain-life", amount: 3 },
      resolve: null,
      text: "{W}, Discard a card: You gain 3 life.",
    },
  ],
});
