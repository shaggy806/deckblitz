import { defineCard } from "../define.js";

export default defineCard({
  name: "Bound in Silence",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["kindred", "enchantment"],
  subtypes: ["Rebel", "Aura"],
  text: "Enchant creature\nEnchanted creature can't attack or block.",
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      restrictions: ["cant-attack", "cant-block"],
      text: "Enchanted creature can't attack or block.",
    },
  ],
});
