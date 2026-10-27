import { defineCard } from "../define.js";

// Torment. EDHREC rank 13520.

const DISCARD_TEXT = "{1}{U}, Discard a card: Draw a card.";
const SACRIFICE_TEXT = "{1}{U}, Sacrifice this enchantment: Draw a card.";

export default defineCard({
  name: "Compulsion",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: `${DISCARD_TEXT}\n${SACRIFICE_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}{U}", tap: false, discard: { count: 1 } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DISCARD_TEXT,
    },
    {
      cost: { mana: "{1}{U}", tap: false, sacrifice: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: SACRIFICE_TEXT,
    },
  ],
});
