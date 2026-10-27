import { defineCard } from "../define.js";

// EDHREC rank 25841.

export default defineCard({
  name: "Frozen Solid",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nEnchanted creature doesn't untap during its controller's untap step.\nWhen enchanted creature is dealt damage, destroy it.",
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      restrictions: ["doesnt-untap"],
      text: "Enchanted creature doesn't untap during its controller's untap step.",
    },
  ],
  triggered: [
    {
      trigger: { on: "dealt-damage", who: "attached" },
      targets: [],
      effect: { kind: "destroy", target: "trigger-object" },
      resolve: null,
      text: "When enchanted creature is dealt damage, destroy it.",
    },
  ],
});
