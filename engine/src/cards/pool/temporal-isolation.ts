import { defineCard } from "../define.js";

// EDHREC rank 16787.

export default defineCard({
  name: "Temporal Isolation",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  keywords: ["flash"],
  text: "Flash\nEnchant creature\nEnchanted creature has shadow. (It can block or be blocked by only creatures with shadow.)\nPrevent all damage that would be dealt by enchanted creature.",
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantKeywords: ["shadow"],
      text: "Enchanted creature has shadow.",
    },
    {
      affects: { scope: "self" },
      replacement: { event: "would-deal-damage", fromAttached: true, prevent: true },
      text: "Prevent all damage that would be dealt by enchanted creature.",
    },
  ],
});
