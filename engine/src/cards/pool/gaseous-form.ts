import { defineCard } from "../define.js";

// "To and dealt by": two statics, as Muzzle's host-as-source and
// Inviolability's host-as-recipient.
export default defineCard({
  name: "Gaseous Form",
  manaCost: "{2}{U}",
  colors: ["U"],
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
