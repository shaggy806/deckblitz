import { defineCard } from "../define.js";

// Mirage (MIR). EDHREC rank 18191.
//
// Rulings:
//   If you attempt to halve a negative life total, you halve 0. This means that the life total
//   stays the same. A life total of -10 would remain -10.
//
// Half of a negative total is negative, and a loss amount clamps to 0.

export default defineCard({
  name: "Infernal Contract",
  manaCost: "{B}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Draw four cards. You lose half your life, rounded up.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: 4 },
      { kind: "lose-life", amount: { half: { lifeTotal: "you" }, round: "up" } },
    ],
  },
});
