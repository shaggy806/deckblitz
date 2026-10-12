import { defineCard } from "../define.js";

export default defineCard({
  name: "Agonizing Syphon",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Agonizing Syphon deals 3 damage to any target and you gain 3 life.",
  targets: ["any-target"],
  effect: {
    kind: "sequence",
    effects: [{ kind: "damage", amount: 3, target: 0 }, { kind: "gain-life", amount: 3 }],
  },
});
