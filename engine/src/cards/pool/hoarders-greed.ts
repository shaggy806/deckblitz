import { defineCard } from "../define.js";

// EDHREC rank 10031.
//
// "If you win, repeat this process": the `clash` effect's `repeat` — the
// life and the cards again, then another clash, until one is lost.
//
// Rulings:
//   [2007-10-01] The effect will automatically repeat itself until its controller doesn't win the
//     clash. There's no other way to stop it.

export default defineCard({
  name: "Hoarder's Greed",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["sorcery"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "lose-life", amount: 2 },
      { kind: "draw", amount: 2 },
      { kind: "clash", repeat: { kind: "sequence", effects: [{ kind: "lose-life", amount: 2 }, { kind: "draw", amount: 2 }] } },
    ],
  },
  text: "You lose 2 life and draw two cards, then clash with an opponent. If you win, repeat this process. (Each clashing player reveals the top card of their library, then puts that card on their choice of the top or bottom. A player wins if their card had a greater mana value.)",
});
