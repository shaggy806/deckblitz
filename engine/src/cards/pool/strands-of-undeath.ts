import { defineCard } from "../define.js";

export default defineCard({
  name: "Strands of Undeath",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nWhen this Aura enters, target player discards two cards.\n{B}: Regenerate enchanted creature.",
  targets: ["creature"],
  activated: [
    {
      cost: { mana: "{B}", tap: false },
      targets: [],
      effect: { kind: "regenerate", target: "attached" },
      resolve: null,
      text: "{B}: Regenerate enchanted creature.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["player"],
      effect: { kind: "discard", target: 0, amount: 2 },
      resolve: null,
      text: "When this Aura enters, target player discards two cards.",
    },
  ],
});
