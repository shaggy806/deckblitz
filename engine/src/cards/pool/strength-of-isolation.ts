import { defineCard } from "../define.js";

// Torment. EDHREC rank 26891.

export default defineCard({
  name: "Strength of Isolation",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  madness: { cost: "{W}" },
  text: "Enchant creature\nEnchanted creature gets +1/+2 and has protection from black.\nMadness {W} (If you discard this card, discard it into exile. When you do, cast it for its madness cost or put it into your graveyard.)",
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [1, 2],
      protection: { colors: ["B"] },
      text: "Enchanted creature gets +1/+2 and has protection from black.",
    },
  ],
});
