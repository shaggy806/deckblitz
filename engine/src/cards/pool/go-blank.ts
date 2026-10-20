import { defineCard } from "../define.js";

// EDHREC rank 14987.
//
// Rulings:
//   [2021-04-16] If the target player has one card in hand as Go Blank resolves, they'll discard
//     it and the cards in their graveyard will be exiled. If their hand is empty, you'll just exile
//     the cards in their graveyard.
//
// The discarded cards are in the graveyard by the time it's exiled, so they go too.
export default defineCard({
  name: "Go Blank",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Target player discards two cards. Then exile that player's graveyard.",
  targets: ["player"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "discard", target: 0, amount: 2 },
      { kind: "exile-graveyard", target: 0 },
    ],
  },
});
