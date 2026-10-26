import { defineCard } from "../define.js";

// Coldsnap (CSP). EDHREC rank 9778.

export default defineCard({
  name: "Perilous Research",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Draw two cards, then sacrifice a permanent.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: 2 },
      { kind: "sacrifice", who: "you", filter: {}, count: 1 },
    ],
  },
});
