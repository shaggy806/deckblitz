import { defineCard } from "../define.js";

// EDHREC rank 26293. Curator's Ward's grant, of phasing.

export default defineCard({
  name: "Teferi's Curse",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant artifact or creature\nEnchanted permanent has phasing. (It phases in or out before its controller untaps during each of their untap steps. While it's phased out, it's treated as though it doesn't exist.)",
  targets: ["artifact-or-creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantKeywords: ["phasing"],
      text: "Enchanted permanent has phasing.",
    },
  ],
});
