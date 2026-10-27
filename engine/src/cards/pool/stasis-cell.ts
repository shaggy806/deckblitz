import { defineCard } from "../define.js";

// Ravnica: City of Guilds (RAV).

export default defineCard({
  name: "Stasis Cell",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nEnchanted creature doesn't untap during its controller's untap step.\n{3}{U}: Attach this Aura to target creature.",
  targets: ["creature"],
  activated: [
    {
      cost: { mana: "{3}{U}", tap: false },
      targets: ["creature"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "{3}{U}: Attach this Aura to target creature.",
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      restrictions: ["doesnt-untap"],
      text: "Enchanted creature doesn't untap during its controller's untap step.",
    },
  ],
});
