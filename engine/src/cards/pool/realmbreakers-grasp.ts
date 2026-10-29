import { defineCard } from "../define.js";

// EDHREC rank 15221.

export default defineCard({
  name: "Realmbreaker's Grasp",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant artifact or creature\nEnchanted permanent can't attack or block, and its activated abilities can't be activated unless they're mana abilities.",
  targets: ["artifact-or-creature"],
  static: [
    {
      affects: { scope: "attached" },
      restrictions: ["cant-attack", "cant-block"],
      prohibits: { who: "each-player", abilitiesOf: { hostOfSource: true }, exceptManaAbilities: true },
      text: "Enchanted permanent can't attack or block, and its activated abilities can't be activated unless they're mana abilities.",
    },
  ],
});
