import { defineCard } from "../define.js";

// EDHREC rank 14445. Streets of New Capenna.
//
// Rulings:
//   [2022-04-29] If there's only one card in your library as A Little Chat resolves, you'll put it
//     into your hand.
//   [2022-04-29] If you pay the casualty cost of a spell, the copy will resolve before the original
//     spell.
//
// Sleight of Hand's look, with casualty 1 (the copy resolves first).
export default defineCard({
  name: "A Little Chat",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  casualty: 1,
  text:
    "Casualty 1 (As you cast this spell, you may sacrifice a creature with power 1 or greater. When you do, copy this spell.)\n" +
    "Look at the top two cards of your library. Put one of them into your hand and the other on the bottom of your library.",
  effect: {
    kind: "look-and-choose",
    zone: "library",
    count: 2,
    min: 1,
    max: 1,
    destination: "hand",
    leftover: "bottom-any-order",
  },
});
