import { defineCard } from "../define.js";

// EDHREC rank 14413. "That many" is the cards put on their library this way;
// the search names no quality, so that many are found while the library has
// them (rule 701.23d), and they go to the hand of their owner, that player.
export default defineCard({
  name: "Head Games",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Target opponent puts the cards from their hand on top of their library. Search that player's library for that many cards. The player puts those cards into their hand, then shuffles.",
  targets: ["opponent"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "for-each-player",
        who: { target: 0 },
        effect: {
          kind: "look-and-choose",
          zone: "hand",
          player: "that-player",
          min: { cardsInHand: { target: 0 } },
          max: { cardsInHand: { target: 0 } },
          destination: "library-top",
          leftover: "stay",
        },
      },
      {
        kind: "search-library",
        whose: { target: 0 },
        filter: {},
        destination: "hand",
        min: { thisWay: "put-into-library" },
        max: { thisWay: "put-into-library" },
      },
    ],
  },
});
