import { defineCard } from "../define.js";

// Dominaria United (DMU). EDHREC rank 15211.
const TEXT = "{R}, {T}, Discard a card: Draw a card.";

export default defineCard({
  name: "Goblin Picker",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin"],
  power: 2,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{R}", tap: true, discard: { count: 1 } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
