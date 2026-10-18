import { defineCard } from "../define.js";

// EDHREC rank 12969.
//
// Rulings:
//   [2023-04-14] If there are fewer than three cards in your library, look at all of the cards in
//     your library and follow the instructions in order. For example, if you had only two cards in
//     your library, you would look at both, put one into your hand, and then put the other one in
//     the graveyard.
//
// The hand pick first, then the graveyard pick, and the one card left (if
// any) goes to the bottom — so with two cards the second always goes to the
// graveyard, as the ruling orders.

export default defineCard({
  name: "Moment of Truth",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Look at the top three cards of your library. Put one of those cards into your hand, one into your graveyard, and one on the bottom of your library.",
  targets: [],
  effect: {
    kind: "look-and-choose",
    zone: "library",
    count: 3,
    min: 1,
    max: 1,
    destination: "hand",
    secondPick: { min: 1, max: 1, destination: "graveyard" },
    leftover: "bottom-random",
  },
});
