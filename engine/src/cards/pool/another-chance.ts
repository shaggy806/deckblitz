import { defineCard } from "../define.js";

// EDHREC rank 9401.
//
// Rulings:
//   [2023-11-10] The creature cards you return to your hand don't have to be any of the cards you
//     milled. They can be cards that were already in your graveyard before you milled.
//   [2023-11-10] If you don't have at least two cards in your library, you can't choose to mill
//     two cards.
//
// Daggerfang Duo's optional mill — not offered with fewer than two cards in
// the library (rule 701.17b, `mayBeDone`) — then Gix's Command's untargeted
// "return up to two creature cards from your graveyard to your hand".
export default defineCard({
  name: "Another Chance",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "You may mill two cards. Then return up to two creature cards from your graveyard to your hand. (To mill two cards, put the top two cards of your library into your graveyard.)",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "may", prompt: "Mill two cards?", effect: { kind: "mill", target: "you", amount: 2 } },
      {
        kind: "look-and-choose",
        zone: "graveyard",
        min: 0,
        max: 2,
        destination: "hand",
        leftover: "stay",
        filter: { type: "creature" },
      },
    ],
  },
});
