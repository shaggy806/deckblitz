import { defineCard } from "../define.js";

export default defineCard({
  name: "Candletrap",
  manaCost: "{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nEnchanted creature has defender.\nPrevent all combat damage that would be dealt by enchanted creature.\nCoven — {2}{W}, Sacrifice this Aura: Exile enchanted creature. Activate only if you control three or more creatures with different powers.",
  targets: ["creature"],
  activated: [
    {
      cost: { mana: "{2}{W}", tap: false, sacrifice: "self" },
      targets: [],
      effect: { kind: "exile", target: "attached" },
      resolve: null,
      text: "Coven — {2}{W}, Sacrifice this Aura: Exile enchanted creature. Activate only if you control three or more creatures with different powers.",
      condition: { kind: "coven" },
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantKeywords: ["defender"],
      text: "Enchanted creature has defender.",
    },
    {
      affects: { scope: "self" },
      replacement: { event: "would-deal-damage", fromAttached: true, combat: true, prevent: true },
      text: "Prevent all combat damage that would be dealt by enchanted creature.",
    },
  ],
});
