import { defineCard } from "../define.js";

// EDHREC rank 20421.

export default defineCard({
  name: "Render Inert",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Remove up to five counters from target permanent.\nDraw a card.",
  targets: ["permanent"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "remove-counters", target: 0, counter: "any", count: 5, upTo: true },
      { kind: "draw", amount: 1 },
    ],
  },
});
