import { defineCard } from "../define.js";

// EDHREC rank 27345.
//
// Rulings:
//   [2012-05-01] If the targeted player has fewer than two cards in their hand, that player will
//     still lose 2 life (and discard one card, if applicable).

export default defineCard({
  name: "Mental Agony",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Target player discards two cards and loses 2 life.",
  targets: ["player"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "discard", target: 0, amount: 2 },
      { kind: "lose-life", amount: 2, target: 0 },
    ],
  },
});
