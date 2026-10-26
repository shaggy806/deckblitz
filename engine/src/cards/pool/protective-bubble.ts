import { defineCard } from "../define.js";

export default defineCard({
  name: "Protective Bubble",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nEnchanted creature can't be blocked and has shroud. (It can't be the target of spells or abilities.)",
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantKeywords: ["unblockable", "shroud"],
      text: "Enchanted creature can't be blocked and has shroud.",
    },
  ],
});
