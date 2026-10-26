import { defineCard } from "../define.js";

export default defineCard({
  name: "Blessing of Leeches",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  keywords: ["flash"],
  text: "Flash\nEnchant creature\nAt the beginning of your upkeep, you lose 1 life.\n{0}: Regenerate enchanted creature.",
  targets: ["creature"],
  activated: [
    {
      cost: { mana: "{0}", tap: false },
      targets: [],
      effect: { kind: "regenerate", target: "attached" },
      resolve: null,
      text: "{0}: Regenerate enchanted creature.",
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "lose-life", amount: 1 },
      resolve: null,
      text: "At the beginning of your upkeep, you lose 1 life.",
    },
  ],
});
