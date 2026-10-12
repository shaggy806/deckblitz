import { defineCard } from "../define.js";

export default defineCard({
  name: "Void Helix",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Void Helix deals 5 damage to any target and you gain 5 life.",
  targets: ["any-target"],
  effect: {
    kind: "sequence",
    effects: [{ kind: "damage", amount: 5, target: 0 }, { kind: "gain-life", amount: 5 }],
  },
});
