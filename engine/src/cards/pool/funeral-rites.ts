import { defineCard } from "../define.js";

// Theros Beyond Death.

export default defineCard({
  name: "Funeral Rites",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "You draw two cards, lose 2 life, then mill two cards.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: 2 },
      { kind: "lose-life", amount: 2, who: "you" },
      { kind: "mill", target: "you", amount: 2 },
    ],
  },
});
