import { defineCard } from "../define.js";

export default defineCard({
  name: "Sovereign's Bite",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Target player loses 3 life and you gain 3 life.",
  targets: ["player"],
  effect: {
    kind: "sequence",
    effects: [{ kind: "lose-life", amount: 3, target: 0 }, { kind: "gain-life", amount: 3 }],
  },
});
