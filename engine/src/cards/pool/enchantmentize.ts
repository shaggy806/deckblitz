import { defineCard } from "../define.js";

// Playtest card: One with the Stars' text. `setTypes` (layer 4) replaces its
// card types; the subtypes that went only with a lost type go too while
// supertypes stay (the rulings), and a Vehicle crewed into a creature stays
// an enchantment after the crew wears off.

export default defineCard({
  name: "Enchantmentize",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature or enchantment\nEnchanted permanent is an enchantment and loses all other card types. (It still has its abilities, but it's no longer a creature.)",
  targets: ["creature-or-enchantment"],
  static: [
    {
      affects: { scope: "attached" },
      setTypes: ["enchantment"],
      text: "Enchanted permanent is an enchantment and loses all other card types.",
    },
  ],
});
