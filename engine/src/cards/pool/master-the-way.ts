import { defineCard } from "../define.js";

// EDHREC rank 17925. The hand is counted after the draw (the ruling); an
// illegal target means no draw either — the whole spell doesn't resolve.

export default defineCard({
  name: "Master the Way",
  manaCost: "{3}{U}{R}",
  colors: ["U", "R"],
  types: ["sorcery"],
  text: "Draw a card. Master the Way deals damage to any target equal to the number of cards in your hand.",
  targets: ["any-target"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: 1 },
      { kind: "damage", target: 0, amount: { cardsInHand: "you" } },
    ],
  },
});
