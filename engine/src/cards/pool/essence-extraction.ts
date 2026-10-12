import { defineCard } from "../define.js";

export default defineCard({
  name: "Essence Extraction",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Essence Extraction deals 3 damage to target creature and you gain 3 life.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [{ kind: "damage", amount: 3, target: 0 }, { kind: "gain-life", amount: 3 }],
  },
});
