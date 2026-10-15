import { defineCard } from "../define.js";

// EDHREC rank 18415.

export default defineCard({
  name: "Charging Strifeknight",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Spirit", "Knight"],
  power: 3,
  toughness: 3,
  keywords: ["haste"],
  text: "Haste\n{T}, Discard a card: Draw a card.",
  activated: [
    {
      cost: { mana: null, tap: true, discard: { count: 1 } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "{T}, Discard a card: Draw a card.",
    },
  ],
});
