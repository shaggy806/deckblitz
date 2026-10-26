import { defineCard } from "../define.js";

export default defineCard({
  name: "Curse of Chains",
  manaCost: "{1}{W/U}",
  colors: ["W", "U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nAt the beginning of each upkeep, tap enchanted creature.",
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targets: [],
      effect: { kind: "tap", target: "attached" },
      resolve: null,
      text: "At the beginning of each upkeep, tap enchanted creature.",
    },
  ],
});
