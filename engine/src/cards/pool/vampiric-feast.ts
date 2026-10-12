import { defineCard } from "../define.js";

export default defineCard({
  name: "Vampiric Feast",
  manaCost: "{5}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Vampiric Feast deals 4 damage to any target and you gain 4 life.",
  targets: ["any-target"],
  effect: {
    kind: "sequence",
    effects: [{ kind: "damage", amount: 4, target: 0 }, { kind: "gain-life", amount: 4 }],
  },
});
