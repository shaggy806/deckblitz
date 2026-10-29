import { defineCard } from "../define.js";

export default defineCard({
  name: "Heart of Light",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature (Target a creature as you cast this. This card enters attached to that creature.)\nPrevent all damage that would be dealt to and dealt by enchanted creature.",
  targets: ["creature"],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-deal-damage", to: "attached", prevent: true },
      text: "Prevent all damage that would be dealt to enchanted creature.",
    },
    {
      affects: { scope: "self" },
      replacement: { event: "would-deal-damage", fromAttached: true, prevent: true },
      text: "Prevent all damage that would be dealt by enchanted creature.",
    },
  ],
});
