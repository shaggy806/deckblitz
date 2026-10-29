import { defineCard } from "../define.js";

// Phyrexia: All Will Be One (ONE). EDHREC rank 6554.
//
// Nahiri's Binding's lock, enchanting an artifact too. Loyalty abilities are
// activated abilities (the ruling), so a planeswalker's are barred as well.
export default defineCard({
  name: "Planar Disruption",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant artifact, creature, or planeswalker\nEnchanted permanent can't attack or block, and its activated abilities can't be activated.",
  targets: [{ kind: "permanent", whose: "any", filter: { typesAnyOf: ["artifact", "creature", "planeswalker"] } }],
  static: [
    {
      affects: { scope: "attached" },
      restrictions: ["cant-attack", "cant-block"],
      prohibits: { who: "each-player", abilitiesOf: { hostOfSource: true } },
      text: "Enchanted permanent can't attack or block, and its activated abilities can't be activated.",
    },
  ],
});
