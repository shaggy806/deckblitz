import { defineCard } from "../define.js";

// EDHREC rank 22558. Infernal Contract's text and shape.

export default defineCard({
  name: "Cruel Bargain",
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
