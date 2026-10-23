import { defineCard } from "../define.js";

export default defineCard({
  name: "Live Fast",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "You draw two cards, lose 2 life, and get {E}{E} (two energy counters).",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: 2 },
      { kind: "lose-life", amount: 2, who: "you" },
      { kind: "get-energy", amount: 2 },
    ],
  },
});
