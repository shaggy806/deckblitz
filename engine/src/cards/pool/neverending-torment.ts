import { defineCard } from "../define.js";

// EDHREC rank 24293. "X cards", a quantity: X must be found while there are
// X (rule 701.23d), X read as each copy resolves — the hand it's read from
// keeps growing, epic having stopped its owner casting spells (rule 702.50a).

export default defineCard({
  name: "Neverending Torment",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Search target player's library for X cards, where X is the number of cards in your hand, and exile them. Then that player shuffles.\nEpic (For the rest of the game, you can't cast spells. At the beginning of each of your upkeeps, copy this spell except for its epic ability. You may choose a new target for the copy.)",
  targets: ["player"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "search-library",
        whose: { target: 0 },
        filter: {},
        destination: "exile",
        min: { cardsInHand: "you" },
        max: { cardsInHand: "you" },
      },
      { kind: "epic" },
    ],
  },
});
