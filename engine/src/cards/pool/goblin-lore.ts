import { defineCard } from "../define.js";

// EDHREC rank 14728.

export default defineCard({
  name: "Goblin Lore",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Draw four cards, then discard three cards at random.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: 4 },
      { kind: "discard", target: "you", amount: 3, random: true },
    ],
  },
});
