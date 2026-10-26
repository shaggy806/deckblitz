import { defineCard } from "../define.js";

// Eventide (EVE). EDHREC rank 28925.
//
// Rulings:
//   You can activate the ability whether or not you have any cards in hand; you draw only
//   if your hand is empty as it resolves.

export default defineCard({
  name: "Idle Thoughts",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: "{2}: Draw a card if you have no cards in hand.",
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "hand-size", atMost: 0 },
        then: { kind: "draw", amount: 1 },
      },
      resolve: null,
      text: "{2}: Draw a card if you have no cards in hand.",
    },
  ],
});
