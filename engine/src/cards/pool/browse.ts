import { defineCard } from "../define.js";

// EDHREC rank 30484. Alliances.
//
// "Put one into your hand, and exile the rest": the four not taken stay on
// top, then the top four are exiled — exactly those four, or, with fewer than
// five cards in the library, every one left.

export default defineCard({
  name: "Browse",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: "{2}{U}{U}: Look at the top five cards of your library, put one of them into your hand, and exile the rest.",
  activated: [
    {
      cost: { mana: "{2}{U}{U}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "look-and-choose", zone: "library", count: 5, min: 1, max: 1, destination: "hand", leftover: "stay" },
          { kind: "exile-from-library", amount: 4 },
        ],
      },
      resolve: null,
      text: "{2}{U}{U}: Look at the top five cards of your library, put one of them into your hand, and exile the rest.",
    },
  ],
});
