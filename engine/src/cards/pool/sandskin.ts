import { defineCard } from "../define.js";

// EDHREC rank 28148.
//
// "To and by enchanted creature" is two statics: one naming the host as the
// recipient, one as the source (Muzzle's), both combat damage only.

export default defineCard({
  name: "Sandskin",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nPrevent all combat damage that would be dealt to and dealt by enchanted creature.",
  targets: ["creature"],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-deal-damage", to: "attached", combat: true, prevent: true },
      text: "Prevent all combat damage that would be dealt to enchanted creature.",
    },
    {
      affects: { scope: "self" },
      replacement: { event: "would-deal-damage", fromAttached: true, combat: true, prevent: true },
      text: "Prevent all combat damage that would be dealt by enchanted creature.",
    },
  ],
});
