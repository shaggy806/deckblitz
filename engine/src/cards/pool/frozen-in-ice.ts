import { defineCard } from "../define.js";

export default defineCard({
  name: "Frozen in Ice",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nWhen this Aura enters, tap enchanted creature.\nEnchanted creature loses all abilities and can't become untapped.",
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "tap", target: "attached" },
      resolve: null,
      text: "When this Aura enters, tap enchanted creature.",
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      loseAllAbilities: true,
      prohibits: [{ act: "untap", object: { hostOfSource: true } }],
      text: "Enchanted creature loses all abilities and can't become untapped.",
    },
  ],
});
