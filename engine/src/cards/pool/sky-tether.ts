import { defineCard } from "../define.js";

// EDHREC rank 22626. Layer 6 by timestamp: flying granted later by another
// effect wins (the ruling).

export default defineCard({
  name: "Sky Tether",
  manaCost: "{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nEnchanted creature has defender and loses flying.",
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantKeywords: ["defender"],
      loseKeywords: ["flying"],
      text: "Enchanted creature has defender and loses flying.",
    },
  ],
});
