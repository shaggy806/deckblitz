import { defineCard } from "../define.js";

const TEXT = "Whenever enchanted land becomes tapped, its controller mills three cards.";

export default defineCard({
  name: "Chronic Flooding",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant land\n${TEXT}`,
  targets: ["land"],
  triggered: [
    {
      trigger: { on: "becomes-tapped", who: "attached" },
      targets: [],
      effect: { kind: "mill", target: "trigger-controller", amount: 3 },
      resolve: null,
      text: TEXT,
    },
  ],
});
