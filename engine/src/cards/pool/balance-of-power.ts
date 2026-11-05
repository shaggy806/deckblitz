import { defineCard } from "../define.js";

// Rulings:
//   The number of cards is counted during resolution.

export default defineCard({
  name: "Balance of Power",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "If target opponent has more cards in hand than you, draw cards equal to the difference.",
  targets: ["opponent"],
  effect: { kind: "draw", amount: { difference: [{ cardsInHand: { target: 0 } }, { cardsInHand: "you" }] } },
});
