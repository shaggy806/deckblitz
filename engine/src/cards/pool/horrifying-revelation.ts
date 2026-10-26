import { defineCard } from "../define.js";

// Each half happens even if the other can't (the ruling).
export default defineCard({
  name: "Horrifying Revelation",
  manaCost: "{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Target player discards a card, then mills a card.",
  targets: ["player"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "discard", target: 0, amount: 1 },
      { kind: "mill", target: 0, amount: 1 },
    ],
  },
});
