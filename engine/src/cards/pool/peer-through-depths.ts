import { defineCard } from "../define.js";

// EDHREC rank 15111.
//
// Rulings:
//   If you don't reveal an instant or sorcery card, put all the revealed cards on the bottom of
//     your library in any order.

export default defineCard({
  name: "Peer Through Depths",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  subtypes: ["Arcane"],
  text: "Look at the top five cards of your library. You may reveal an instant or sorcery card from among them and put it into your hand. Put the rest on the bottom of your library in any order.",
  targets: [],
  effect: {
    kind: "look-and-choose",
    zone: "library",
    count: 5,
    reveal: "chosen",
    min: 0,
    max: 1,
    filter: { typesAnyOf: ["instant", "sorcery"] },
    destination: "hand",
    leftover: "bottom-any-order",
  },
});
