import { defineCard } from "../define.js";

// EDHREC rank 26986.
//
// Rulings:
//   [2016-07-13] If Skirsdag Supplicant's ability causes each player's life total to become 0 or
//     less, the game ends in a draw.

export default defineCard({
  name: "Skirsdag Supplicant",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 2,
  toughness: 3,
  text: "{B}, {T}, Discard a card: Each player loses 2 life.",
  activated: [
    {
      cost: { mana: "{B}", tap: true, discard: { count: 1 } },
      targets: [],
      effect: { kind: "lose-life", amount: 2, who: "each-player" },
      resolve: null,
      text: "{B}, {T}, Discard a card: Each player loses 2 life.",
    },
  ],
});
