import { defineCard } from "../define.js";

// EDHREC rank 17080.

export default defineCard({
  name: "Nahiri's Binding",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature or planeswalker\nEnchanted permanent can't attack or block, and its activated abilities can't be activated.",
  targets: [{ kind: "permanent", whose: "any", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
  static: [
    {
      affects: { scope: "attached" },
      restrictions: ["cant-attack", "cant-block"],
      prohibits: [{ act: "activate", who: "each-player", of: { hostOfSource: true } }],
      text: "Enchanted permanent can't attack or block, and its activated abilities can't be activated.",
    },
  ],
});
