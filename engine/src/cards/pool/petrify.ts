import { defineCard } from "../define.js";

// The Lost Caverns of Ixalan (LCI). EDHREC rank 8693.
//
// Nahiri's Binding's lock, enchanting an artifact or creature.
export default defineCard({
  name: "Petrify",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant artifact or creature\nEnchanted permanent can't attack or block, and its activated abilities can't be activated.",
  targets: [{ kind: "permanent", whose: "any", filter: { typesAnyOf: ["artifact", "creature"] } }],
  static: [
    {
      affects: { scope: "attached" },
      restrictions: ["cant-attack", "cant-block"],
      prohibits: { who: "each-player", abilitiesOf: { hostOfSource: true } },
      text: "Enchanted permanent can't attack or block, and its activated abilities can't be activated.",
    },
  ],
});
