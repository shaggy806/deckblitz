import { defineCard } from "../define.js";

export default defineCard({
  name: "Harrowing Journey",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Target player draws three cards and loses 3 life.",
  targets: ["player"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: 3, target: 0 },
      { kind: "lose-life", amount: 3, target: 0 },
    ],
  },
});
