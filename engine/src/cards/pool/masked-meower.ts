import { defineCard } from "../define.js";

const DRAW_TEXT = "Discard a card, Sacrifice this creature: Draw a card.";

export default defineCard({
  name: "Masked Meower",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Spider", "Cat", "Hero"],
  power: 1,
  toughness: 1,
  keywords: ["haste"],
  text: `Haste\n${DRAW_TEXT}`,
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
