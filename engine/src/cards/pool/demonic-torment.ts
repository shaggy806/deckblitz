import { defineCard } from "../define.js";

export default defineCard({
  name: "Demonic Torment",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nEnchanted creature can't attack.\nPrevent all combat damage that would be dealt by enchanted creature.",
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      restrictions: ["cant-attack"],
      text: "Enchanted creature can't attack.",
    },
    {
      affects: { scope: "self" },
      replacement: { event: "would-deal-damage", fromAttached: true, combat: true, instead: { prevent: true } },
      text: "Prevent all combat damage that would be dealt by enchanted creature.",
    },
  ],
});
