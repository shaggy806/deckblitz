import { defineCard } from "../define.js";

// Mercadian Masques (MMQ). EDHREC rank 8304.

const RETURN_TEXT = "{1}: Return target land you control to its owner's hand.";
const DRAW_TEXT = "{1}, Discard a land card: Draw a card.";

export default defineCard({
  name: "Trade Routes",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: `${RETURN_TEXT}\n${DRAW_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: ["land-you-control"],
      effect: { kind: "return-to-hand", target: 0 },
      resolve: null,
      text: RETURN_TEXT,
    },
    {
      cost: { mana: "{1}", tap: false, discard: { count: 1, filter: { type: "land" } } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
