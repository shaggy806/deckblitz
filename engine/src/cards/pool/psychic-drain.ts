import { defineCard } from "../define.js";

export default defineCard({
  name: "Psychic Drain",
  manaCost: "{X}{U}{B}",
  colors: ["U", "B"],
  types: ["sorcery"],
  text: "Target player mills X cards and you gain X life.",
  targets: ["player"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "mill", target: 0, amount: "x" },
      { kind: "gain-life", amount: "x" },
    ],
  },
});
