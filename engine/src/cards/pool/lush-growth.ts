import { defineCard } from "../define.js";

// Rule 305.7: the land loses its other land types and the abilities printed
// on it, and taps for {R}, {G} or {W} (the ruling).
export default defineCard({
  name: "Lush Growth",
  manaCost: "{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant land\nEnchanted land is a Mountain, Forest, and Plains.",
  targets: ["land"],
  static: [
    {
      affects: { scope: "attached" },
      setSubtypes: ["Mountain", "Forest", "Plains"],
      text: "Enchanted land is a Mountain, Forest, and Plains.",
    },
  ],
});
