import { defineCard } from "../define.js";

// EDHREC rank 24213. Modern Horizons 2.
const TEXT = "{T}, Discard a card: This artifact deals 2 damage to target player or planeswalker.";

export default defineCard({
  name: "Fodder Tosser",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true, discard: { count: 1 } },
      targets: ["player-or-planeswalker"],
      effect: { kind: "damage", amount: 2, target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
