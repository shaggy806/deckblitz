import { defineCard } from "../define.js";

// EDHREC rank 15996.
//
// Rulings:
//   [2020-04-17] If you have fewer than three cards in your library, you put them all into your
//     hand and none into your graveyard.

export default defineCard({
  name: "Dark Bargain",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Look at the top three cards of your library. Put two of them into your hand and the other into your graveyard. Dark Bargain deals 2 damage to you.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "look-and-choose", zone: "library", count: 3, min: 2, max: 2, destination: "hand", leftover: "graveyard" },
      { kind: "damage", amount: 2, who: "you" },
    ],
  },
});
