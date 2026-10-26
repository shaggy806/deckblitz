import { defineCard } from "../define.js";

export default defineCard({
  name: "Mask of Law and Grace",
  manaCost: "{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nEnchanted creature has protection from black and from red.",
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      protection: { colors: ["B", "R"] },
      text: "Enchanted creature has protection from black and from red.",
    },
  ],
});
