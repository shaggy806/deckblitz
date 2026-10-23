import { defineCard } from "../define.js";

// EDHREC rank 12599.

const DRAW_TEXT = "Discard a card, Sacrifice this creature: Draw a card.";

export default defineCard({
  name: "Insolent Neonate",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Vampire"],
  power: 1,
  toughness: 1,
  keywords: ["menace"],
  text: `Menace (This creature can't be blocked except by two or more creatures.)\n${DRAW_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: false, discard: { count: 1 }, sacrifice: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
