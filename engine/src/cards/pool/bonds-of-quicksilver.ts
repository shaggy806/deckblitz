import { defineCard } from "../define.js";

// EDHREC rank 27605.

export default defineCard({
  name: "Bonds of Quicksilver",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  keywords: ["flash"],
  text: "Flash (You may cast this spell any time you could cast an instant.)\nEnchant creature\nEnchanted creature doesn't untap during its controller's untap step.",
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      restrictions: ["doesnt-untap"],
      text: "Enchanted creature doesn't untap during its controller's untap step.",
    },
  ],
});
