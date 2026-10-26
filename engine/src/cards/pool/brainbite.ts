import { defineCard } from "../define.js";

// EDHREC rank 27276.
//
// Rulings:
//   [2009-05-01] When Brainbite resolves, you'll draw a card even if the targeted opponent has no
//     cards in hand.
//   [2009-05-01] You may target an opponent who has no cards in hand.
export default defineCard({
  name: "Brainbite",
  manaCost: "{2}{U}{B}",
  colors: ["U", "B"],
  types: ["sorcery"],
  text: "Target opponent reveals their hand. You choose a card from it. That player discards that card.\nDraw a card.",
  targets: ["opponent"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "discard-chosen", target: 0 },
      { kind: "draw", amount: 1 },
    ],
  },
});
