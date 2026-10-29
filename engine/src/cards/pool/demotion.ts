import { defineCard } from "../define.js";

export default defineCard({
  name: "Demotion",
  manaCost: "{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nEnchanted creature can't block, and its activated abilities can't be activated.",
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      restrictions: ["cant-block"],
      prohibits: { who: "each-player", abilitiesOf: { hostOfSource: true } },
      text: "Enchanted creature can't block, and its activated abilities can't be activated.",
    },
  ],
});
