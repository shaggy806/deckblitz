import { defineCard } from "../define.js";

// EDHREC rank 21220.

export default defineCard({
  name: "Treacherous Link",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nAll damage that would be dealt to enchanted creature is dealt to its controller instead.",
  targets: ["creature"],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-deal-damage", to: "attached", redirect: "recipient-controller" },
      text: "All damage that would be dealt to enchanted creature is dealt to its controller instead.",
    },
  ],
});
