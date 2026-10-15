import { defineCard } from "../define.js";

// EDHREC rank 4429.
//
// Rulings:
//   [2020-08-07] You lose 2 life even if the target player has no nonland cards in their hand to
//     discard.

export default defineCard({
  name: "Thoughtseize",
  manaCost: "{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Target player reveals their hand. You choose a nonland card from it. That player discards that card. You lose 2 life.",
  targets: ["player"],
  effect: {
    kind: "sequence",
    effects: [{ kind: "discard-chosen", target: 0, filter: { notTypes: ["land"] } }, { kind: "lose-life", amount: 2 }],
  },
});
