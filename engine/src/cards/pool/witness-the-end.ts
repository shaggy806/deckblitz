import { defineCard } from "../define.js";

// EDHREC rank 26587.
//
// Rulings:
//   [2016-01-22] If that player has only one card in hand, that card will be exiled. If the player
//     has no cards in hand, no cards will be exiled, but they will still lose 2 life.

export default defineCard({
  name: "Witness the End",
  manaCost: "{3}{B}",
  colors: [],
  types: ["sorcery"],
  text: "Devoid (This card has no color.)\nTarget opponent exiles two cards from their hand and loses 2 life.",
  targets: ["opponent"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "for-each-player",
        who: { target: 0 },
        effect: {
          kind: "look-and-choose",
          player: "that-player",
          zone: "hand",
          min: 2,
          max: 2,
          destination: "exile",
          unlinked: true,
          leftover: "stay",
        },
      },
      { kind: "lose-life", amount: 2, target: 0 },
    ],
  },
});
