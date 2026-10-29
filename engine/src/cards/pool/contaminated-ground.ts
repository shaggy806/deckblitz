import { defineCard } from "../define.js";

const TRIGGER = "Whenever enchanted land becomes tapped, its controller loses 2 life.";

// Rule 305.7: the land loses its other land types and the abilities printed
// on it and taps for {B}; its name and supertypes stay (the ruling).
export default defineCard({
  name: "Contaminated Ground",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant land\nEnchanted land is a Swamp.\n${TRIGGER}`,
  targets: ["land"],
  static: [
    {
      affects: { scope: "attached" },
      setSubtypes: ["Swamp"],
      text: "Enchanted land is a Swamp.",
    },
  ],
  triggered: [
    {
      trigger: { on: "becomes-tapped", who: "attached" },
      targets: [],
      effect: { kind: "lose-life", amount: 2, who: "trigger-controller" },
      resolve: null,
      text: TRIGGER,
    },
  ],
});
