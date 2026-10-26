import { defineCard } from "../define.js";

const TEXT = "Whenever enchanted land becomes tapped, its controller loses 2 life.";

export default defineCard({
  name: "Corrupted Roots",
  manaCost: "{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant Forest or Plains\n${TEXT}`,
  // Enchant Forest or Plains: by subtype, not name (the ruling).
  targets: [{ kind: "permanent", filter: { type: "land", subtypes: ["Forest", "Plains"] } }],
  triggered: [
    {
      trigger: { on: "becomes-tapped", who: "attached" },
      targets: [],
      effect: { kind: "lose-life", amount: 2, who: "trigger-controller" },
      resolve: null,
      text: TEXT,
    },
  ],
});
