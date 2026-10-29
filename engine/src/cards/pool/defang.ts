import { defineCard } from "../define.js";

export default defineCard({
  name: "Defang",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nPrevent all damage that would be dealt by enchanted creature.",
  targets: ["creature"],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-deal-damage", fromAttached: true, prevent: true },
      text: "Prevent all damage that would be dealt by enchanted creature.",
    },
  ],
});
