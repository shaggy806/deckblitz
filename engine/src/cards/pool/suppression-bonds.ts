import { defineCard } from "../define.js";

// Rulings:
//   [2015-06-22] Suppression Bonds can enchant any nonland permanent, not just a creature.
//   [2015-06-22] The loyalty abilities of planeswalkers are activated abilities.

export default defineCard({
  name: "Suppression Bonds",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant nonland permanent\nEnchanted permanent can't attack or block, and its activated abilities can't be activated.",
  targets: ["nonland-permanent"],
  static: [
    {
      affects: { scope: "attached" },
      restrictions: ["cant-attack", "cant-block"],
      prohibits: { who: "each-player", abilitiesOf: { hostOfSource: true } },
      text: "Enchanted permanent can't attack or block, and its activated abilities can't be activated.",
    },
  ],
});
