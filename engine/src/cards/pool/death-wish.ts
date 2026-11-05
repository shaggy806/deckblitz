import { defineCard } from "../define.js";

// EDHREC rank 29041.

export default defineCard({
  name: "Death Wish",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "You may put a card you own from outside the game into your hand. You lose half your life, rounded up. Exile Death Wish.",
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "search-library",
        filter: {},
        destination: "hand",
        min: 0,
        max: 1,
        outside: "only",
      },
      { kind: "lose-life", amount: { half: { lifeTotal: "you" }, round: "up" } },
    ],
  },
  exileOnResolve: true,
});
