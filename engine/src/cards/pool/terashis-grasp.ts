import { defineCard } from "../define.js";

export default defineCard({
  name: "Terashi's Grasp",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["sorcery"],
  subtypes: ["Arcane"],
  text: "Destroy target artifact or enchantment. You gain life equal to its mana value.",
  targets: ["artifact-or-enchantment"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      { kind: "gain-life", amount: { manaValueOf: 0 } },
    ],
  },
});
