import { defineCard } from "../define.js";

const PREVENT_TEXT = "Prevent all combat damage that would be dealt to and dealt by enchanted creature.";

export default defineCard({
  name: "Ghostly Possession",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\nEnchanted creature has flying.\n${PREVENT_TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantKeywords: ["flying"],
      text: "Enchanted creature has flying.",
    },
    {
      affects: { scope: "self" },
      replacement: { event: "would-deal-damage", to: "attached", combat: true, prevent: true },
      text: PREVENT_TEXT,
    },
    {
      affects: { scope: "self" },
      replacement: { event: "would-deal-damage", fromAttached: true, combat: true, prevent: true },
      text: PREVENT_TEXT,
    },
  ],
});
