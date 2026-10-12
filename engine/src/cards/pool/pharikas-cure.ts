import { defineCard } from "../define.js";

export default defineCard({
  name: "Pharika's Cure",
  manaCost: "{B}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Pharika's Cure deals 2 damage to target creature and you gain 2 life.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [{ kind: "damage", amount: 2, target: 0 }, { kind: "gain-life", amount: 2 }],
  },
});
