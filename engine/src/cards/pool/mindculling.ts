import { defineCard } from "../define.js";

// EDHREC rank 29485.
//
// Rulings:
//   [2011-06-01] You must be able to target an opponent to cast Mindculling. If that opponent is
//     an illegal target when Mindculling tries to resolve, it’ll be countered and will have no
//     effect. You won’t draw two cards.
//   [2011-06-01] If the opponent has one card in hand, that player will discard that card and you
//     will draw two cards. If the opponent has no cards in hand, you will draw two cards.

export default defineCard({
  name: "Mindculling",
  manaCost: "{5}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "You draw two cards and target opponent discards two cards.",
  targets: ["opponent"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: 2 },
      { kind: "discard", target: 0, amount: 2 },
    ],
  },
});
