import { defineCard } from "../define.js";

export default defineCard({
  name: "Soul Feast",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Target player loses 4 life and you gain 4 life.",
  targets: ["player"],
  effect: {
    kind: "sequence",
    effects: [{ kind: "lose-life", amount: 4, target: 0 }, { kind: "gain-life", amount: 4 }],
  },
});
