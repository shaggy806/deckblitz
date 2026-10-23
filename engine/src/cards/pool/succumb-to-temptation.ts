import { defineCard } from "../define.js";

// EDHREC rank 11363.

export default defineCard({
  name: "Succumb to Temptation",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "You draw two cards and you lose 2 life.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: 2 },
      { kind: "lose-life", amount: 2 },
    ],
  },
});
